# Brand

GNRdigital is my personal brand, not a studio. **GNR** comes from my surname (Gungor); **digital** is what I make with it. The About page says this in the first person (`about.nameStory` in `shared/content/about.js`).

## Lockup
- **GNR** in extra-bold, **digital** in light, a pink `_` cursor, and a small pink `v2` tag. Monospace (JetBrains Mono).
- Component: `shared/ui/Wordmark.jsx` (header). Text values live in `shared/config/brand.js`.
- Favicon (`public/favicon.svg`): a bold `G` and a pink cursor bar. Checked at 16 px and 32 px; the full word does not fit at 16 px, so the favicon is the mark only.
- Social image: `public/og.png` (1200x630). Source is `scripts/og/og.html`; regenerate with `bash scripts/og/make-og.sh` (needs Chrome). Its URL follows `brand.publicUrl` through `%BRAND_URL%` in `index.html`.
- Colors come from the Tailwind tokens (`cyber-text`, `cyber-pink`, `cyber-cyan`), never hard-coded in components.

## Tagline options
1. **Small, reliable tools.** (in use: `brand.tagline`, shown on the social image)
2. Tools that remove manual steps.
3. GNR, made digital.

To switch, change `brand.tagline` and the text in `scripts/og/og.html`, then regenerate the image.

## Domain and handles (checked 2026-10-16, indicative only)
| Name | Status |
|---|---|
| gnrdigital.com | Registered (Hostinger) and parked. Not verified whether it is mine. |
| gnrdigital.io, .pl, .net | WHOIS shows no registration |
| gnrdigital.dev, .app | WHOIS gave no answer; check at a registrar |
| github.com/gnrdigital | 404 (free) |
| x.com/gnrdigital | 404 for logged-out visitors, which is not proof it is free |

## The old name
The rename away from GNRHUB is done in the UI. Two real URLs still contain the old name until the matching tickets land: the GitHub repo `ekinefe/GNRHUB_` (rename in GNR-2) and the live URL `gnrhub.pages.dev` (new domain in GNR-17). Both are single values in `shared/config/profile.js` and `shared/config/brand.js`.

## Typography

- **One face for the whole site: JetBrains Mono** (Tailwind `font-sans` and `font-mono` are both it). That is the terminal look.
- **Space Grotesk** is self-hosted and exposed as `font-display` for big headings, but no page uses it yet. Using it is a design choice for later, not a bug.
- Both are self-hosted woff2 from `frontend/public/fonts/` (SIL Open Font License), `font-display: swap`, latin and latin-ext only. No request goes to Google Fonts (a test checks `index.html`). The main font is preloaded; font files are cached for a year, so **rename a file when you change a font**.
- The type scale is Tailwind's, listed in `src/shared/config/typeScale.js` and shown on `/design`.
- The brand book editor's font picker loads Google Fonts on purpose (it previews the visitor's choice). That page is behind the `tools` flag.
