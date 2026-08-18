const { execSync } = require('child_process');
const path = require('path');

async function createReactProject(projectPath, typescript){
    const template = typescript ? 'react-ts' : 'react';
    execSync(`npx create-vite . --template ${template}`,{
        cwd: projectPath,
        stdio: 'pipe'
    });

    execSync('npm install', {
        cwd: projectPath,
        stdio: 'pipe'
    });
}

module.exports = createReactProject;