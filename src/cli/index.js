const { execSync } =  require('child_process');
const fs = require('fs');
const path = require( 'path');

const createProject = require('./projects/index');
const setupGit= require('./setup/git');
const setupGithub= require('./setup/github');
const setupTailwind= require('./setup/tailwind');

async function run(options) {
const { name, type, projectPath, git, github, tailwind, full, visibility, typescript, token } = options;

    const fullPath = path.join(projectPath, name);

    if (!name) throw new Error('Project name is required');
    if (!type) throw new Error('Project type is required');
    if (fs.existsSync(fullPath)) throw new Error(`Directory '${name}' already exists`);

    fs.mkdirSync(fullPath, { recursive: true});
    await createProject(type, fullPath, full, typescript);

    if (tailwind) await setupTailwind(type, fullPath);

    if (git || github) await setupGit(type, fullPath);

    if (github) await setupGithub(name, fullPath, visibility, token);

    return fullPath;
}

module.exports = { run };