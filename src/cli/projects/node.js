const fs = require('fs');
const path = require('path');

function createNodeProject(projectPath, full){
    const dirs = ['config', 'routes', 'controllers', 'models', 'middleware', 'services', 'utils', 'validators', 'uploads'];
    dirs.forEach(dir => fs.mkdirSync(path.join(projectPath, dir)));

    const name = path.basename(projectPath);

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify({
              name,
        version: '1.0.0',
        type: 'module',
        scripts: {
            start: 'node server.js',
            dev: 'nodemon server.js'
        },
        dependencies: {
            express: '^4.18.2',
            mongoose: '^8.0.0',
            dotenv: '^16.3.1',
            cors: '^2.8.5'
        },
        devDependencies: {
            nodemon: '^3.0.2'
        }  
    }, null, 2));

    fs.writeFileSync(path.join(projectPath, '.gitignore'),
        'node_modules/\n.env\ndist/\nuploads/.gitkeep\n');

    fs.writeFileSync(path.join(projectPath, '.env'),
        'PORT=3000\nMONGODB_URI=your_mongodb_atlas_connection_string\nNODE_ENV=development\n');
    
    fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${name}\n`);
    fs.writeFileSync(path.join(projectPath, 'uploads', '.gitkeep'), '');

    if (full) {
        fs.writeFileSync(path.join(projectPath, 'server.js'),
    `import app from './app.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`)
})`
    );

    fs.writeFileSync(path.join(projectPath, 'app.js'),
`import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import routes from './routes/index.js'

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', routes)

export default app`
);

    fs.writeFileSync(path.join(projectPath, 'config', 'db.js'),
`import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected')
    } catch (err) {
        console.error('MongoDB connection failed:', err.message)
        process.exit(1)
    }
}`
);

    fs.writeFileSync(path.join(projectPath, 'routes', 'index.js'),
`import { Router } from 'express'
const router = Router()

router.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

export default router`);

        fs.writeFileSync(path.join(projectPath, 'controllers', 'index.js'),
`export const healthCheck = (req, res) => {
    res.json({ status: 'ok' })
}`
);

    fs.writeFileSync(path.join(projectPath, 'models', 'index.js'),
`//Export your mongoose models here\n//Export { default as User } from './User.js'`);

    fs.writeFileSync(path.join(projectPath, 'middleware','index.js'),
`export const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({message: err.message})
    }`);

    fs.writeFileSync(path.join(projectPath, 'services', 'index.js'), '//Business logic goes here');
    fs.writeFileSync(path.join(projectPath, 'utils', 'index.js'), '//Utility functions go here');
    fs.writeFileSync(path.join(projectPath, 'validators', 'index.js'), '//Request validators go here');
}
else{
     ['server.js', 'app.js'].forEach(f => fs.writeFileSync(path.join(projectPath, f), ''));
        ['config/db.js', 'routes/index.js', 'controllers/index.js', 'models/index.js',
         'middleware/index.js', 'services/index.js', 'utils/index.js', 'validators/index.js']
            .forEach(f => fs.writeFileSync(path.join(projectPath, f), ''));
}
}

module.exports = createNodeProject;