const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const createNodeProject = require('./node');

async function createFullstackProject(projectPath, full){
    const frontendPath = path.join(projectPath,'frontend');
    const backendPath = path.join(projectPath, 'backend');

    fs.mkdirSync(frontendPath);
    fs.mkdirSync(backendPath);

    execSync(`npx create-vite . --template ${full.typescript ? 'react-ts' : 'react'}`, {
        cwd: frontendPath,
        stdio: 'pipe'
    });
    execSync('npm install', {
        cwd:frontendPath,
        stdio: 'pipe'
    });

    createNodeProject(backendPath, full);
}

module.exports = createFullstackProject;