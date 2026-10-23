# ADR 0012: The portfolio projects are managed in the admin panel

Status: accepted. Date: 2026-10-24. Extends ADR 0009 (D1 holds content only).

## Context
Home, About and the Portfolio page all read one list of projects, which lived in `shared/content/projects.js`. Changing a project (status, a link, a new screenshot, a new project) meant editing code, a pull request and a deploy. The owner wants the Portfolio page, and what Home and About show from it, controlled from the admin panel.

## Decision
- A `projects` table in D1 (migration `0005`) is the source of truth: name, kind, summary, technologies, points, status, links, optional screenshot, "what I learned", whether it shows on Home and About, and an order number. A project is either a `project` or a `tool` (a separate project shown in its own block).
- `GET /api/projects` is public (it is the same text the page shows) and cached for 30 seconds. `/api/admin/projects` (list, one, create, save, delete) is behind `requireAdmin` and the same-origin check, like posts.
- **The list built into the site stays as the fallback.** The pages show it while the API loads and keep it if the API fails, there is no database yet, or the table is empty. So the site is never blank, and nothing changes until the owner adds a project. The admin screen has one button, "Import the built-in projects", that copies the built-in list into the database so it can be edited.
- Once the table has at least one project, only the database list is shown. Deleting every project returns to the built-in list.
- Screenshots are not uploaded. A project may name a file that is already in `frontend/public/projects/` (`/projects/name.png`); the server accepts only that path pattern, so a project cannot point at another site or at script. Links must be `https://`.
- The "Experiments" block on the Portfolio page stays in `projects.js` for now: it is four short lines, not worth a screen.

## Consequences
- A change to a project is a form and a save; it shows within a minute (the cache). No deploy.
- A new screenshot still needs the file added to the repo and a deploy (R2 or uploads are parked, GNR-134).
- Brief flash: the built-in list shows for a moment before the owner's list replaces it when the two differ. Accepted over showing a blank page or a spinner.
- `shared/content/projects.js` is now "defaults", and its header says so.
