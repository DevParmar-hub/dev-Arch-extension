const { execSync }= require('child_process');

function setupGithub(name, projectPath, visibility) {
    const visibilityFlag = visibility === 'private' ? '--private' : '--public';

    try {
        execSync(`gh repo create ${name} --source=. --remote=origin --push ${visibilityFlag}`, {
            cwd: projectPath,
            stdio: 'pipe'
        });
    } catch (err) {
        throw new Error(`GitHub repo creation failed: ${err.stderr?.toString() || err.message}`);
    }
}

module.exports = setupGithub;