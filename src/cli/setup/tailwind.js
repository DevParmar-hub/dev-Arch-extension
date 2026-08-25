const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function setupTailwind(type, projectPath) {
    const targetPath = type === 'fullstack'
        ? path.join(projectPath, 'frontend')
        : projectPath;

   
    const viteConfigJs = path.join(targetPath, 'vite.config.js');
    const viteConfigTs = path.join(targetPath, 'vite.config.ts');
    const viteConfigPath = fs.existsSync(viteConfigTs) ? viteConfigTs : viteConfigJs;

    if (!fs.existsSync(viteConfigPath)) {
        throw new Error('Could not find vite.config.js or vite.config.ts. Make sure Vite was scaffolded correctly.');
    }

    try {
        execSync('npm install tailwindcss @tailwindcss/vite', {
            cwd: targetPath,
            stdio: 'pipe'
        });
    } catch (err) {
        throw new Error('Failed to install Tailwind CSS. Check your internet connection.');
    }

    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
    viteConfig = viteConfig.replace('react()', 'react(),\n    tailwindcss()');
    fs.writeFileSync(viteConfigPath, viteConfig);
    
    const indexCssPath = path.join(targetPath, 'src', 'index.css');
    if (fs.existsSync(indexCssPath)) {
        fs.writeFileSync(indexCssPath, "@import 'tailwindcss';\n");
    } else {
        throw new Error('Could not find src/index.css. Tailwind directive was not added.');
    }
}

module.exports = setupTailwind;