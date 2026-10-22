# Database (Cloudflare D1)

D1 holds **content only** (ADR 0009): contact messages and blog posts. Admin login never uses it (the login is Worker secrets). One database, `gnrdigital`, bound as `DB` in `frontend/wrangler.jsonc`.

## Workflow (run from `frontend/`)
1. Add a numbered SQL file in `db/migrations/` (`0001_name.sql`, plain SQL, never edit an applied one).
2. `npm run db:migrate:local` applies it to the local database in `.wrangler/` (safe).
3. Test it: tests run on the real migration files through `functions/_test/testD1.js` (a D1 look-alike over Node's built-in `node:sqlite`). Use bound values (`prepare(...).bind(...)`) only, never string-built SQL (the security sweep flags it).
4. Commit. Only then the owner runs `npm run db:migrate:remote`, which asks you to type the database name and refuses to run without a terminal.

`npm run db:query:local -- "SELECT 1"` runs one statement against the local database.

## Creating the real database (owner, once)
The binding has no `database_id` on purpose. The first `npx wrangler deploy` creates the database `gnrdigital` (answer yes if wrangler asks). If it does not, run `npx wrangler d1 create gnrdigital` and put the printed id in `wrangler.jsonc` as `database_id`. Then `npm run db:migrate:remote`. Never create or migrate it against an account that holds other projects' data without checking the name first.

## Tables
Added with the features that need them (contact form, blog): see the migration files.
