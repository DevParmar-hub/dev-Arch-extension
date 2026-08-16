const fs = require('fs');
const path = require('path');

function createPythonProject(projectPath) {
    fs.mkdirSync(path.join(projectPath, 'src'));
    fs.mkdirSync(path.join(projectPath, 'tests'));
    fs.writeFileSync(path.join(projectPath, 'src', 'main.py'),'');
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), '');
    fs.writeFileSync(path.join(projectPath, 'README.md'),`#${path.basename(projectPath)}\n`);
  
}
module.exports = createPythonProject;