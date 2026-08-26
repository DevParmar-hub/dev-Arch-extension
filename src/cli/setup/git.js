const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitignoreTemplates = {
    python: '__pycache__/\n*.pyc\n.env\n',
    web: 'node_modules/\ndist/\n.env\n',
};

function setupGit(type, projectPath) {
    execSync('git init', { cwd: projectPath, stdio: 'pipe' });

    if (gitignoreTemplates[type]) {
        fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreTemplates[type]);
    }

    execSync('git add .', { cwd: projectPath, stdio: 'pipe' });

    try {
        execSync('git commit -m "Initial commit"', { cwd: projectPath, stdio: 'pipe' });
    } catch (err) {
        throw new Error('Git commit failed. Make sure git user.name and user.email are configured.');
    }
}

module.exports = setupGit;