const fs = require('fs');
const path = require('path');

function createPythonProject(projectPath) {
    const name = path.basename(projectPath);
    fs.mkdirSync(path.join(projectPath, 'src'));
    fs.mkdirSync(path.join(projectPath, 'tests'));
    fs.writeFileSync(path.join(projectPath, 'src', 'main.py'), '');
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), '');
    fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${name}\n`);
}

module.exports = createPythonProject;