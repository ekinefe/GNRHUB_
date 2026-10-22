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

## Posts
`/admin/posts` lists every post with its status; New post opens a plain form with a live preview. Fields: title, address (follows the title until you edit it), who can see it, summary, tags, and the text in Markdown (`# heading`, `**bold**`, `*italic*`, `` `code` ``, `[link](https://...)`, lists, `>` quotes, fenced code). Raw HTML is shown as text, never run, and only `http`, `https`, `mailto` and site links are kept.
- **Draft:** only here. **Private:** your notebook, never returned by the public API. **Public:** listed on the blog. A draft or private post answers 404 on the public API, exactly like one that does not exist.
- API: public `GET /api/posts` (list, `?tag=`) and `GET /api/posts/:slug`; admin `GET`/`POST /api/admin/posts` and `GET`/`POST /api/admin/posts/:id` with `{ action: 'save' | 'delete' }`.

## Contact messages
`/admin/messages` lists what the contact form stored, newest first, with an unread count. Open one to read it (it is marked read), reply with a mailto link, mark it unread, or delete it (asks first). Messages are shown as plain text. The form itself is `POST /api/contact`: same-site only, validated, 3 messages per hour per client and 30 per hour overall, a hidden trap field for bots, and it answers 503 ("email me instead") if the database is missing, never silently losing a message.

## The screen
`/admin` (not linked anywhere, not in the sitemap, `noindex`) shows the sign-in form, then the admin shell. Plain `npm run dev` has no API behind it, so there you only see the form and sign-in cannot succeed; to try the whole thing run `npm run dev:worker` (builds first) and open http://localhost:8787/admin.
