const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const createProject = require('./projects/index');
const setupGit = require('./setup/git');
const setupGithub = require('./setup/github');
const setupTailwind = require('./setup/tailwind');
const { validateProjectName, checkNode, checkGit } = require('./utils');

async function run(options) {
    const { name, type, projectPath, git, github, tailwind, full, visibility, typescript, token } = options;

    // Validate first — before any work is done
    validateProjectName(name);

    if (tailwind && !['react', 'fullstack'].includes(type)) {
        throw new Error('Tailwind CSS is only supported for React and Fullstack projects.');
    }

    if (['react', 'node', 'fullstack'].includes(type)) {
        checkNode();
    }

    if (git || github) {
        checkGit();
    }

    const fullPath = path.join(projectPath, name);

    if (fs.existsSync(fullPath)) {
        throw new Error(`A folder named '${name}' already exists in this location.`);
    }

    try {
        fs.mkdirSync(fullPath, { recursive: true });
    } catch (err) {
        throw new Error(`Could not create project folder. Check disk space and permissions.`);
    }

    try {
        await createProject(type, fullPath, full, typescript);
    } catch (err) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        throw new Error(`Project scaffolding failed: ${err.message}`);
    }

    if (tailwind) {
        try {
            await setupTailwind(type, fullPath);
        } catch (err) {
            throw new Error(`Project created but Tailwind setup failed: ${err.message}. Your project files are intact.`);
        }
    }

    if (git || github) {
        try {
            await setupGit(type, fullPath);
        } catch (err) {
            throw new Error(`Project created but Git setup failed: ${err.message}. Your project files are intact.`);
        }
    }

    if (github) {
        try {
            await setupGithub(name, fullPath, visibility, token);
        } catch (err) {
            throw new Error(`Project created but GitHub repo creation failed: ${err.message}. Your project files are intact.`);
        }
    }

    return fullPath;
}

module.exports = { run };