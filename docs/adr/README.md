# Architecture decision records

One short file per decision: context, decision, consequences. Numbered, never rewritten; a changed decision gets a new record that supersedes the old one.

| # | Decision | Status |
|---|---|---|
| [0001](0001-single-worker.md) | One Cloudflare Worker serves site and API | accepted |
| [0002](0002-d1-and-drizzle.md) | D1 with Drizzle, no Supabase | accepted |
| [0003](0003-auth-better-auth.md) | Better Auth on D1 | proposed, needs owner approval |
| [0004](0004-typescript-for-backend-first.md) | TypeScript for new backend code first | accepted (frontend migration proposed) |
| [0005](0005-pdf-in-the-browser.md) | PDFs generated in the browser | accepted |
| [0006](0006-mail-deferred-and-queue-privacy.md) | Mail off by default; queue retention open | partly open |
| [0007](0007-portfolio-only.md) | GNRdigital is only the portfolio; tools are separate projects | accepted |

Not recorded yet: CV rendering approach (needs an owner decision).
