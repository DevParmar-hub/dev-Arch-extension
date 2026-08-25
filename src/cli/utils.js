const { execSync } = require('child_process');
const fs = require('fs');

function commandExists(cmd){
    try {
        execSync(`where ${cmd}`,{ stdio: 'pipe'});
        return true;
    }catch{
        try{
            execSync(`which ${cmd}`,{ stdio: 'pipe' });
            return true;
        }catch{
            return false;
        }
    }
}

function validateProjectName(name){
    if(!name || name.trim()=== ''){
        throw new Error('Project name cannot be empty.');
    }
    if(/[<>:"/\\|?*\s]/.test(name)){
        throw new Error("Project name cannot contain any special charavters or spaces.")
    }
    if (name.length> 100){
        throw new Error('Project name is too long.');
    }
}

function checkNode(){
    if (!commandExists('node')){
        throw new Error('Node.js is not installed. Download it from https://nodejs.org');
    }
    if(!commandExists('npm')){
        throw new Error('npm is not installed. It usually comes with Node.js so reinstall from https://nodejs.org');
    }
}

function checkGit(){
    if(!commandExists('git')){
        throw new Error('Git is not installed. Download it from https://git-scm.com');
    }

    try{
        execSync('git config user.name', { stdio: 'pipe' });
    }catch{
        throw new Error('Git user.name/user.eemail not configured. Run: git config --global user.email "you@example.com"');
    }
}

function quotePath(p){
    return `"${p}"`;
}

module.export = { commandExists, validateProjectName, checkNode, checkGit, quotePath};