# 🛠️ Engineering Standard Operating Procedure (SOP)

**Objective:** Standardize the workflow for adding new features to GNRdigital [v2].
**Branching Strategy:** superseded. The current model is `feature/GNR-n` → integration branch → `main`; see [WORKFLOW.md](WORKFLOW.md). `develop` is retired, so read "develop" below as the integration branch.

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
Never push directly to develop. Create a specific "container" for your task.

- Naming Convention: type/description
    - feat/ = New features
    - fix/ = Bug fixes
    - docs/ = Documentation changes

```Bash
# Example: git checkout -b feat/add-login-screen
git checkout -b <type>/<descriptive-name>
```

## 3. Stage & Verify
Add only the files related to your task.

```Bash
# Add all changes in the current folder
git add .

# OR add specific files
# git add frontend/src/App.jsx

# ALWAYS check status before committing
git status
```

## 4. Commit the Changes (Conventional Commits)
We use Conventional Commits to keep our history clean.

```Bash
# Format: type(scope): description
# Example: feat(auth): implement supabase login logic
git commit -m "<type>(<scope>): <description>"
```

## 5. Push to GitHub
Send your feature branch to the remote server.

```Bash
git push -u origin <your-branch-name>
```

## 6. The Pull Request (GitHub UI)
1. Go to the GitHub Repository.
2. Click Compare & pull request on the yellow banner.
3. Base: develop | Compare: <your-branch-name>.
4. Title: <type>: <description>.
5. Description: Fill out the PR Template (What did you do? How did you test it?).
6. Click Create Pull Request.

## 7. Merge & Cleanup
1. Wait for the Gatekeeper (CI) to pass.
2. Click Merge pull request.
3. Click Delete branch (on GitHub).
4. Sync your local machine:

```Bash
git checkout develop
git pull origin develop
git branch -d <your-branch-name>
git fetch -p
```
---


### **How to Update This Now**
Since you are already on the `feature/high-tech-theme` branch, you can update this file and include it in your current Push.

1.  **Edit the file:** Paste the new text above into `docs/workflow_guide.md`.
2.  **Add the change:**
    ```bash
    git add docs/workflow_guide.md
    ```
3.  **Amend your previous commit:** (This is a pro tip to avoid having two commits for the same setup).
    ```bash
    git commit --amend --no-edit
    ```
4.  **Force Push:** (Since you modified history with `--amend`, you need to force update the remote branch).
    ```bash
    git push -f origin feature/high-tech-theme
    ```

**After this, your Pull Request on GitHub will automatically update to show the new, professional guide!**