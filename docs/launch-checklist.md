# Launch checklist: legal and quality gate

Last reviewed: 2026-10-16 (GNR-155). Ticked = verified, with how. Unticked = still open and needs the owner, a deployed site, or a real device.

## Links
- [x] No internal link leads to a dead route: `src/links.test.js` checks every literal link against `App.jsx` (it found and fixed `/services/brand-book` in the editor).
- [x] Flagged-off areas 404 and nothing links to them (GNR-152, tests in `App.test.jsx`).
- [x] External links resolve: `npm run check:links` passed, 0 broken (LinkedIn answers bots with 999 and is reported "unverified").
- [ ] Link check green in CI: the `check-links` job is in `gatekeeper.yml`; confirm it passes on the first PR run.

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
- [x] Accessibility: Lighthouse accessibility audits (axe-core based) have no failures on the three pages.
- [ ] Manual axe DevTools pass on the deployed site, including keyboard-only navigation.
- [x] `prefers-reduced-motion` and the "Reduce effects" switch are honoured (`effects.test.jsx`, `Decrypt.test.jsx`).
- [x] 404 and 500 pages exist and are tested (`Error.test.jsx`, `ErrorBoundary.test.jsx`, `App.test.jsx`).
- [x] Social image `public/og.png` and favicon exist and are referenced (GNR-153).
- [ ] Tested on a real phone (home, projects, about, contact, menu, copy-email button).
- [ ] Security headers grade A on the deployed site (needs hosting and GNR-26).

## Before pressing publish
- [ ] Brand URL and OG image URL point at the final domain (`brand.publicUrl`, GNR-17).
- [ ] Repo and old name: `GNRHUB_` repo renamed (GNR-2).
- [x] A deploy with empty Supabase values no longer loads blank (client falls back to placeholders). Supabase itself still goes with GNR-135.
