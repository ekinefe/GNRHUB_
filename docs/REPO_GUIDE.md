# Repo guide: where everything is

One page. For the layout rules and access levels see [architecture.md](architecture.md); for wording see [copy.md](copy.md).

## What this is
A personal portfolio site (`frontend/`) that is only the portfolio. Brandbook Maker, CV Maker and Gym Tracker are separate projects (ADR 0007); this site links to them from `shared/content/projects.js`.

## Folders
| Path | What it is |
|---|---|
| `frontend/src/app/` | `App.jsx`: the route table. Every page except Home loads on demand. |
| `frontend/src/modules/<feature>/` | One folder per feature: `portfolio` (Home, About, Portfolio, /design), `blog`, `admin` (sign-in and the owner's screens), `legal`, `contact`, `colophon`. |
| `frontend/src/shared/` | Things any module may use: `ui` (buttons, inputs, modal...), `layout` (header, footer, page shell), `errors`, `animations`, `catalog` (searchable list page), `hooks`, `config` (brand, tokens, profile, effects, features). |
| `frontend/functions/` | The Worker: `worker.ts` (routing table, request id and log line, errors, security headers), `_lib/` helpers (sessions, passwords, limits) and `modules/` (admin, blog, contact, projects, status). |
| `frontend/db/migrations/` | Plain SQL migrations for the D1 database, numbered in order (`docs/database.md`). |
| `frontend/public/` | Favicon, web manifest, fonts and project screenshots (`projects/`). |
| `docs/` | This guide, architecture, copy rules, workflow guide, [easter eggs](easter-eggs.md), [observability](observability.md). |
| `.github/workflows/` | CI (`gatekeeper.yml`: unit tests on PRs). |
| `graphify-out/` | A graph of the code for AI tools (ignored by git; refresh with `graphify update .`). |

## Docs index
- Decisions: `docs/adr/` (one file per decision, index in its README).
- Running the owner's parts: `docs/admin.md` (sign-in, posts, messages, projects), `docs/database.md`, `docs/backup.md`, `docs/observability.md`, `docs/limits.md`.
- How it should look and read: `docs/brand.md`, `docs/copy.md`, `docs/ascii.md` (once merged), `docs/easter-eggs.md`.
- Shipping: `docs/launch-checklist.md`, `docs/RELEASING.md`, `docs/WORKFLOW.md`.

**Rules that a test enforces:** `shared/` never imports `modules/` or `app/`; a module imports only `shared/` or itself. Colors are never hard-coded: use the Tailwind tokens (`text-cyber-pink`).

## Run it
```bash
cd frontend
nvm use                      # Node 24 (.nvmrc)
npm install
cp .env.example .env.local   # optional, nothing is required
npm run dev                  # http://localhost:5173
npm run lint && npm run test:unit && npm run build   # same checks CI runs
```
Optional: `.dev.vars` (copy `.dev.vars.example`) holds optional server secrets.

## Decisions
Architecture decisions are recorded in [adr/](adr/README.md).

## Branches and PRs
- **Integration branch:** `feat/auth-and-BrandBookEditor`. All work merges here through PRs, and it merges into `main` at launch. (`develop` is retired; see [WORKFLOW.md](WORKFLOW.md).)
- **Branch names:** `feature/GNR-<n>` or `hotfix/GNR-<n>`, where `GNR-<n>` is the ticket.
- **Commits:** `type(scope): summary`. Never commit straight to the integration branch or `main`.
- **Stacked PRs:** if one PR builds on another, set each PR's base to the previous branch **and retarget it to the integration branch before merging**, or it merges into its parent and never arrives.
- **Tickets** live in your ticket tool (export: `GNR-export.json`). A ticket is Done when its PR has merged into the integration branch.

## Deploying
See [README.md](../README.md) (Deploy and Rollback). Hosting is a single Worker (ADR 0001).

## Still open / easy to trip on
