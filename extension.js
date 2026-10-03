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
                    const msg = err.message || JSON.stringify(err) || 'Unknown error occurred';
                    panel.webview.postMessage({ type: 'error', message: msg });
                    vscode.window.showErrorMessage(`Error: ${msg}`);
                    console.error('devArch error:', err);
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

  body {
    font-family: var(--vscode-font-family);
    padding: 32px 24px;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
  }

  .container {
    max-width: 480px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 28px;
  }

  .header h1 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }

  .header p {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .card {
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .card-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 14px;
  }

  label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 5px;
    color: var(--vscode-foreground);
  }

  input[type="text"], input[type="password"], select {
    width: 100%;
    padding: 7px 10px;
    margin-bottom: 14px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: var(--vscode-font-family);
    transition: border-color 0.15s;
  }

  input[type="text"]:focus, input[type="password"]:focus, select:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  input[type="text"]:last-child, select:last-child {
    margin-bottom: 0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
  }

  .checkbox-row:hover {
    background: var(--vscode-list-hoverBackground);
    border-color: var(--vscode-panel-border);
  }

  .checkbox-row input[type="checkbox"] {
    width: 15px;
    height: 15px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--vscode-focusBorder);
  }

  .checkbox-row label {
    margin: 0;
    cursor: pointer;
    font-size: 13px;
    font-weight: 400;
  }

  .token-area {
    display: none;
    margin-top: 12px;
    padding: 14px;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
  }

  .token-hint {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 12px;
    line-height: 1.7;
  }

  .token-hint strong {
    color: var(--vscode-foreground);
  }

  .btn-github {
    width: 100%;
    padding: 7px 12px;
    margin-bottom: 10px;
    background: #238636;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-github:hover {
    background: #2ea043;
    transform: translateY(-1px);
  }

  .btn-save {
    width: 100%;
    padding: 7px 12px;
    margin-bottom: 8px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-save:hover {
    background: var(--vscode-button-hoverBackground);
    transform: translateY(-1px);
  }

  .btn-danger {
    width: 100%;
    padding: 7px 12px;
    background: transparent;
    color: #f85149;
    border: 1px solid #f8514940;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }

  .btn-danger:hover {
    background: #da363320;
    border-color: #f85149;
    transform: translateY(-1px);
  }

  .token-saved-state {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .token-badge {
    font-size: 11px;
    color: #3fb950;
    background: #3fb95015;
    border: 1px solid #3fb95030;
    border-radius: 4px;
    padding: 3px 8px;
    font-weight: 500;
  }

  .btn-primary {
    width: 100%;
    padding: 10px 16px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    margin-top: 16px;
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
    letter-spacing: 0.2px;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--vscode-button-hoverBackground);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .progress {
    display: none;
    margin-top: 16px;
    padding: 14px 16px;
    background: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
  }

  .progress-bar {
    height: 2px;
    background: var(--vscode-panel-border);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-fill {
    height: 100%;
    background: var(--vscode-progressBar-background);
    border-radius: 2px;
    animation: indeterminate 1.5s ease infinite;
  }

  @keyframes indeterminate {
    0% { transform: translateX(-100%); width: 60%; }
    100% { transform: translateX(200%); width: 60%; }
  }

  .progress-text {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
  }

  .success {
    display: none;
    margin-top: 16px;
    padding: 16px;
    background: #3fb95010;
    border: 1px solid #3fb95040;
    border-radius: 8px;
    animation: popIn 0.25s ease;
  }

  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }

  .success-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .success-icon {
    font-size: 16px;
  }

  .success-title {
    font-size: 13px;
    font-weight: 600;
    color: #3fb950;
  }

  .success-path {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-family: var(--vscode-editor-font-family);
    word-break: break-all;
    padding: 6px 8px;
    background: var(--vscode-editor-background);
    border-radius: 4px;
    border: 1px solid var(--vscode-panel-border);
  }

  .error {
    display: none;
    margin-top: 16px;
    padding: 14px 16px;
    background: #f8514910;
    border: 1px solid #f8514940;
    border-radius: 8px;
    font-size: 12px;
    color: #f85149;
    line-height: 1.6;
    animation: popIn 0.25s ease;
  }

  #language-row { margin-top: 2px; }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>dev-arch</h1>
    <p>Development Environment Architect</p>
  </div>

  <div class="card">
    <div class="card-title">Project</div>
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

  <div class="card">
    <div class="card-title">Options</div>
    <div class="checkbox-group">
      <div class="checkbox-row" id="tailwind-row">
        <input type="checkbox" id="tailwind" />
        <label for="tailwind">Add Tailwind CSS</label>
      </div>
      <div class="checkbox-row" id="full-row">
        <input type="checkbox" id="full" />
        <label for="full">Full Boilerplate</label>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="git" />
        <label for="git">Initialize Git</label>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="github" />
        <label for="github">Create GitHub Repo</label>
      </div>
    </div>

    <div class="token-area" id="github-token-area">
      <div id="token-section">
        <div class="token-hint">
          A GitHub Personal Access Token is required.<br><br>
          <strong>How to get one:</strong><br>
          1. Click the button below to open GitHub<br>
          2. Give it a name like "dev-arch"<br>
          3. Make sure "repo" scope is checked<br>
          4. Click Generate token, copy and paste below
        </div>
        <button class="btn-github" onclick="vscode.postMessage({ command: 'openTokenPage' })">Open GitHub Token Page</button>
        <input type="password" id="token-input" placeholder="Paste your token here" />
        <button class="btn-save" onclick="saveToken()">Save Token Securely</button>
      </div>
      <div id="token-saved" style="display:none;">
        <div class="token-saved-state">
          <span class="token-badge">✓ Token saved</span>
          <span style="font-size:12px; color: var(--vscode-descriptionForeground);">Stored securely in OS keychain</span>
        </div>
        <button class="btn-danger" onclick="deleteToken()">Remove Token</button>
      </div>
    </div>
  </div>

  <div class="card" id="visibility-row" style="display:none;">
    <div class="card-title">Repository</div>
    <label>Visibility</label>
    <select id="visibility">
      <option value="public">Public</option>
      <option value="private">Private</option>
    </select>
  </div>

  <button class="btn-primary" id="createBtn" onclick="submit()">Create Project</button>

  <div class="progress" id="progress">
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <div class="progress-text" id="progress-text">Setting up project structure...</div>
  </div>

  <div class="success" id="success">
    <div class="success-header">
      <span class="success-icon">✅</span>
      <span class="success-title">Project created successfully!</span>
    </div>
    <div class="success-path" id="success-path"></div>
  </div>

  <div class="error" id="error"></div>

</div>

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
    document.getElementById('error').textContent = '';

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