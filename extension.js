const vscode = require('vscode');
const {run} = require('./src/cli/index');

async function activate(context) {
    const disposable = vscode.commands.registerCommand('dev-arch.createProject', async () => {
        const panel = vscode.window.createWebviewPanel(
            'devArch',
            'dev-arch',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'getToken') {
                const existing = await context.secrets.get('devarch-github-token');
                panel.webview.postMessage({ type: 'tokenStatus', hasToken: !!existing });
            }

            if (message.command === 'saveToken') {
                await context.secrets.store('devarch-github-token', message.token);
                panel.webview.postMessage({ type: 'tokenSaved' });
            }

            if (message.command === 'deleteToken') {
                await context.secrets.delete('devarch-github-token');
                panel.webview.postMessage({ type: 'tokenDeleted' });
            }

            if (message.command === 'openTokenPage') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/settings/tokens/new?scopes=repo&description=dev-arch'));
            }

            if (message.command === 'create') {
                const uri = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select project location'
                });

                if (!uri || uri.length === 0) return;

                const projectPath = uri[0].fsPath;

                let token = null;
                if (message.github) {
                    token = await context.secrets.get('devarch-github-token');
                    if (!token) {
                        panel.webview.postMessage({ type: 'needToken' });
                        return;
                    }
                }

                panel.webview.postMessage({ type: 'progress', message: 'Setting up project structure...' });

                try {
                    const fullPath = await run({
                        name: message.name,
                        type: message.type,
                        projectPath,
                        git: message.git,
                        github: message.github,
                        tailwind: message.tailwind,
                        full: message.full,
                        visibility: message.visibility,
                        typescript: message.typescript,
                        token
                    });

                    panel.webview.postMessage({ type: 'success', path: fullPath });
                    vscode.window.showInformationMessage(`Project '${message.name}' created successfully!`);
                } catch (err) {
                    panel.webview.postMessage({ type: 'error', message: err.message });
                    vscode.window.showErrorMessage(`Error: ${err.message}`);
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); padding: 24px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  h1 { font-size: 16px; font-weight: 600; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--vscode-panel-border); }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--vscode-descriptionForeground); margin-bottom: 10px; }
  label { display: block; margin-bottom: 4px; font-size: 13px; }
  input, select { width: 100%; padding: 6px 8px; margin-bottom: 12px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; font-size: 13px; }
  input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }
  .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
  .checkbox-row input { width: auto; margin: 0; cursor: pointer; }
  .btn { width: 100%; padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin-top: 20px; }
  .btn:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { width: 100%; padding: 6px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 8px; }
  .progress { display: none; margin-top: 16px; }
  .progress-bar { height: 2px; background: var(--vscode-panel-border); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--vscode-progressBar-background); border-radius: 2px; animation: indeterminate 1.5s ease infinite; }
  @keyframes indeterminate { 0% { transform: translateX(-100%); width: 60%; } 100% { transform: translateX(200%); width: 60%; } }
  .progress-text { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; }
  .success { display: none; margin-top: 16px; padding: 12px; background: var(--vscode-inputValidation-infoBackground); border: 1px solid var(--vscode-inputValidation-infoBorder); border-radius: 4px; }
  .success-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .success-path { font-size: 11px; color: var(--vscode-descriptionForeground); font-family: var(--vscode-editor-font-family); word-break: break-all; }
  .error { display: none; margin-top: 16px; padding: 12px; background: var(--vscode-inputValidation-errorBackground); border: 1px solid var(--vscode-inputValidation-errorBorder); border-radius: 4px; font-size: 13px; }
  .token-area { display: none; margin-top: 12px; padding: 12px; border: 1px solid var(--vscode-panel-border); border-radius: 4px; }
  .token-hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 10px; line-height: 1.6; }
</style>
</head>
<body>
<h1>dev-arch — Create Project</h1>

<div class="section">
  <div class="section-title">Project</div>
  <label>Name</label>
  <input type="text" id="name" placeholder="my-project" />
  <label>Type</label>
  <select id="type">
    <option value="react">React + Vite</option>
    <option value="fullstack">Fullstack (React + Node)</option>
    <option value="node">Node.js Backend</option>
    <option value="python">Python</option>
    <option value="web">Web (HTML/CSS/JS)</option>
  </select>
  <div id="language-row">
    <label>Language</label>
    <select id="language">
      <option value="js">JavaScript</option>
      <option value="ts">TypeScript</option>
    </select>
  </div>
</div>

<div class="section">
  <div class="section-title">Options</div>
  <div class="checkbox-group">
    <div class="checkbox-row" id="tailwind-row"><input type="checkbox" id="tailwind" /><label>Add Tailwind CSS</label></div>
    <div class="checkbox-row" id="full-row"><input type="checkbox" id="full" /><label>Full Boilerplate</label></div>
    <div class="checkbox-row"><input type="checkbox" id="git" /><label>Initialize Git</label></div>
    <div class="checkbox-row"><input type="checkbox" id="github" /><label>Create GitHub Repo</label></div>
  </div>

  <div class="token-area" id="github-token-area">
    <div id="token-section">
      <div class="token-hint">
        A GitHub Personal Access Token is required.<br><br>
        <strong>How to get one:</strong><br>
        1. Click the button below to open GitHub<br>
        2. Give it a name (e.g. "dev-arch")<br>
        3. Make sure "repo" scope is checked<br>
        4. Click "Generate token" and copy it<br>
        5. Paste it below
      </div>
      <button class="btn-secondary" onclick="vscode.postMessage({ command: 'openTokenPage' })">Open GitHub Token Page</button>
      <input type="password" id="token-input" placeholder="Paste your token here" />
      <button class="btn-secondary" onclick="saveToken()">Save Token Securely</button>
    </div>
    <div id="token-saved" style="display:none;">
      <div class="token-hint">✓ GitHub token saved securely in OS keychain.</div>
      <button class="btn-secondary" onclick="deleteToken()">Remove Token</button>
    </div>
  </div>
