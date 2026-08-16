const { execSync }= require('child_process');

function setupGithub(name, projectPath, visibility) {
    const visibilityFlag = visibility === 'private' ? '--private' : '--public';

    execSync(`gh repo create ${name} --source=. --remote=origin --push ${visibilityFlag}`,{
        cwd: projectPath,
        stdio: 'inherit'
    });

}

module.exports = setupGithub;