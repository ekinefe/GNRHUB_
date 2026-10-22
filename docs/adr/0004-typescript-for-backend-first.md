# ADR 0004: TypeScript for new backend code, frontend migrates later

Status: accepted for new code; frontend migration proposed. Date: 2026-10-17.

## Context
The Worker, schema and `_lib` helpers are new. The React app is JavaScript and has no type errors to catch yet.

## Decision
- New files under `frontend/functions/` and `frontend/db/` are TypeScript (`.ts`), run by wrangler and Vitest without a separate compile step.
- Existing `.jsx` files are not renamed in bulk. A file moves to TypeScript when it is changed for another reason, or in one planned ticket once the Worker work settles.
- No `tsc` gate in CI yet; adding one is part of the frontend migration ticket.

## Consequences
- Mixed JS and TS for a while. Imports of `.ts` files use the extension.
- The ESLint config covers `.js` and `.jsx`; TS files are checked by the editor and tests until the migration adds typescript-eslint (a new dev dependency, ask first).
