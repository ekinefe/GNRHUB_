# Backup and restore (GNR-125)

The database `gnrdigital` holds contact messages and blog posts (`docs/database.md`). Two layers of protection, both free.

## 1. Time Travel (Cloudflare, nothing to set up)
D1 keeps a point-in-time history: **7 days on the Workers Free plan** (30 on Paid; checked in the D1 docs 2026-10-23). Use it for "I just deleted the wrong thing":
```
npx wrangler d1 time-travel info gnrdigital              # shows the current bookmark
npx wrangler d1 time-travel restore gnrdigital --timestamp=<unix seconds>
```
Restore overwrites the live database in place, so it is an owner action. Note the timestamp first.

## 2. Your own copy (survives losing the Cloudflare account)
```
npm run db:export:remote     # asks you to type the database name; writes backups/gnrdigital-remote-YYYY-MM-DD.sql
npm run db:export:local      # same for the local development database
```
`backups/` is git-ignored. The dump contains **names and emails from the contact form**, so encrypt it before it goes anywhere:
```
gpg --symmetric --cipher-algo AES256 backups/gnrdigital-remote-2026-10-23.sql   # asks for a passphrase, writes .sql.gpg
shred -u backups/gnrdigital-remote-2026-10-23.sql                                # remove the plain copy
```
Keep the `.gpg` file on a drive or cloud storage that is not Cloudflare, and the passphrase in your password manager (never in the repo). Suggested rhythm: monthly, and before every migration. Keep the last 12.

**Why not a scheduled GitHub Action:** it would need a Cloudflare API token stored as a repository secret, and this repository is public. A token with database access in CI is a risk for little gain with one owner and a few rows. If the site grows, run the export from a private repository instead.

## 3. Restore drill
Proven locally on 2026-10-23 with the real export: exported the local database (5 posts, 3 messages, 5 migrations), loaded the file into an empty scratch database, and the counts matched.
```
npm run db:export:local
npx wrangler d1 execute DB --local --persist-to /tmp/scratch --file backups/<file>.sql --config wrangler.jsonc
npx wrangler d1 execute DB --local --persist-to /tmp/scratch --command "SELECT COUNT(*) FROM posts" --config wrangler.jsonc
rm -r /tmp/scratch
```
To rehearse against Cloudflare itself (owner, once after the first deploy): decrypt a dump, `npx wrangler d1 create gnrdigital-scratch`, `npx wrangler d1 execute gnrdigital-scratch --remote --file <dump>.sql`, compare row counts with the live database, then `npx wrangler d1 delete gnrdigital-scratch`. The scratch database must have a different name from the live one; check the name before every command.

To really restore after a disaster: create the database again, bind it in `wrangler.jsonc`, then execute the dump with `--remote` (it already contains the tables and the migration history, so do not run the migrations first).
