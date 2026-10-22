# Admin sign-in (ADR 0009)

One admin: you. Visitors never sign in. The login is three Worker secrets, not database rows, so a database leak cannot leak it.

| Secret | What it is |
|---|---|
| `ADMIN_USERNAME` | The username you choose |
| `ADMIN_PASSWORD_HASH` | A PBKDF2 hash of your password, made by the script below (never the password itself) |
| `SESSION_SECRET` | 32+ random characters that sign the session cookie. Changing it signs everyone out |

## Set them up (once, on your machine)
```bash
cd frontend
npm run admin:secret -- hash       # asks for a password (hidden, 12+ characters) and prints ADMIN_PASSWORD_HASH
npm run admin:secret -- session    # prints a random SESSION_SECRET
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put SESSION_SECRET   # each asks you to paste the value
```
Use a passphrase of several words. The hash is stored with a random salt and the iteration count (100,000, the most Workers allow). If you forget the password, make a new hash and run `wrangler secret put ADMIN_PASSWORD_HASH` again.

For `npm run dev:worker` put the same three names in `frontend/.dev.vars` (git-ignored; see `.dev.vars.example`). Create the database tables with `npm run db:migrate:local` first, because failed sign-ins are counted in D1.

## How it behaves
- `POST /api/admin/login` with `{ "username", "password" }` from the same site (the `Origin` header must match). Success sets an `HttpOnly; Secure; SameSite=Strict` cookie for 8 hours. A wrong username and a wrong password get the same answer.
- 5 wrong guesses per client and 40 in total per 15 minutes lock the login (429 with `Retry-After`). The counter stores a keyed hash of the address, never the address. If a secret or the database is missing, the login is unavailable (503), never open.
- `GET /api/admin/me` says whether you are signed in; `POST /api/admin/logout` clears the cookie.
- Every other admin route must start with `requireAdmin(request, env)` (and `{ changes: true }` when it changes data). No cookie, no answer.
- Two-factor login with an authenticator app is planned, not built.
