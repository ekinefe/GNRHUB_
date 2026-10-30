# Cloudflare free-plan limits (GNR-29)

Budget is $0, so the site must work inside the Workers Free plan. Numbers below were read from the Cloudflare docs on **2026-10-23** (links at the end); they change, so re-check before relying on one.

## Limits that matter here
| What | Free plan | Source |
|---|---|---|
| Worker requests | 100,000 per day (resets 00:00 UTC) | Workers limits |
| CPU time per request | 10 ms (also for cron triggers) | Workers limits |
| Subrequests per request | 50 | Workers limits |
| Cron triggers | 5 per account | Workers limits |
| Worker size | 64 MiB | Workers limits |
| Static assets | 20,000 files per version, 25 MiB per file | Workers limits |
| D1 rows read | 5 million per day | D1 pricing |
| D1 rows written | 100,000 per day | D1 pricing |
| D1 storage | 5 GB per account, 500 MB per database | D1 pricing, D1 limits |
| D1 queries per Worker request | 50 | D1 limits |
| D1 Time Travel | 7 days | D1 Time Travel |
| Over the D1 daily limit | queries fail with an error until 00:00 UTC | D1 pricing |
| Over the Worker daily limit | Cloudflare error 1027 (what visitors see depends on the route's fail mode) | Workers limits |

Pages like `/about` are static files and do not run Worker code (`run_worker_first` lists only `/api/*`, `/sitemap.xml` and `/blog/feed.xml`). Whether static asset requests count against the 100,000 is **not confirmed here**; check the Workers pricing page when deploying.

## Worst case per feature
Estimates from the queries in the code, not measurements. "Rows" means D1 rows read or written.

| Feature | Worker requests | D1 per request | Realistic day | Worst case the code allows |
|---|---|---|---|---|
| Blog list `/api/posts` | 1 per visit | reads about N (public posts; 50 posts is about 50 rows) | tens of visits, a few thousand rows | a bot at full speed uses the 100,000 requests first (about 5 million rows at 50 posts, so reads and requests run out together) |
| Blog post `/api/posts/:slug` | 1 per read | a few rows | negligible | same as above |
| Sitemap and RSS | 1 per fetch | about N rows | a few fetches from feed readers | same as above |
| Contact form | 1 per send | 3 rows read, 4 written (limiter and the message) | a handful | capped by the limiter at 30 messages per hour for the whole site: 720 per day, about 2,900 rows written (3 percent of the daily write allowance) |
| Admin sign-in | 1 per try | 2-3 rows read, 3 written on a failure | one or two | capped at 40 failures per 15 minutes for everyone: 3,840 per day, about 11,500 rows written (12 percent) |
| Admin screens | a few per visit | a few rows | one person | one person |
| `/api/status` | 1 per ping | 1 trivial query | 288 per day at a 5-minute ping | same |

The written-row worst cases come from the built-in limiters (`contactLimit.ts`, `loginLimit.ts`), so a spammer cannot exhaust the write allowance; at worst they fill the two limiter budgets and real messages get a clear "try again later".

## What happens at a limit (graceful degradation)
- **D1 daily allowance used up:** the error is turned into `503` with `Retry-After: 3600` and the text "The site has used up its daily allowance. Please try again later." (`functions/infra/failure.ts`), not a bare 500. The contact form already answers a 503 with "Messages are not available right now. Please email me instead", and the blog list shows its "could not be loaded" state. Static pages keep working. D1's exact error text is not documented, so the match is deliberately broad (it looks for "limit", "quota" or "exceeded" next to D1); check it once if it ever happens.
- **Worker request allowance used up:** Cloudflare answers, not the code. Nothing to do in the repository; the status ping from `docs/observability.md` is how you find out.
- **Storage:** posts and messages are text; 500 MB is far beyond a personal site. Delete old read messages in the admin if it ever matters.

## Cron budget decision
This repository uses **no cron triggers** (0 of 5). Ticket Manager (3) and Planned Lost (1) are said to use 4 on the same account, which leaves exactly 1 free slot; **check the real number in the Cloudflare dashboard before adding any**. The decision: do not add schedules to this site. The email notice for contact messages (later) is sent when a message arrives, not from a timer, and backups are run by hand (`docs/backup.md`).

## Open risk: sign-in CPU time
The password check is PBKDF2 with 100,000 iterations (the most Workers allow). The free plan gives 10 ms of CPU per request and PBKDF2 may use more, in which case sign-in would fail with a CPU-limit error (1102). This cannot be tested without deploying. After the first deploy, sign in once and look in the Workers logs. If it fails, the options are the Workers Paid plan (5 USD a month, against the $0 budget, so the owner decides) or moving the sign-in off Workers; do not weaken the hash.

## Sources
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/reference/time-travel/
