# Workflow

How a ticket goes from the board to the integration branch. (`docs/workflow_guide.md` is the old Git Flow guide and is out of date; this file replaces it.)

## Branching model
`feature/GNR-<n>` (or `hotfix/GNR-<n>`) → integration branch `feat/auth-and-BrandBookEditor` → `main` at launch. `develop` is retired. One branch per ticket, named for its ticket id; delete the branch (local and remote) after it merges. A stacked branch is only safe to delete once its parent has merged into the integration branch.

## 1. Pick a ticket
Tickets live in the ticket tool (export: `GNR-export.json`). Work one at a time, highest priority first. Skip anything that depends on an unfinished ticket (for example D1 or Better Auth work).

## 2. Branch
```bash
git checkout <integration-branch>      # name is in docs/REPO_GUIDE.md
git pull
git checkout -b feature/GNR-<n>        # hotfix/GNR-<n> for urgent fixes
```
Never commit to `main` or the integration branch. If one ticket builds on another that is not merged yet, say so in the PR and set the PR base to the previous branch, then retarget before merging.

## 3. Build
- Read the ticket's acceptance criteria and treat them as the checklist.
- Small commits, `type(scope): summary` (`feat`, `fix`, `docs`, `chore`, `test`, `refactor`).
- Stage only files that belong to the ticket (`git add <paths>`, then `git status`).

## 4. Check (from `frontend/`)
```bash
npm run lint && npm run test:unit && npm run build
```
Run `npm run check:links` when you touched external links.

## 5. Pull request
Fill in `.github/pull_request_template.md`: what changed, how you tested it, the ticket id. CI (Gatekeeper) must pass.

## 6. Merge and clean up
Merge into the integration branch, delete the feature branch on GitHub, then `git fetch -p` and delete it locally. A ticket is Done when its PR has merged.

## Safety rules
- No remote migration, deploy or production `wrangler` command without the owner's explicit OK.
- Budget is $0 unless the owner says otherwise.
- No secrets in the repo. `.env*`, `.dev.vars` and `AccountDetails.md` are never committed or edited by assistants.
- Never force-push without asking.
