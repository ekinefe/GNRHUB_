# ADR 0009: One-owner admin, contact messages and a blog

Status: accepted. Date: 2026-10-22. Replaces ADR 0008 (proposed) and the "no data layer" part of ADR 0007.

## Context
The site is the owner's portfolio and should help them get work: people must be able to reach them (a contact form, with messages read in an admin panel), and the owner wants a blog for research notes, things learned and a private notebook. Visitors never sign in. There is exactly one admin, the owner. Cloudflare Access is out (it needs a payment card).

## Decision
**Sign-in (admin only).**
- One account. `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are Worker secrets (`wrangler secret put`), not database rows, so a database leak cannot leak the login. The hash is PBKDF2-SHA256 with a random salt, made by `scripts/hash-password.mjs` on the owner's machine; the iteration count is stored in the hash so it can be raised later.
- A successful login sets a signed session cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, 8 hours), signed with `SESSION_SECRET` (HMAC-SHA256). No session table; changing `SESSION_SECRET` signs everyone out. Logout clears the cookie.
- Login attempts are rate limited per client (counters in D1) and compared in constant time; the error never says whether the username or the password was wrong. Admin routes fail closed: no valid session, no answer. Changing data needs a same-origin request (origin check) on top of SameSite.
- No auth library; the Web Crypto API in the Workers runtime is enough. Two-factor login (an authenticator app such as Proton Authenticator, standard TOTP) is planned for later and is not required for the first version.

**Data (D1, content only).**
- D1 returns for two things: `contact_messages` and `posts`. Login never touches the database except for the attempt counter.
- Plain SQL migrations in `frontend/db/migrations/` applied with wrangler, prepared statements with bound values only, no ORM. Tests run against the real migrations on `node:sqlite`.
- Remote databases are created and migrated by the owner, never by an assistant.

**Contact.** A form on `/contact` (the `mailto` link stays). Messages are validated, length-capped, protected by a honeypot field and a rate limit, stored, and shown in the admin panel (unread, read, delete). No email is sent yet; an email notice through a mail provider is added later. Cloudflare Turnstile can be added when keys exist.

**Blog.**
- Posts have a status: `draft`, `private` (only the owner sees it, for the notebook) or `public` (listed, with tags). Written in Markdown in a small plain editor in the admin panel.
- Markdown is rendered to React elements by a small own renderer (no HTML strings, links limited to `http`, `https` and `mailto`), so a post can never inject script.
- Public pages `/blog` and `/blog/:slug`; private and draft posts are never returned by the public API and are not in the sitemap.
- Not brought over from the owner's Planned_Lost blog: AI drafting, the fact-check panel, daily plan automation and the heavy editor.

**Plan (one PR each).** 1 this ADR. 2 D1 binding, migrations and a test database. 3 admin login and session. 4 contact form and messages. 5 blog API and admin editor. 6 public blog pages, nav and sitemap. 7 docs, privacy page and CSP updated for what is now stored.

## Consequences
- The Privacy page must say that messages sent through the form are stored (and for how long) before the form ships. The CSP and the security sweep stay as they are; new routes get tests.
- The owner sets three secrets by hand: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`. A lost password means generating a new hash and updating the secret.
- Adding a second admin or another sign-in method later means revisiting this ADR; the pros and cons of Better Auth against this setup are to be shown to the owner when that comes up.
