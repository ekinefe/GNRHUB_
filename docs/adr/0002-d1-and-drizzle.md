# ADR 0002: Cloudflare D1 with Drizzle, no Supabase

Status: accepted (GNR-132, GNR-63, GNR-135). Date: 2026-10-17.

## Context
Auth and data started on Supabase, which made a fresh checkout load blank without keys and added a second vendor. The owner prefers staying on Cloudflare, and the budget is $0.

## Decision
- Data lives in Cloudflare D1, bound as `DB` on the single Worker (ADR 0001).
- The schema is code: `frontend/db/schema.ts` (Drizzle). `drizzle-kit generate` writes SQL migrations to `frontend/db/migrations/`, applied with wrangler. Nobody edits tables by hand.
- Two databases: `gnrdigital-prod` and `gnrdigital-dev`; the preview environment binds dev. Remote commands need the database name typed and refuse to run without a terminal.
- Supabase and its client were removed. Sign-in sits behind `modules/auth/authClient.js` until the auth ADR (0003) is built.
- D1 has no row-level security, so user-owned data is scoped by the session user id in code and tested against a real migrated SQLite (`functions/_test/testD1.js`).

## Consequences
- One vendor, no keys needed to run the static site.
- Tests exercise the real migrations without a network.
- Moving off D1 later means re-implementing the thin query layer; the SQLite dialect keeps that small.
