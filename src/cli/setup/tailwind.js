const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function setupTailwind(type, projectPath){
    const targetPath = type ==='fullstack'
        ? path.join(projectPath, 'frontend')
        :projectPath;

    execSync('npm install tailwindcss @tailwindcss/vite',{
        cwd: targetPath,
        stdio: 'inherit'
    });

    const vitePath = path.join(targetPath, 'vite.config.js');
    let viteConfig = fs.readFileSync(vitePath, 'utf8');

    viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
    viteConfig = viteConfig.replace('react()', 'react(),\n tailwindcss()');

    fs.writeFileSync(vitePath, viteConfig);
    fs.writeFileSync(path.join(targetPath, 'src','index.css'), "@import 'tailwindcss';\n");

}

module.exports = setupTailwind;