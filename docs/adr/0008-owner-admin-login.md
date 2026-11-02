# ADR 0008: Owner-only admin login (proposed)

Status: superseded by ADR 0009 (the owner chose a secret username and password over Better Auth, with 2FA later). Was: proposed, nothing built. Date: 2026-10-22. Refines ADR 0007.

## Context
Visitors never sign in. The owner wants an admin panel later, and that panel needs a login. Cloudflare Access would do it with no code but needs a payment card on file, which the owner does not want to give. The owner prefers OAuth or Better Auth, and would like two-factor login (an authenticator app such as Proton Authenticator) at a later stage, not as a launch requirement.

## Options
1. **Better Auth on D1** (the design in ADR 0003): sessions in D1, Google OAuth and/or email and password, TOTP two-factor through its two-factor plugin. Adds `better-auth` (and Drizzle) as dependencies and brings D1 back, used only for the owner's account and sessions.
2. **OAuth only (for example Google or GitHub), no passwords**, with an allow-list of the owner's email in a Worker secret. Smaller: no password storage, no reset flow. Needs a session cookie signed with a secret. Still needs a small library or hand-written code.
3. Cloudflare Access: rejected (needs a card).

## Recommendation
Option 1 or 2, decided when the admin panel has a concrete job. Whichever is chosen: exactly one allowed account (the owner's email, not open sign-up), a rate limit and bot check on the login route, 2FA added after the first version works, and no admin route reachable without a session (fail closed).

## Needs the owner
- What the admin panel manages (projects, About text, contact details?). Until that is known, there is nothing to protect.
- Approval of `better-auth` (and `drizzle-orm`) if option 1.
