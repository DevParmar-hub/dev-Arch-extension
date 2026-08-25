const { execSync } =  require('child_process');
const fs = require('fs');
const path = require( 'path');

const createProject = require('./projects/index');
const setupGit= require('./setup/git');
const setupGithub= require('./setup/github');
const setupTailwind= require('./setup/tailwind');
const { validateProjectName, checkNode, checkGit } = require('./utils');

async function run(options) {
const { name, type, projectPath, git, github, tailwind, full, visibility, typescript, token } = options;

    validateProjectName(name);
    
    if(['react','node','fullstack'].includes(type)){
        checkNode();
    }

    if(git || github){
        checkGit();
    }

    const fullPath = path.join(projectPath, name);

    if(fs.existsSync(fullPath)){
        throw new Error(`A folder named '${name}' already exists in this location.`);
    }

    try{
        fs.mkdirSync(fullPath, { rucursive: true });
    }catch(err){

        throw new Error(`Could not create project folder. Check disk space and permissions.`);
    }

    try{
        await createProject(type,fullPath,full,typescript);
    }catch(err){
        fs.rmSync(fullPath, { recursive: true, force: true});
        throw new Error(`Project scaffolding failed: ${err.message}`);
    }
   
 if (tailwind) {
        try {
            await setupTailwind(type, fullPath);
        } catch (err) {
            throw new Error(`Tailwind setup failed: ${err.message}`);
        }
    }

    if (git || github) {
        try {
            await setupGit(type, fullPath);
        } catch (err) {
            throw new Error(`Git setup failed: ${err.message}`);
        }
    }

    if (github) {
        try {
            await setupGithub(name, fullPath, visibility, token);
        } catch (err) {
            throw new Error(`GitHub repo creation failed: ${err.message}`);
        }
    }
    return fullPath;
}

module.exports = { run };