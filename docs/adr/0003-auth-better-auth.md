# ADR 0003: Better Auth on D1 for sign-in

Status: proposed. Waiting on the dependency approval and the first-superadmin choice (GNR-136). Date: 2026-10-17.

## Context
Accounts are needed for the tools (brand book, later Gym, CV, mail). The owner wants the same shape as the Planned_Lost project: Better Auth, Drizzle and D1 on a Worker.

## Decision (to confirm)
- **Library:** Better Auth with `drizzleAdapter` on D1. It is a NEW DEPENDENCY, so it needs the owner's approval before anything is installed. Not approved yet.
- **Per-request factory:** `getAuth(env)` builds the auth object on each request. No module-level singleton, because Worker bindings only exist per request.
- **Tables:** `users` (with additional fields `username`, `first_name`, `last_name`), `sessions`, `accounts`, `verifications`. These exist in `db/schema.ts` already.
- **Admin identity:** a separate `admin_users` table on purpose, so a user row can never grant itself admin.
- **Runtime:** the `nodejs_compat` flag stays on (password hashing imports `node:crypto`); it is already set in `wrangler.jsonc`.
- **Email verification and password reset:** switched on only once the Mail module is configured. Until then sign-up works without email.
- **Google OAuth:** optional, later.
- **Bot protection:** Turnstile (`humanGate`) and the D1 rate limiter already exist for the sign-up and sign-in endpoints.

## Open decisions for the owner
1. Approve adding `better-auth` (and confirm Drizzle, already approved).
2. First superadmin: a first-run `/setup` page, or a one-time seed script run by the owner. Recommendation: seed script, because `/setup` is an open endpoint until someone uses it.

## Consequences
- Until accepted, `authClient.js` reports "Sign-in is not available yet." and the account area stays off behind `VITE_FEATURES`.