</div>

<div class="section" id="visibility-row" style="display:none;">
  <div class="section-title">Repository</div>
  <label>Visibility</label>
  <select id="visibility">
    <option value="public">Public</option>
    <option value="private">Private</option>
  </select>
</div>

<button class="btn" id="createBtn" onclick="submit()">Create Project</button>

<div class="progress" id="progress">
  <div class="progress-bar"><div class="progress-fill"></div></div>
  <div class="progress-text" id="progress-text">Creating project...</div>
</div>

<div class="success" id="success">
  <div class="success-title">Project created successfully!</div>
  <div class="success-path" id="success-path"></div>
</div>

<div class="error" id="error"></div>

<script>
  const vscode = acquireVsCodeApi();
  const typeSelect = document.getElementById('type');
  const languageRow = document.getElementById('language-row');
  const tailwindRow = document.getElementById('tailwind-row');
  const fullRow = document.getElementById('full-row');
  const visibilityRow = document.getElementById('visibility-row');
  const githubCheckbox = document.getElementById('github');
  const createBtn = document.getElementById('createBtn');

  function toggleOptions() {
    const type = typeSelect.value;
    const isReactOrFullstack = type === 'react' || type === 'fullstack';
    const isNodeOrFullstack = type === 'node' || type === 'fullstack';

    languageRow.style.display = isReactOrFullstack ? 'block' : 'none';
    tailwindRow.style.display = isReactOrFullstack ? 'flex' : 'none';
    fullRow.style.display = isNodeOrFullstack ? 'flex' : 'none';
    visibilityRow.style.display = githubCheckbox.checked ? 'block' : 'none';

    if (!isReactOrFullstack) {
      document.getElementById('tailwind').checked = false;
    }
    if (!isNodeOrFullstack) {
      document.getElementById('full').checked = false;
    }
  }

  typeSelect.addEventListener('change', toggleOptions);

  githubCheckbox.addEventListener('change', () => {
    toggleOptions();
    if (githubCheckbox.checked) {
      document.getElementById('github-token-area').style.display = 'block';
      vscode.postMessage({ command: 'getToken' });
    } else {
      document.getElementById('github-token-area').style.display = 'none';
    }
  });

  toggleOptions();

  window.addEventListener('message', event => {
    const msg = event.data;

    if (msg.type === 'tokenStatus') {
      if (msg.hasToken) {
        document.getElementById('token-section').style.display = 'none';
        document.getElementById('token-saved').style.display = 'block';
      } else {
        document.getElementById('token-section').style.display = 'block';
        document.getElementById('token-saved').style.display = 'none';
      }
    }

    if (msg.type === 'tokenSaved') {
      document.getElementById('token-input').value = '';
      document.getElementById('token-section').style.display = 'none';
      document.getElementById('token-saved').style.display = 'block';
    }

    if (msg.type === 'tokenDeleted') {
      document.getElementById('token-section').style.display = 'block';
      document.getElementById('token-saved').style.display = 'none';
    }

    if (msg.type === 'needToken') {
      document.getElementById('github-token-area').style.display = 'block';
      document.getElementById('token-section').style.display = 'block';
      createBtn.disabled = false;
      createBtn.textContent = 'Create Project';
      document.getElementById('progress').style.display = 'none';
    }

    if (msg.type === 'success') {
      document.getElementById('progress').style.display = 'none';
      document.getElementById('success').style.display = 'block';
      document.getElementById('success-path').textContent = msg.path;
      createBtn.disabled = false;
      createBtn.textContent = 'Create Another';
    }

    if (msg.type === 'error') {
      document.getElementById('progress').style.display = 'none';
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').textContent = msg.message;
      createBtn.disabled = false;
      createBtn.textContent = 'Create Project';
    }

    if (msg.type === 'progress') {
      document.getElementById('progress-text').textContent = msg.message;
    }
  });

  function saveToken() {
    const token = document.getElementById('token-input').value.trim();
    if (!token) { alert('Please paste your token first'); return; }
    vscode.postMessage({ command: 'saveToken', token });
  }

  function deleteToken() {
    vscode.postMessage({ command: 'deleteToken' });
  }

  function submit() {
    const name = document.getElementById('name').value.trim();
    if (!name) { alert('Please enter a project name'); return; }

    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';
    document.getElementById('progress').style.display = 'block';
    document.getElementById('success').style.display = 'none';
    document.getElementById('error').style.display = 'none';

    vscode.postMessage({
      command: 'create',
      name,
      type: document.getElementById('type').value,
      git: document.getElementById('git').checked,
      github: document.getElementById('github').checked,
      tailwind: document.getElementById('tailwind').checked,
      full: document.getElementById('full').checked,
      visibility: document.getElementById('visibility').value,
      typescript: document.getElementById('language').value === 'ts',
    });
  }
</script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };