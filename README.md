# GNRdigital

Personal portfolio of Ekin Efe Gungor ("GNR" from the surname, "digital" from what I make with it). It launches as a static site and is meant to grow into a host for small tools (Brandbook Maker today; Gym Tracker, CV Maker and Mail Sender planned).

- Where things are: [docs/REPO_GUIDE.md](docs/REPO_GUIDE.md) · layout rules and access levels: [docs/architecture.md](docs/architecture.md)
- How we work (branches, commits, PRs): [docs/WORKFLOW.md](docs/WORKFLOW.md), [CONTRIBUTING.md](CONTRIBUTING.md) · rules for AI assistants: [CLAUDE.md](CLAUDE.md)
- Wording: [docs/copy.md](docs/copy.md) · brand: [docs/brand.md](docs/brand.md)
- `ProjectInfo.md` is the **original design note**, now partly superseded (each section says so). The live plan is the GNR tickets.

## Status

| Area | Today | Planned |
|---|---|---|
| Hosting | Cloudflare Pages (static site + Functions) | One Cloudflare Worker (GNR-16) |
| Data and auth | Supabase sign-in, hidden at launch | D1 + Better Auth (GNR-132, GNR-136) |
| Email | Off (`MAIL_ENABLED` unset) | Rebuilt behind auth in the mail sprint |
| Launch pages | Home, About, Projects, Contact, Colophon, Privacy, Terms | Tools, Blogs, accounts switch on per release |

## Quickstart

Needs Node 24 (`nvm use` reads `.nvmrc`).

```bash
cd frontend
npm install
cp .env.example .env.local     # then fill the two Supabase values, see the note below
npm run dev                    # http://localhost:5173
```

> **Supabase values are optional while sign-in is hidden.** With them empty the app still loads (the client falls back to placeholders and logs a warning), but sign-in will not work. Supabase goes away with GNR-135.

### Checks (CI runs the same)
```bash
npm run lint          # zero warnings allowed
npm run test:unit     # Vitest, also covers functions/
npm run build         # output in frontend/dist
npm run check:links   # every external link in src/ (needs network)
```

## Configuration

Build-time variables (Vite, `frontend/.env.local`, never committed):

| Variable | Purpose | Default |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase client (see note above) | required |
| `VITE_FEATURES` | Comma list that switches on unfinished areas: `account`, `tools`, `blogs`, `dashboard`. Off routes show the 404. | none |
| `VITE_FEATURE_ACCOUNT` | Legacy alias for `account` | `false` |
| `VITE_FEATURE_MAIL` | Shows "email report" in the brand book editor | `false` |

Server variables (Functions; locally in `frontend/.dev.vars`, copy `.dev.vars.example`; in production set as secrets):

| Variable | Purpose | Default |
|---|---|---|
| `MAIL_ENABLED` | `true` lets `/api/send-brandbook` run. Otherwise it returns 501. | unset (off) |
| `RESEND_API_KEY` | Resend key, only used when mail is enabled | unset |

## Architecture (now)

```
browser --> Cloudflare Pages --> static site (Vite build, React SPA)
                |
                +--> /api/*  Pages Functions (frontend/functions)
                +--> Supabase (sign-in only, hidden at launch)
```

The site is a client-rendered SPA. Every page except Home loads on demand. Content (profile, projects, tools) is plain data in `frontend/src/shared/content/`. Fonts are self-hosted and the site sets no cookies (see the Privacy page). Next: a single Worker serving the SPA and the API, with D1 and Better Auth, as tickets GNR-16, GNR-132 and GNR-136 describe.

## Deploy

The Pages project is **not created yet**; GNR-16 replaces it with a Worker. Until then, to deploy:

1. Cloudflare dashboard, Workers & Pages, create a Pages project named `gnrdigital`, connect the GitHub repo.
2. Build settings: root directory `frontend`, build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=24`.
3. Set the production variables from the tables above (Supabase values only if `account` is in `VITE_FEATURES`).
4. Push to the production branch. Pages builds and publishes. Pull requests get preview URLs.

Do not run any remote or production command (`wrangler`, database migrations) without the owner's confirmation. Budget is $0.

## Rollback

- **Fast:** Cloudflare dashboard, the project, Deployments, pick the last good deployment, "Rollback to this deployment". Takes effect immediately and changes no code.
- **Permanent:** revert the bad commit on a branch (`git revert <sha>`), open a PR, merge, and let Pages deploy the fix.
- After a rollback, open the site and check Home, About, Projects and Contact load.

## Licence

The code is released under the [MIT licence](LICENSE) (copyright Ekin Efe Gungor). Not covered by it: my written text, photo and CV, and the third-party material in [CREDITS.md](CREDITS.md) (including three React Bits components under MIT + Commons Clause, and the GSAP library, which keep their own terms). A stricter "No-SaaS" draft is parked in [docs/license-draft-no-saas.md](docs/license-draft-no-saas.md).

## Repository layout

```
GNRdigital_v2/
  frontend/        the one app folder: React SPA (src/) and the backend (functions/) side by side
  docs/            guides, architecture, brand, launch checklist
  .github/         workflows live at the repo root (GitHub only reads them there)
  database/, microservices/   empty placeholders for later releases
```

Decisions (GNR-141): the app folder stays `frontend/` (no rename to `web/`; it would conflict with every open branch and buy nothing), and the future Worker is named `gnrdigital`. CI runs from `frontend/` (`cd frontend`, cache key `frontend/package-lock.json`), so keep those paths in `gatekeeper.yml` in sync with any move.

Inside the app folder:
- `frontend/src/modules/<feature>`: one folder per feature (auth, brandbook, tools, blog, portfolio, legal, contact, colophon)
- `frontend/src/shared`: UI, layout, config, content and helpers any module may use
- `frontend/functions`: Pages Functions (`api/` route files, logic in `modules/`)
