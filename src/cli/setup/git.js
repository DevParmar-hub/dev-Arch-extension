const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitignoreTemplates = {
    python: '__pycache__/\n*.pyc\n.env\n',
    web: 'node_modules/\ndist/\n.env\n',
    react: 'node_modules/\ndist/\n.env\n.env.local\n',
    node: 'node_modules/\n.env\ndist/\nuploads/*\n!uploads/.gitkeep\n',
    fullstack: 'node_modules/\n.env\ndist/\nuploads/*\n!uploads/.gitkeep\n'
};

function setupGit(type, projectPath){
    execSync('git init', { cwd: projectPath, stdio: 'inherit'});

    const gitignore = gitignoreTemplates[type] || '';
    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

    execSync('git add .',{ cwd: projectPath, stdio: 'inherit'});
    execSync('git commit -m "Initial commit"', { cwd: projectPath, stdio: 'inherit'});

}

module.exports = setupGit;