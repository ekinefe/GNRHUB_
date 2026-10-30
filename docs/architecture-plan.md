# Backend restructuring plan (ADR 0013)

Status: done (steps 1 to 9). Kept as a record of the order; the rules now live in [architecture.md](architecture.md).

Goal: split `frontend/functions/` into `domain/`, `app/` and `infra/` without changing any behaviour. Rules and reasons are in [ADR 0013](adr/0013-domain-and-app-backend.md).

## Target
```
functions/
  domain/
    projects/   types.ts  validate.ts  repository.ts  actions.ts  present.ts  *.test.js
    posts/      (same shape)
    messages/   (same shape)
    admin/      password, session, totp, rate limits (today in _lib/)
  app/
    public/     projects, posts, contact, status, feed, sitemap
    admin/      auth, projects, posts, messages, summary
  infra/        d1.ts  http.ts  security-headers.ts  failure.ts
  worker.ts     routing table only
```

## Steps (one PR each, from the integration branch)
| # | PR | Done when |
|---|---|---|
| 1 | ADR 0013 and this plan | docs only (#108) |
| 2 | `infra/` (#109): one D1 type, `readJson`, `idOf`, `jsonNoStore`, guard helpers | handlers import them; no copies left; all tests green |
| 3 | **Pilot** (#110): `domain/projects/` and thin `app/public`, `app/admin` handlers for projects | handlers have no SQL; actions are tested without a Request |
| 4 | Decision point | the pilot removed SQL and rules from the handlers and gave actions their own tests, so the rest followed |
| 5 | `domain/posts/` (#111) (draft, private, public as a small state helper) | same |
| 6 | `domain/messages/` (#112) and contact (read state, rate limit) | same |
| 7 | Auth moved (#113) to `domain/admin/` | `_lib/` is empty or gone |
| 8 | Architecture test and docs | `domain` -> `app` import fails the build; `REPO_GUIDE.md` and `CLAUDE.md` updated |
| 9 | Test factories (`_test/factories.js`) | repeated test data replaced |

## Rules for every step
- No change to routes, status codes, JSON shapes or SQL results. Run the full suite (`npm test`, lint, build) before pushing.
- Move files with `git mv` so history follows; do not change a file's content and move it in the same commit when it can be avoided.
- No new dependencies.
- Stop at step 4 if the extra layer does not remove a real problem.
