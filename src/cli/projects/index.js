const createPythonProject = require('./python');
const createWebProject = require('./web');
const createReactProject = require('./react');
const createNodeProject = require('./react');
const createFullstackProject = require('./fullstack');

async function createProject(type, projectPath, full) {
    switch (type) {
        case 'python' :
            await createPythonProject(projectPath);
            break;
        case 'web' :
            await createWebProject(projectPath);
            break;
        case 'react' :
            await createReactProject(projectPath);
            break;
        case 'node' :
            await createNodeProject(projectPath, full);
            break;
        case 'fullstack' :
            await createFullstackProject(projectPath, full);
            break;
        default :
            throw new Error(`Unknown project type: ${type}`);
    }
}

module.exports = createProject;