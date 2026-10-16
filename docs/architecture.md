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
    registry.js   one entry per product: key, path, minimum access level
  shared/         ui, animations, layout, errors, lib/supabase, config/brand
frontend/functions/
  api/            Cloudflare Pages route files only (thin re-exports)
  modules/<key>/  backend logic for a module
```

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
