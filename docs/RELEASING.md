# Releasing

Versions follow semver, set in `frontend/package.json` (the footer shows it as `v0.1.0 · build <sha>`). Commits already use `type(scope): summary`, so the changelog is drafted from them.

## Cut a release
1. Branch `feature/release-x.y.z` from the integration branch (or `main` after launch).
2. Bump the version: `cd frontend && npm version x.y.z --no-git-tag-version`.
3. Draft the notes: `npm run changelog -- x.y.z` and paste the output at the top of `CHANGELOG.md` (edit by hand: merge duplicates, drop noise).
4. Run `npm run lint && npm run test:unit && npm run build && npm run check:bundle && npm run security:sweep`.
5. Commit `chore(release): x.y.z`, open a PR, merge.
6. Tag the merge commit and push the tag (owner only): `git tag vx.y.z && git push origin vx.y.z`. The Release workflow creates the GitHub Release with generated notes.

Pre-1.0: `0.MINOR` for features, `0.x.PATCH` for fixes. A breaking change uses `type!:` in the commit and goes under "Breaking" in the notes.

Deploying is a separate, owner-run step; see the README.
