# Development Environment Architect (aka devArch)

Setting up a new project is tedious. Same folders, same files, same git init — every single time. devArch fixes that.

## What it does

Pick your stack, set your options, hit create. That's it. Your project is scaffolded, dependencies installed, git initialized, and if you want — pushed to GitHub. All from inside VS Code.

## Install

Search **devArch** in the VS Code extension marketplace and install. That's it — no CLI, no setup.

## How to use it

Open the command palette (`Ctrl+Shift+P` on Windows, `Cmd+Shift+P` on Mac), type **dev-arch: Create Project** and hit enter.

A panel opens inside VS Code. Fill in:

1. **Project Name** — no spaces or special characters
2. **Project Type** — pick your stack
3. **Language** — JavaScript or TypeScript (React and Fullstack only)
4. **Options** — Tailwind, Full Boilerplate, Git, GitHub (mix and match)
5. **Visibility** — Public or Private (shows up when GitHub is checked)

Hit **Create Project**, pick a folder, done.

## Supported stacks

| Type | What you get |
|------|-------------|
| React + Vite | Full Vite scaffold, optional Tailwind, JS or TS |
| Fullstack | React frontend + Node backend in one repo |
| Node.js Backend | Express + MongoDB structure, optional boilerplate |
| Python | src/, tests/, main.py, requirements.txt |
| Web | HTML, CSS, JS with proper boilerplate |

## Options explained

**Tailwind CSS**
Installs Tailwind, patches `vite.config.js`, and adds the import to `index.css`. Available for React and Fullstack only.

**Full Boilerplate**
For Node and Fullstack projects — generates working code instead of empty files. Includes a connected Express app, MongoDB connection, routes, controllers, middleware, and more. Without this, you just get the folder structure.

**Initialize Git**
Runs `git init`, creates a `.gitignore` tailored to your stack, and makes the initial commit.

**Create GitHub Repo**
Creates a repo on your GitHub account and pushes the initial commit. No GitHub CLI needed — devArch uses the GitHub API directly. First time you check this, you'll be asked for a Personal Access Token. It's a one-time setup, stored securely in your OS keychain.

### How to get a GitHub Personal Access Token

1. Go to **github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token**
3. Give it a name like `devArch`
4. Check the **repo** scope
5. Click **Generate token** and copy it
6. Paste it in the devArch panel

Or just click the **Open GitHub Token Page** button inside the extension — it opens the right page with the scope pre-selected.

## Requirements

| Feature | Requirement |
|---------|------------|
| React, Node, Fullstack | Node.js + npm — https://nodejs.org |
| Git integration | Git — https://git-scm.com |
| GitHub integration | Git + a GitHub Personal Access Token |
| Python, Web | Nothing extra |

## Project name rules

- No spaces
- No special characters (`< > : " / \ | ? *`)
- Max 100 characters

## What's coming

This is just the start. The plan is to keep expanding devArch to cover more stacks and workflows — Django, Go, Docker setup, and more. If there's something you want supported, open an issue on GitHub.

## License

MIT