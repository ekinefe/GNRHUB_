# Brand

GNRdigital is my personal brand, not a studio. **GNR** comes from my surname (Gungor); **digital** is what I make with it. The About page says this in the first person (`about.nameStory` in `shared/content/about.js`).

## Lockup
- **GNR** in extra-bold, **digital** in light, a pink `_` cursor, and a small pink `v2` tag. Monospace (JetBrains Mono).
- Component: `shared/ui/Wordmark.jsx` (header). Text values live in `shared/config/brand.js`.
- Favicon (`public/favicon.svg`): a plain pink monospace-style `G` with a black outline and no box, so it reads on dark and light tab bars. Checked at 16 px and 128 px; the full word does not fit at 16 px, so the favicon is the mark only.
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

## Design rules

The look is a terminal: a plain near-black background, monospace, one pink accent. These rules keep new work in that look. If a rule and a good idea disagree, change the rule here in the same PR.

### Colour
- Only tokens: Tailwind `cyber-*` classes (`text-cyber-pink`), never a hex in a component. The one file allowed raw colours is `shared/config/tokens.js` (canvas drawing and the accent preview dots); a test enforces it.
- **One accent per screen.** `cyber-pink` is the accent and the accent switcher (pink, cyan, amber, green) remaps it, so anything that should follow the chosen accent uses `cyber-pink`. `cyber-cyan` is the quiet second colour (labels, links in running text); status colours (`active`, `beta`, `offline`) only mean status.
- Text on the dark background must pass WCAG AA (4.5:1). Muted text is the lowest allowed grey. Borders are decoration and never carry meaning alone.

### Type
- JetBrains Mono everywhere (see Typography above). Sizes come from the Tailwind scale in `typeScale.js`; do not invent pixel sizes except for decorative ASCII.
- Body line length stays under about 80 characters (`max-w-lg` to `max-w-2xl` on paragraphs). Headings are sentence or terminal style as in `docs/copy.md`; buttons are written in normal case and rendered uppercase by `CyberButton`.

### Layout
- The background is plain near-black (no grid or pattern; the grid was removed). Do not put a box or bordered column around page content; `PageShell` is just a centred container.
- Widths: `PageShell width="5xl"` (really `max-w-6xl`, about 1150px) for text pages, `7xl` (really `max-w-screen-2xl`, 1536px) for Home. The header and footer use the same 1536px width and gutters so the logo lines up with the content. Gutters are `px-4` on phones and `md:px-10` above. Content is left-aligned.
- Sections are separated by space and, at most, one thin rule (`border-t border-cyber-border`). Cards (`border border-cyber-border`) are for things that are really separate items such as a project, not for every group of text.
- Mobile first: no horizontal scroll from 320px up. Long unbroken headings use `[overflow-wrap:anywhere]`.

### Motion and effects
- Motion is rare and means something. The Home donut is the one always-moving thing; everything else moves only in answer to the visitor (hover, focus, open, copy).
- Always go through `shared/config/effects.js`; respect the OS setting and the footer "Reduce effects" switch. Use the duration tokens (`duration-fast`, `-base`, `-slow`). Heavy effects sit in `SceneBoundary` and stop off screen or in a hidden tab. More in `docs/architecture.md` (Motion rules).
- ASCII art is decorative: `aria-hidden`, never the only place something is said, and limited to the Home donut. The scanline overlay is a visitor choice, off by default.

### Components and states
- Build from `shared/ui` (`CyberButton`, `Input`, `Modal`, `Tabs`, `Toast`...). If a variant is missing, add it there and show it on `/design`; do not restyle in a page.
- Every interactive element has a visible focus ring (`focus-visible:ring-2 focus-visible:ring-cyber-cyan`), a hit area of at least 40px on touch screens, and a state for hover, disabled, error and empty.
- Icons are `lucide-react` at `w-4 h-4` inside buttons; an icon alone needs an `aria-label`.

### Content
- Plain words, active voice, honest status: a project that is not live says `COMING SOON` or `ON HOLD` and has no link. Errors say what happened and what to do. Personal details and public URLs live once in `shared/config/profile.js` and `brand.js`.

### Checking a change
1. `npm run lint && npm run test:unit && npm run build && npm run check:bundle` (bundle budget 220 kB gzip of first-load JS).
2. Look at it: `npm run dev`, then at least 1920 and 390 pixels wide, with Reduce effects on and off.
3. New colour pairs go through the contrast numbers above; new components get a test and a place on `/design`.
