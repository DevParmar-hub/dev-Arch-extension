const vscode = require('vscode');
const {run} = require('./src/cli/index');

function activate(context) {
	const outputChannel = vscode.window.createOutputChannel('dev-arch');
	const disposable = vscode.commands.registerCommand('dev-arch.createProject', async ()=>{
		const panel = vscode.window.createWebviewPanel(
			'devArch',
			'dev-arch',
			vscode.ViewColumn.One,
			{ enableScripts: true}
		);
		panel.webview.html = getWebviewContent();
		panel.webview.onDidReceiveMessage(async message =>{
			if(message.command ==='create') {
				const uri = await vscode.window.showOpenDialog({
					canSelectFiles: false,
					canSelectFolders:true,
					canSelectMany:false,
					openLabel: 'Select project location'
				});

				if (!uri || uri.length===0) return;

				const projectPath = uri[0].fsPath;

				try {
					await run ({
						name: message.name,
						type: message.type,
						projectPath,
						git:message.git,
						github:message.github,
						tailwind:message.tailwind,
						full:message.full,
						visibility:message.visibility,
						typescript:message.typescript,
						outputChannel
					});

					vscode.window.showInformationMessage(`Project '${message.name}' created successfully!`);	
				} catch(err){
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
<style>
  body { font-family: sans-serif; padding: 20px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  h1 { font-size: 18px; margin-bottom: 20px; }
  label { display: block; margin-bottom: 4px; font-size: 13px; }
  input, select { width: 100%; padding: 6px; margin-bottom: 14px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .checkbox-row input { width: auto; margin: 0; }
  button { padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
  button:hover { background: var(--vscode-button-hoverBackground); }
</style>
</head>
<body>
<h1>dev-arch — Create Project</h1>

<label>Project Name</label>
<input type="text" id="name" placeholder="my-project" />

<label>Project Type</label>
<select id="type">
  <option value="react">React + Vite</option>
  <option value="fullstack">Fullstack (React + Node)</option>
  <option value="node">Node + Express + MongoDB</option>
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

<label>Visibility</label>
<select id="visibility">
  <option value="public">Public</option>
  <option value="private">Private</option>
</select>

<div class="checkbox-row"><input type="checkbox" id="git" /><label>Initialize Git</label></div>
<div class="checkbox-row"><input type="checkbox" id="github" /><label>Create GitHub Repo</label></div>
<div class="checkbox-row"><input type="checkbox" id="tailwind" /><label>Add Tailwind CSS</label></div>
<div class="checkbox-row"><input type="checkbox" id="full" /><label>Full Boilerplate (Node only)</label></div>

<button onclick="submit()">Create Project</button>

<script>
  const vscode = acquireVsCodeApi();
  const typeSelect = document.getElementById('type');
const languageRow = document.getElementById('language-row');

function toggleLanguage() {
    const type = typeSelect.value;
    languageRow.style.display = (type === 'react' || type === 'fullstack') ? 'block' : 'none';
}

typeSelect.addEventListener('change', toggleLanguage);
toggleLanguage(); // run on load
  function submit() {
    vscode.postMessage({
      command: 'create',
      name: document.getElementById('name').value,
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

function deactivate(){}

module.exports = {activate, deactivate};