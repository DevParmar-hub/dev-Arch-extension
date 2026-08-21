const { execSync } = require('child_process');

async function setupGithub(name, projectPath, visibility, token) {
    const visibilityFlag = visibility === 'private';

    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            private: visibilityFlag
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`GitHub API error: ${err.message}`);
    }

    const repo = await response.json();

    // push using git with token in URL
    execSync(`git remote add origin https://${token}@github.com/${repo.full_name}.git`, {
        cwd: projectPath,
        stdio: 'pipe'
    });

    execSync('git push -u origin HEAD', {
        cwd: projectPath,
        stdio: 'pipe'
    });

    return repo.html_url;
}

module.exports = setupGithub;