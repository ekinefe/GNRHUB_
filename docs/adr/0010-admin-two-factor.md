# ADR 0010: Two-factor sign-in for the admin (authenticator app), and the Better Auth comparison

Status: accepted. Date: 2026-10-22. Builds on ADR 0009.

## Context
The owner asked for two-factor login with an authenticator app (Proton Authenticator) once the admin worked, and to be shown the pros and cons of the two ways to do sign-in again: the setup already built (a secret username and password, no library) and Better Auth.

## Decision
- Optional second factor, standard TOTP (RFC 6238: HMAC-SHA1, 30-second steps, 6 digits), which every authenticator app reads (Proton Authenticator, Aegis, Google Authenticator...). Written on Web Crypto, no library; checked against the RFC's test vectors.
- It is on when the secret `ADMIN_TOTP_SECRET` exists and off when it does not, so nothing changes until the owner sets it. `npm run admin:secret -- totp` makes the secret and the address to add it to the app (typed by hand: account `admin`, issuer `GNRdigital`).
- Sign-in then needs username, password **and** code. A wrong password and a wrong code give the same answer and take the same time; every wrong try counts toward the lock. A code works once (the newest accepted step is kept in `admin_totp`, one row), one step either side is accepted for clock drift.
- Not built, on purpose: recovery codes and QR images. If the phone is lost, the owner removes `ADMIN_TOTP_SECRET` with `wrangler secret delete` and signs in with the password alone, then sets a new secret. That works because the owner controls the Cloudflare account, which is the real root of trust here.

## The two ways, side by side

| | Secret username and password (what we have) | Better Auth |
|---|---|---|
| Who it fits | One owner, forever | Several people, roles, sign-up |
| Where credentials live | Worker secrets; a database leak cannot leak them | In D1 (users, sessions, accounts tables) |
| Code to maintain | About 300 lines of our own, all tested; a security bug would be ours | A maintained library; its updates fix its bugs, but it is a large dependency to keep current |
| Dependencies | None | Better Auth, plus Drizzle (ORM) and its migration tooling |
| Google sign-in | Not built (would be hand-written OAuth) | Built in, optional |
| Password reset, email verification | None; the owner resets the secret by hand | Built in, needs a mail provider |
| Two-factor | TOTP, built (this ADR) | Built in (a plugin), also passkeys |
| Several admins or roles | Does not fit | Fits |
| Sessions can be revoked one by one | No (changing `SESSION_SECRET` signs everyone out) | Yes |
| Cost and free-plan fit | No database use for sign-in, one cheap PBKDF2 check | More database reads per request, more CPU; fits the free plan but with less room |
| Setup | Three or four `wrangler secret put` commands | Schema, migrations, config, secrets, OAuth app |

**Recommendation:** stay with the current setup while there is one admin. Switch to Better Auth only if a second person needs access, if Google sign-in or password reset become real needs, or if the owner wants to stop maintaining sign-in code. The switch is contained: the admin routes only call `requireAdmin`, so replacing sign-in does not touch the screens.

## Consequences
- Setting it up is the owner's job: run the `totp` command, add the key to the app, then `wrangler secret put ADMIN_TOTP_SECRET`, and apply migration `0004` remotely.
- Anyone who gets both the password and the phone gets in; it is not a hardware-key level of protection.
