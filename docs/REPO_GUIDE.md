# Repo guide: where everything is

One page. For the layout rules and access levels see [architecture.md](architecture.md); for wording see [copy.md](copy.md).

## What this is
A personal portfolio site (`frontend/`) that is meant to host small tools. **Only the Brandbook Maker exists today.** Gym Tracker, CV Maker and Mail Sender are plans (see `ProjectInfo.md`), not code.

## Folders
| Path | What it is |
|---|---|
| `frontend/src/app/` | `App.jsx`: the route table. Every page except Home loads on demand. |
| `frontend/src/modules/<feature>/` | One folder per feature: `auth`, `brandbook`, `tools`, `blog`, `portfolio` (Home, About, Projects, /design), `legal`, `contact`, `colophon`. `registry.js` lists the products. |
| `frontend/src/shared/` | Things any module may use: `ui` (buttons, inputs, modal...), `layout` (header, footer, page shell), `errors`, `animations`, `catalog` (searchable list page), `hooks`, `config` (brand, tokens, profile, effects, features). |
| `frontend/functions/` | Cloudflare Pages Functions: `api/*` are the URL files, the logic is in `modules/<key>/`. Not tracked in git yet. |
| `frontend/public/` | Favicon and web manifest. |
| `docs/` | This guide, architecture, copy rules, workflow guide. |
| `.github/workflows/` | CI (`gatekeeper.yml`: unit tests on PRs). |
| `database/`, `microservices/` | Empty. Planned only. |
| `graphify-out/` | A graph of the code for AI tools (ignored by git; refresh with `graphify update .`). |

**Rules that a test enforces:** `shared/` never imports `modules/` or `app/`; a module imports only `shared/`, itself, or `auth`. Colors are never hard-coded: use the Tailwind tokens (`text-cyber-pink`).

## Run it
```bash
cd frontend
nvm use                      # Node 24 (.nvmrc)
npm install
cp .env.example .env.local   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5173
npm run lint && npm run test:unit && npm run build   # same checks CI runs
```
Optional: `VITE_FEATURES=account,tools,blogs,dashboard` switches on unfinished areas (all off by default; off routes show the 404). `VITE_FEATURE_ACCOUNT=true` is an alias for `account`. `.dev.vars` (copy `.dev.vars.example`) holds the Resend key for the mail function.

## Access levels
`guest` (no login) < `member` (logged in) < `admin` (`profiles.role = 'admin'`). Guard a route with `<ProtectedRoute minAccess="member" />`. Nothing is guarded yet.

## Decisions
Architecture decisions are recorded in [adr/](adr/README.md).

## Branches and PRs
- **Integration branch:** `feat/auth-and-BrandBookEditor`. All work merges here through PRs, and it merges into `main` at launch. (`develop` is retired; see [WORKFLOW.md](WORKFLOW.md).)
- **Branch names:** `feature/GNR-<n>` or `hotfix/GNR-<n>`, where `GNR-<n>` is the ticket.
- **Commits:** `type(scope): summary`. Never commit straight to the integration branch or `main`.
- **Stacked PRs:** if one PR builds on another, set each PR's base to the previous branch **and retarget it to the integration branch before merging**, or it merges into its parent and never arrives.
- **Tickets** live in your ticket tool (export: `GNR-export.json`). A ticket is Done when its PR has merged into the integration branch.

## Deploying
See [README.md](../README.md) (Deploy and Rollback). Hosting moves from Pages to a Worker in GNR-16.

## Still open / easy to trip on
- `frontend/functions/`, the brandbook email feature and `ProjectInfo.md` edits are uncommitted (ticket GNR-5).
- `/api/send-brandbook` needs a Resend key and should be off until Resend is back (GNR-15).
- Auth is Supabase now; the tickets plan to move to Better Auth + D1 later (GNR-136).
