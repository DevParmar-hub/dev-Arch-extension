const { execSync } = require('child_process');

function commandExists(cmd) {
    try {
        execSync(`${cmd} --version`, { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

function validateProjectName(name) {
    if (!name || name.trim() === '') {
        throw new Error('Project name cannot be empty.');
    }
    if (/[<>:"/\\|?*\s]/.test(name)) {
        throw new Error('Project name cannot contain spaces or special characters.');
    }
    if (name.length > 100) {
        throw new Error('Project name is too long.');
    }
}

function checkNode() {
    try {
        execSync('node --version', { stdio: 'pipe' });
    } catch {
        throw new Error('Node.js is not installed or not in PATH. Download it from https://nodejs.org — if already installed, restart VS Code.');
    }
    try {
        execSync('npm --version', { stdio: 'pipe' });
    } catch {
        throw new Error('npm is not installed or not in PATH. Restart VS Code after installing Node.js.');
    }
}

function checkGit() {
    try {
        execSync('git --version', { stdio: 'pipe' });
    } catch {
        throw new Error('Git is not installed or not in PATH. Download it from https://git-scm.com — if already installed, restart VS Code.');
    }
    try {
        execSync('git config user.name', { stdio: 'pipe' });
    } catch {
        throw new Error('Git user.name not configured. Run: git config --global user.name "Your Name"');
    }
    try {
        execSync('git config user.email', { stdio: 'pipe' });
    } catch {
        throw new Error('Git user.email not configured. Run: git config --global user.email "you@example.com"');
    }
}

function quotePath(p) {
    return `"${p}"`;
}

module.exports = { commandExists, validateProjectName, checkNode, checkGit, quotePath };