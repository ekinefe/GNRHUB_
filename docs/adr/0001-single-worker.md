# ADR 0001: One Cloudflare Worker serves the site and the API

Status: accepted (GNR-16). Date: 2026-10-17.

## Context
The site ran on Cloudflare Pages with `functions/api/*` as Pages Functions. The plan adds D1 (GNR-132) and Better Auth (GNR-136), which are simpler on one Worker that owns both the static assets and `/api`.

## Decision
- One Worker named `gnrdigital` (the name never changes after the first deploy). `frontend/wrangler.jsonc`: `main = functions/worker.ts`, `nodejs_compat`, static assets from `dist/` with SPA fallback.
- `run_worker_first: ["/api/*"]`: only `/api/*` runs Worker code. Every other path, including deep links like `/about`, is served from assets, so refreshes never 404 and static hits cost no Worker request.
- `functions/worker.ts` is a small routing table using `URLPattern` (a Workers built-in). No Hono or other framework.
- A route is one file in `functions/api/` that re-exports from `functions/modules/<key>/`. Handlers keep the Pages signature, `onRequestGet` / `onRequestPost` taking `{ request, env }`, so they move without changes.
- Unknown `/api/*` returns JSON 404; a known route with the wrong method returns 405 with `Allow`; a thrown handler returns JSON 500.

## Consequences
- Pages preview deployments go away; Worker versions replace them (deploy ticket).
- Adding a prefix beyond `/api/*` (for example `/r/*`) means editing both `run_worker_first` and the routing table.
- `wrangler dev --local` (`npm run dev:worker`) serves the SPA and `/api` with a local D1.
- This commit changes the repo only. Nothing is deployed, and the existing Pages project is untouched until the owner switches hosting.
