const { execSync } = require('child_process');

async function setupGithub(name, projectPath, visibility, token) {
    if (!token) {
        throw new Error('GitHub token is missing. Please add your token in the extension.');
    }

    // Verify token first
    const verifyResponse = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (verifyResponse.status === 401) {
        throw new Error('GitHub token is invalid or expired. Please update your token.');
    }
    if (verifyResponse.status === 403) {
        throw new Error('GitHub token does not have the required permissions. Make sure the "repo" scope is checked.');
    }

    const user = await verifyResponse.json();

    // Create repo
    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            private: visibility === 'private'
        })
    });

    if (response.status === 422) {
        throw new Error(`A GitHub repository named '${name}' already exists on your account.`);
    }
    if (!response.ok) {
        const err = await response.json();
        throw new Error(`GitHub API error: ${err.message}`);
    }

    const repo = await response.json();

    // Push using token in URL
    try {
        execSync(`git remote add origin https://${token}@github.com/${repo.full_name}.git`, {
            cwd: projectPath,
            stdio: 'pipe'
        });
        execSync('git push -u origin HEAD', {
            cwd: projectPath,
            stdio: 'pipe'
        });
    } catch (err) {
        throw new Error(`Failed to push to GitHub: ${err.message}`);
    }

    return repo.html_url;
}

module.exports = setupGithub;