# ADR 0013: The backend is split into domain code and application code

Status: accepted. Date: 2026-10-30. Source: Brent Roose, *Laravel Beyond CRUD* (Spatie, 2020), chapters "Domain oriented Laravel", "Actions" and "View models". The ideas are language independent; the book's PHP is not used.

## Context
`frontend/functions/modules/` is split by URL (`admin/`, `projects/`, `blog/`), not by subject. The projects subject lives in three places (`admin/projects.ts`, `projects/api.ts`, `projects/validate.ts`) and posts are the same. Each admin handler reads the request, checks the guard, validates, writes SQL and builds the answer in one function, and repeats the same `D1` and `Context` types, `readJson` and `idOf`. That makes a rule hard to test without a request and hard to find.

## Decision
Two layers, as in the book:
- **`functions/domain/<subject>/`** holds what the site *is*: types, validation (the book's DTO step), the SQL (`repository.ts`), use cases as plain functions (`actions.ts`, for example `saveProject`), and the shape sent to the client (`present.ts`, the book's view model). It knows nothing about `Request` or `Response`.
- **`functions/app/public/`** and **`functions/app/admin/`** are the two applications. They read the request, run the guard, call a domain action, and turn the result into a `Response`. No SQL and no business rules.
- **`functions/infra/`** holds helpers that belong to neither: the D1 type, `readJson`, `jsonNoStore`, security headers, failure handling.

Rules, enforced by a test: `domain/` never imports `app/`; `app/public/` and `app/admin/` never import each other; both may import `domain/` and `infra/`.

## What is taken from the book, and what is not
Taken: domains, the application layer, actions, keeping SQL out of handlers, view models, small state helpers (post draft/private/public, message read), test factories. Not taken: event-driven models, DTO factories, jobs and queues, a class per action. The site has one author and a few thousand lines, so each of these would add files without removing a problem.

## Consequences
- More files, fewer lines per file. A change to "projects" is one folder.
- Behaviour does not change during the move; the existing tests are the safety net and must stay green in every PR.
- The move is gradual, one subject per PR, projects first as the pilot. After the pilot we decide whether to go on.
- The frontend already groups by subject (`src/modules/`); only a note is added that `admin` is an application over several subjects.
