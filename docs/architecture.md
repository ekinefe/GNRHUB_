# Architecture

Small team, one app, no tenants. Code is organised by feature module, not by file type.

```
frontend/src/
  app/            App.jsx (routes) - wires modules together
  modules/
    portfolio/    home, about, projects, design system
    blog/         public blog list and post pages (posts are written in the admin panel)
    admin/        /admin sign-in, shell, messages and posts (talks to /api/admin/*)
    legal/        privacy, terms
    contact/      mailto + copy-email page
    colophon/     how the site is built
  shared/         ui, animations, layout, errors, commands, config, content, lib
frontend/functions/
  worker.ts       the Worker entry (routing table, error handling, security headers)
  _lib/           shared server helpers
```

GNRdigital is only the portfolio (ADR 0007). Brandbook Maker, CV Maker and Gym Tracker are separate projects; this site links to them from `shared/content/projects.js`.

## Repo layout
One app folder, `frontend/`, holds both the SPA (`src/`) and the backend (`functions/`). `docs/` and `.github/workflows/` sit at the repo root. The folder was deliberately not renamed to `web/` (GNR-141), and the Worker will be called `gnrdigital`. See the README for the tree.

## Rules (enforced by `src/architecture.test.js`)
- `shared/` never imports from `modules/` or `app/`.
- A module imports only `shared/` and itself. To share more, move it to `shared/`.

## Adding a page
1. A folder in `src/modules/<name>/` (or a file in an existing one) and a lazy route in `app/App.jsx`.
2. Add it to the nav in `shared/layout/Header.jsx` / `Footer.jsx` and to `shared/config/seo.js` if it should be in the sitemap.
3. Anything that needs a backend goes in `functions/` and is routed in `functions/worker.ts`; it must be off by default if it can send, write or cost money.

## Motion rules
- Ask `shared/config/effects.js` (`effectsReduced()` / `useReducedEffects()`), never check `prefers-reduced-motion` yourself. It combines the OS setting with the footer "Reduce effects" switch.
- Theme: `shared/config/theme.js` holds the accent (pink, cyan, amber, green) and the scanline toggle as `data-accent` / `data-scanlines` on `<html>`; `index.css` maps them to the `--cyber-pink` token. `public/theme-init.js` applies the saved choice before React mounts (a separate file, because the CSP forbids inline scripts). Keep its keys in sync with `theme.js`; a test checks it.
- Heavy effects (canvas, WebGL) go inside `SceneBoundary` so a failure shows a fallback, not an error page.
- Canvas loops stop while the tab is hidden or the element is off screen (`useInView`, `document.hidden`).
- Use the duration tokens (`duration-fast|base|slow`) and `Decrypt` for text effects.

## Accessibility notes
- Text contrast on the dark background (WCAG AA needs 4.5:1): muted 5.7, pink 5.9, offline red 5.6, cyan 14.8, amber 11.7. Borders are decorative (1.6) and never carry meaning alone.
- `DashboardLayout` has a skip link to `#main`; the header toggle is labelled and reports `aria-expanded`; the mobile menu closes on Escape and route change.
