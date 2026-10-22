# GNRdigital: rules for AI assistants

Personal portfolio site. Tools (Brandbook Maker, CV Maker, Gym Tracker) are separate projects it only links to (`docs/adr/0007-portfolio-only.md`). Read `docs/REPO_GUIDE.md` (where things are) and `docs/architecture.md` (layout rules) first.

## Stack
React + Vite + Tailwind (`frontend/`), a single Cloudflare Worker (`frontend/functions/worker.ts`, ADR in `docs/adr/0001-single-worker.md`), Vitest. No accounts or sign-in. Node 24 (`.nvmrc`).

## Commands (run from `frontend/`)
| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run test:unit` | Vitest (also covers `functions/`) |
| `npm run build` | Production build into `dist/` |
| `npm run dev:worker` | Builds, then serves SPA + `/api` + local D1 with `wrangler dev --local` (http://localhost:8787) |
| `npm run db:migrate:local` | Applies D1 migrations locally (see `docs/database.md`; remote scripts need typed confirmation) |
| `npm run check:links` | Checks every external link in `src/` still resolves (needs network) |

Lint, tests and build must pass before a PR. CI (`.github/workflows/gatekeeper.yml`) runs them.

## Hard rules
- **Remote or destructive actions need confirmation first:** remote DB migrations, deploys, `wrangler` commands against production, force-push, deleting branches/files you did not create.
- **Budget is $0** unless the owner says otherwise. No paid services, plans or dependencies on your own initiative.
- **Secrets:** never edit or print `.env*`, `.dev.vars` or `AccountDetails.md`. Never put a secret in the repo. Server secrets go through `wrangler secret`; third-party API keys will be stored encrypted in D1, not in env vars.
- **No new dependency** without asking.
- **Branches:** one `feature/GNR-<n>` (or `hotfix/GNR-<n>`) branch per ticket, taken from the integration branch named in `docs/REPO_GUIDE.md`. Never commit to `main` or the integration branch. No git worktrees.
- **Commits:** `type(scope): summary`, small and focused. Stage only the files of the task.

## Code conventions
- Match the surrounding code; do not restyle files you only touch.
- `shared/` never imports `modules/` or `app/`; a module imports only `shared/` or itself. `src/architecture.test.js` enforces it.
- Colors come from Tailwind tokens (`text-cyber-pink`), never hard-coded.
- Contact details and public URLs live once in `shared/config/profile.js`. Brand text lives in `shared/config/brand.js`.
- Motion: ask `shared/config/effects.js`; use the duration tokens. See "Motion rules" in `docs/architecture.md`.
- Wording follows `docs/copy.md`.
- Tools that are separate projects are listed in `shared/content/projects.js` (`url: null` until they have an address); do not add their code here.
- Backend: routes are listed in `functions/worker.ts`. Anything that can send, write or cost money is off by default behind a flag.
- Add or update a test with each behavior change. Check for an existing test first.
