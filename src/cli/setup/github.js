const { execSync } = require('child_process');

async function setupGithub(name, projectPath, visibility, token) {
    if (!token) {
        throw new Error('GitHub token is missing. Please add your token in the extension.');
    }

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
        throw new Error('GitHub token does not have the required permissions or is rate limited. Make sure the "repo" scope is checked.');
    }

    const user = await verifyResponse.json();

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

    const auth = Buffer.from(`x-token:${token}`).toString('base64');

    try {
        execSync(`git remote add origin https://github.com/${repo.full_name}.git`, {
            cwd: projectPath,
            stdio: 'pipe'
        });
        execSync(`git -c http.extraHeader="Authorization: Basic ${auth}" push -u origin HEAD`, {
            cwd: projectPath,
            stdio: 'pipe'
        });
    } catch (err) {
        throw new Error(`Failed to push to GitHub. An empty repo was created at ${repo.html_url} — you may need to delete it and try again. Error: ${err.message}`);
    }

    return repo.html_url;
}

module.exports = setupGithub;