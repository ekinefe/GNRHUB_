# 🚀 SOP: Pushing the High-Tech Theme to GitHub

**Objective:** Commit and push the new Tailwind configuration, fonts, and CSS variables without breaking the build.
**Target Branch:** `develop` via Pull Request.

---

## 1. Verify Local Status
Before doing anything, ensure you are on the `develop` branch and it is up to date.

```bash
# Switch to develop
git checkout develop

# Pull the latest changes from the cloud (Sync)
git pull origin develop
```

## 2. Create a Feature Branch
We never push directly to develop. Create a specific "container" for this task.

```Bash
# Syntax: git checkout -b feature/<descriptive-name>
git checkout -b feature/high-tech-theme
```

## 3. Stage the Files
Select exactly which files belong to this "Theme Update".

```Bash
# Add the configuration files
git add frontend/tailwind.config.js
git add frontend/postcss.config.js

# Add the global CSS and HTML updates
git add frontend/src/index.css
git add frontend/index.html

# Check what you are about to commit (Verify!)
git status
Check: You should see green text listing only the 4 files above.
```

## 4. Commit the Changes
Write a "Conventional Commit" message. This creates a clean history log.

```Bash
# Format: type(scope): description
git commit -m "feat(ui): implement jetbrains mono and cyberpunk theme tokens"
```

## 5. Push to GitHub
Send your feature branch to the remote server.

```Bash
git push -u origin feature/high-tech-theme
```

## 6. The Pull Request (GitHub UI)
1. Go to your repository: https://github.com/ekinefe/GNRHUB_
2. You will see a yellow banner: "feature/high-tech-theme had recent pushes".
3. Click Compare & pull request.
4. Base: develop | Compare: feature/high-tech-theme.
5. Title: feat: high-tech theme implementation.
6. Description:

    ```Markdown
    ## 🎨 Theme Update
    - Added `JetBrains Mono` and `Space Grotesk` fonts.
    - Configured Tailwind `cyber` color palette.
    - Added global dark mode reset in `index.css`.
    ```
7. Click Create Pull Request.

## 7. Merge & Cleanup
1. Wait for the Gatekeeper (CI) to pass (if active).
2. Click Merge pull request.
3. Click Delete branch (the remote feature branch).
4. Back in your terminal:
    ``` Bash
    git checkout develop
    git pull origin develop
    git branch -d feature/high-tech-theme
    Status: Your local develop is now synced with the new theme!
    ```