const { execSync } = require('child_process');

function commandExists(cmd) {
    try {
        execSync(`where ${cmd}`, { stdio: 'pipe' });
        return true;
    } catch {
        try {
            execSync(`which ${cmd}`, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
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
    if (!commandExists('node')) {
        throw new Error('Node.js is not installed. Download it from https://nodejs.org');
    }
    if (!commandExists('npm')) {
        throw new Error('npm is not installed. It usually comes with Node.js — reinstall from https://nodejs.org');
    }
}

function checkGit() {
    if (!commandExists('git')) {
        throw new Error('Git is not installed. Download it from https://git-scm.com');
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