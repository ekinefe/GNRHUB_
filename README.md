# GNRdigital

Personal portfolio of Ekin Efe Gungor ("GNR" from the surname, "digital" from what I make with it). It is only the portfolio. Brandbook Maker, CV Maker and Gym Tracker (on hold) are separate projects with their own Workers; this site links to them (ADR 0007).

- Where things are: [docs/REPO_GUIDE.md](docs/REPO_GUIDE.md) · layout rules and access levels: [docs/architecture.md](docs/architecture.md)
- How we work (branches, commits, PRs): [docs/WORKFLOW.md](docs/WORKFLOW.md), [CONTRIBUTING.md](CONTRIBUTING.md) · rules for AI assistants: [CLAUDE.md](CLAUDE.md)
- Releases: [docs/RELEASING.md](docs/RELEASING.md) · [CHANGELOG.md](CHANGELOG.md)
- Wording: [docs/copy.md](docs/copy.md) · brand: [docs/brand.md](docs/brand.md)
- `ProjectInfo.md` is the **original design note**, now partly superseded (each section says so). The live plan is the GNR tickets.

## Status

| Area | Today | Planned |
|---|---|---|
| Hosting | One Cloudflare Worker serving the static site (not deployed yet) | Custom domain once bought |
| Data and sign-in | None. Visitors never sign in | An owner-only admin area is being considered |
| Launch pages | Home, About, Projects, Contact, Colophon, Privacy, Terms | Nothing else planned; tools are separate projects |

## Quickstart

Needs Node 24 (`nvm use` reads `.nvmrc`).

```bash
cd frontend
npm install
cp .env.example .env.local     # optional, nothing is required
npm run dev                    # http://localhost:5173
```

### Checks (CI runs the same)
```bash
npm run lint          # zero warnings allowed
npm run test:unit     # Vitest, also covers functions/
npm run build         # output in frontend/dist
npm run check:links   # every external link in src/ (needs network)
```

## Configuration

Nothing is required to run or build the site. Build-time variables would go in `frontend/.env.local` (never committed; `.env.example` is a template), server secrets in `frontend/.dev.vars` (copy `.dev.vars.example`) locally and `wrangler secret put` in production. No secret belongs in `wrangler.jsonc` or the repo. The only binding is `ASSETS` (the built site).

## Architecture (now)

```
browser --> Cloudflare Worker (frontend/functions/worker.ts)
              |-- /api/*  Worker routes (none today); adds security headers to everything
              '-- everything else  --> static site (Vite build, React SPA)
```

The site is a client-rendered SPA. Every page except Home loads on demand. Content (profile, projects) is plain data in `frontend/src/shared/content/`. Fonts are self-hosted and the site sets no cookies (see the Privacy page). See [docs/architecture.md](docs/architecture.md) and the decision records in [docs/adr/](docs/adr/README.md).

## Deploy

Nothing is deployed yet. The owner deploys by hand (an assistant never runs these):

```bash
cd frontend
npm run build
npx wrangler deploy      # first run asks you to log in; creates the Worker "gnrdigital" on workers.dev
```

Check the result at the printed `*.workers.dev` address. When a domain is bought, attach it to the Worker in the Cloudflare dashboard (Workers, gnrdigital, Settings, Domains) and set `brand.publicUrl` in `frontend/src/shared/config/brand.js`. Budget is $0.

## Rollback

- **Fast:** Cloudflare dashboard, Workers, gnrdigital, Deployments, pick the last good version and roll back (or `npx wrangler rollback` from `frontend/`). Takes effect immediately and changes no code.
- **Permanent:** revert the bad commit on a branch (`git revert <sha>`), open a PR, merge, and deploy again.
- After a rollback, open the site and check Home, About, Projects and Contact load.

## Licence

The code is released under the [MIT licence](LICENSE) (copyright Ekin Efe Gungor). Not covered by it: my written text, photo and CV, and the third-party material in [CREDITS.md](CREDITS.md) (including three React Bits components under MIT + Commons Clause, and the GSAP library, which keep their own terms). A stricter "No-SaaS" draft is parked in [docs/license-draft-no-saas.md](docs/license-draft-no-saas.md).

## Repository layout

```
GNRdigital_v2/
  frontend/        the one app folder: React SPA (src/) and the backend (functions/) side by side
  docs/            guides, architecture, brand, launch checklist
  .github/         workflows live at the repo root (GitHub only reads them there)
```

Decisions (GNR-141): the app folder stays `frontend/` (no rename to `web/`), and the Worker is named `gnrdigital`. CI runs from `frontend/` (`cd frontend`, cache key `frontend/package-lock.json`), so keep those paths in `gatekeeper.yml` in sync with any move.

Inside the app folder:
- `frontend/src/modules/<feature>`: one folder per feature (portfolio, legal, contact, colophon)
- `frontend/src/shared`: UI, layout, config, content and helpers any module may use
- `frontend/functions`: the Worker (`worker.ts` routing table, `_lib/` helpers)
