# Observability (GNR-126)

Free and built in: no Sentry or other service (it would be a new dependency).

## What the Worker does
- `observability.enabled` in `frontend/wrangler.jsonc` turns on Workers Logs in the Cloudflare dashboard (Workers & Pages, `gnrdigital`, Observability).
- Every request writes one JSON line: `{ id, method, path, status, ms }`. The path has no query string. There is **no IP address, cookie, header or body** in it (a test checks this).
- The same `id` is returned in the `X-Request-Id` response header. If something fails for you, copy the header from DevTools and search the logs for it.
- Unexpected errors are logged as `{ id, method, path, error }` where `error` is only the error class name; the message never reaches the log or the visitor (`functions/_lib/failure.ts`).

## `GET /api/status`
Public, answers `{ "ok": true, "db": "ok" }`.
- `200`: the Worker runs and the database answers (`db: "ok"`), or no database is bound yet (`db: "missing"`, before the first deploy setup).
- `503` with `{ "ok": false, "db": "error" }`: the database is bound but a trivial query fails.
It shows nothing else (no counts, versions or secrets).

## Alert when it fails (owner, after the first deploy)
1. Create a free account on an uptime monitor (for example UptimeRobot or Better Stack free tier) or a Cloudflare Health Check if your plan has one.
2. Monitor `https://<your address>/api/status`, every 5 minutes, alert on any non-200 answer, send the alert to your email.
3. Test it once: temporarily rename the binding in a preview or stop the monitor's target and confirm the mail arrives.

This step needs the live address and an account, so it is not done in the repository.
