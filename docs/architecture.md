# Architecture

Small team, one app, no tenants. Code is organised by feature module, not by file type.

```
frontend/src/
  app/            App.jsx (routes) - wires modules together
  modules/
    auth/         login, register, AuthContext, ProtectedRoute, access levels
    brandbook/    Brandbook Maker
    tools/        tools catalogue page
    blog/         blog list
    portfolio/    home, about, projects, design system
    legal/        privacy, terms
    contact/      mailto + copy-email page
    registry.js   one entry per product: key, path, minimum access level
  shared/         ui, animations, layout, errors, config/brand
frontend/functions/
  api/            Cloudflare Pages route files only (thin re-exports)
  modules/<key>/  backend logic for a module
```

## Repo layout
One app folder, `frontend/`, holds both the SPA (`src/`) and the backend (`functions/`). `docs/` and `.github/workflows/` sit at the repo root. The folder was deliberately not renamed to `web/` (GNR-141), and the Worker will be called `gnrdigital`. See the README for the tree.

## Access levels
| Level  | Who                         | How decided                       |
|--------|-----------------------------|-----------------------------------|
| guest  | free, no login              | no session                        |
| member | free, logged in             | session, `profiles.role != admin` |
| admin  | owner                       | `profiles.role = 'admin'`         |

`modules/auth/access.js` has `canAccess(user, level)`. Guard routes with
`<ProtectedRoute minAccess="member" />`. Set each module's level in `modules/registry.js`.

## Rules (enforced by `src/architecture.test.js`)
- `shared/` never imports from `modules/` or `app/`.
- A module imports only `shared/`, itself, and platform modules (`auth`). To share more, move it to `shared/`.

## Adding a product
1. `src/modules/<key>/` for the UI, `functions/modules/<key>/` for the backend.
2. Entry in `modules/registry.js`, route in `app/App.jsx`.
3. A `functions/api/<name>.js` file that re-exports the handler (Pages needs it for the URL).

## Motion rules
- Ask `shared/config/effects.js` (`effectsReduced()` / `useReducedEffects()`), never check `prefers-reduced-motion` yourself. It combines the OS setting with the footer "Reduce effects" switch.
- Heavy effects (canvas, WebGL) go inside `SceneBoundary` so a failure shows a fallback, not an error page.
- Canvas loops stop while the tab is hidden or the element is off screen (`useInView`, `document.hidden`).
- Use the duration tokens (`duration-fast|base|slow`) and `Decrypt` for text effects.

## Accessibility notes
- Text contrast on the dark background (WCAG AA needs 4.5:1): muted 5.7, pink 5.9, offline red 5.6, cyan 14.8, amber 11.7. Borders are decorative (1.6) and never carry meaning alone.
- `DashboardLayout` has a skip link to `#main`; the header toggle is labelled and reports `aria-expanded`; the mobile menu closes on Escape and route change.
- Unfinished areas (account, tools, blogs, dashboard) are behind `VITE_FEATURES` (comma list, default none): flagged-off routes 404 and nothing links to them. Account controls (login / user menu) are also behind the legacy alias `VITE_FEATURE_ACCOUNT` and passed to the header as a slot, so `shared/` never imports `modules/`.
