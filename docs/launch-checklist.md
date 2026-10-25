# Launch checklist: legal and quality gate

Last reviewed: 2026-10-25 (GNR-155, refreshed after the admin, blog, projects and observability work). Ticked = verified, with how. Unticked = still open and needs the owner, a deployed site, or a real device.

## Links
- [x] No internal link leads to a dead route: `src/links.test.js` checks every literal link against `App.jsx` (it found and fixed `/services/brand-book` in the editor).
- [x] Removed areas (accounts, blogs, tools) 404 and nothing links to them (tests in `App.test.jsx`).
- [x] External links resolve: `npm run check:links` passed, 0 broken (LinkedIn answers bots with 999 and is reported "unverified").
- [x] Link check green in CI: the `check-links` job in `gatekeeper.yml` passes on the pull requests merged since (checked on PR #93 to #105).

## Privacy and tracking
- [x] No cookies, analytics or tracking scripts: no such code in `src/`, no `document.cookie`; the only browser storage is the "Reduce effects" preference and a reload flag, both disclosed on the Privacy page.
- [x] Fonts self-hosted: built `dist/index.html` and CSS contain no third-party URLs (GNR-81).
- [x] Privacy and Terms match what the site does (GNR-81).
- [ ] Confirm in DevTools on the deployed site: Application tab shows no cookies, Network tab shows no third-party requests.
- [ ] CV download: the "Download CV" button is **removed for now**. The PDF was never in git (CI build failed on the missing import) and it contains a phone number. To bring it back: make a redacted copy, commit it under `frontend/public/`, and link to it.

## Licenses and credits
- [x] `CREDITS.md` lists runtime packages, fonts and images with their licenses; adapted React Bits files carry a copyright header.
- [ ] Decide on React Bits (MIT + Commons Clause): fine inside the site, but the three adapted components must not be redistributed on their own. The repository is public, so confirm you are comfortable with that.
- [ ] Licence decision for the repository itself (GNR-130); `LICENSE` currently has uncommitted edits.

## Quality
- [x] Lighthouse on a production build served locally (`vite preview`, mobile profile): Performance 94 / 91 / 91, Accessibility 100, Best practices 100, SEO 92 for `/`, `/projects`, `/about`. Re-run on the deployed URL.
- [x] Accessibility: Lighthouse accessibility audits (axe-core based) have no failures on the three main pages, and 100 for accessibility and best practices on all 11 pages (home, about, projects, blog, a post, contact, admin sign-in, colophon, privacy, terms, 404) after the fixes in PR #86.
- [ ] Manual axe DevTools pass on the deployed site, including keyboard-only navigation.
- [x] `prefers-reduced-motion` and the "Reduce effects" switch are honoured (`effects.test.jsx`, `Decrypt.test.jsx`).
- [x] 404 and 500 pages exist and are tested (`Error.test.jsx`, `ErrorBoundary.test.jsx`, `App.test.jsx`).
- [x] Social image `public/og.png` and favicon exist and are referenced (GNR-153).
- [ ] Tested on a real phone (home, projects, about, contact, menu, copy-email button).
- [ ] Security headers grade A on the deployed site (needs hosting and GNR-26).

## Operations
- [x] A request id in every response and one structured log line per request, no IP address in it (`docs/observability.md`, tested).
- [x] `GET /api/status` answers 200, or 503 when the database fails (tested).
- [ ] An uptime monitor on `/api/status` that emails you (needs the live address and an account; steps in `docs/observability.md`).
- [x] A backup routine: Time Travel (7 days on the Free plan) and an export you encrypt yourself; the restore was rehearsed locally with real data (`docs/backup.md`).
- [ ] The same restore rehearsed against a scratch database in Cloudflare after the first deploy (steps in `docs/backup.md`).
- [x] Free-plan limits written down with a worst case per feature, and a clear 503 when the database allowance is used up (`docs/limits.md`).
- [ ] Sign-in tried once on the deployed site: PBKDF2 at 100,000 iterations may exceed the free plan's 10 ms CPU limit (`docs/limits.md`, open risk).
- [ ] The real cron count on the Cloudflare account checked in the dashboard (this site uses none).

## Content
- [x] The site is English only, recorded in ADR 0011 and kept by a test on `index.html`.
- [x] Projects, Home cards and About cards come from the admin panel with the built-in list as the fallback (ADR 0012).
- [ ] Projects added or imported in the admin panel on the deployed site, and the screenshots for new projects committed under `frontend/public/projects/`.
- [ ] A first blog post published, so `/blog` is not empty.

## Before pressing publish
- [ ] Admin secrets set with `wrangler secret put` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and optionally `ADMIN_TOTP_SECRET` for two-factor), the database created and migrated (docs/admin.md, docs/database.md), and a sign-in tested.
- [ ] Brand URL and OG image URL point at the final domain (`brand.publicUrl`, GNR-17).
- [ ] Repo and old name: `GNRHUB_` repo renamed (GNR-2).
- [x] Supabase removed (GNR-135).
