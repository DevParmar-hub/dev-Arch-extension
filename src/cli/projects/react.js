const { execSync } = require('child_process');
const path = require('path');

async function createReactProject(projectPath){
    execSync('npx create-vite .',{
        cwd: projectPath,
        stdio: 'inherit'
    });

    execSync('npm install', {
        cwd: projectPath,
        stdio: 'inherit'
    });
}

module.exports = createReactProject;