# Database (Cloudflare D1)

Schema lives in `frontend/db/schema.ts` (Drizzle). Migrations are generated SQL in `frontend/db/migrations/`. D1 settings are in `frontend/wrangler.jsonc` (the same file the Worker uses).

No launch feature uses D1 yet. The first migration is empty.

## Workflow (run from `frontend/`)
1. Edit `db/schema.ts`.
2. `npm run db:generate`, then read the new SQL in `db/migrations/`.
3. `npm run db:migrate:local`, then test. State lives in `.wrangler/` (git-ignored).
4. Commit.
5. Only then `db:migrate:preview` (dev database) and `db:migrate:remote` (prod). Both ask you to type the database name, and refuse to run without a terminal.

| Script | What it does |
|---|---|
| `db:generate` | drizzle-kit writes a migration from the schema diff |
| `db:migrate:local` | applies migrations to the local D1 |
| `db:migrate:preview` | applies to the **remote dev** database (confirmation) |
| `db:migrate:remote` | applies to the **remote prod** database (confirmation) |
| `db:seed:local` | runs `db/seed.sql` locally |
| `db:query:local -- "SQL"` | runs one statement locally |

`db:studio` from the ticket is not included yet; it needs a table to be useful.

## Databases
Two: `gnrdigital-prod` and `gnrdigital-dev` (previews). Check the spelling, because a typo stays forever to match the dashboard.

Creating them is a remote action done by the owner, once:
```bash
npx wrangler d1 create gnrdigital-prod
npx wrangler d1 create gnrdigital-dev
```
Then put the printed ids into `wrangler.jsonc` (`database_id` = prod, `preview_database_id` = dev). Never create them against an account holding other projects' databases without checking the name list first (`npx wrangler d1 list`).

Rules: no SQL built from strings in app code; use Drizzle.
