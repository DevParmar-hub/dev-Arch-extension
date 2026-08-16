const fs = require('fs');
const path = require('path');

function createWebProject(projectPath){
    fs.writeFileSync(path.join(projectPath, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <script src="script.js"></script>
</body>
</html>`);

fs.writeFileSync(path.join(projectPath, 'style.css'),
`* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: sans-serif;
}`);

fs.writeFileSync(path.join(projectPath, 'script.js'),
`// Javascript goes here`);

fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${name}\n`);
}

module.exports = createWebProject;