# GNRdigital

Portfolio that hosts small SaaS tools (Brandbook Maker today; Gym Tracker, CV Maker and Mail Sender planned).
Layout and access levels: [docs/architecture.md](docs/architecture.md).

## Quickstart

Needs Node 24 (`nvm use` reads `.nvmrc`).

```bash
cd frontend
npm install
cp .env.example .env.local            # add your Supabase URL and anon key
cp .dev.vars.example .dev.vars        # only needed to run the Functions locally
npm run dev                           # http://localhost:5173
```

Feature flags: unfinished areas are off by default and their routes show the 404. Switch them on at build time with
`VITE_FEATURES=account,tools,blogs,dashboard` (any subset) in `.env.local`. Email sending needs `VITE_FEATURE_MAIL=true` and `MAIL_ENABLED=true` on the server.

Checks: `npm run lint`, `npm run test:unit`, `npm run build` (all run in CI).

## Layout
- `frontend/src/modules/<feature>` - one folder per feature (auth, brandbook, tools, blog, portfolio, legal)
- `frontend/src/shared` - UI, layout and helpers any module may use
- `frontend/functions` - Cloudflare Pages Functions (`api/` routes, logic in `modules/`)
