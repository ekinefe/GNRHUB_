# ADR 0006: Mail is off by default; queue privacy is an open decision

Status: moved with the tools to their own projects (ADR 0007); the send-brandbook route was removed from this repo. Was: mail deferral accepted (GNR-15); queue retention open (GNR-115). Date: 2026-10-17.

## Context
The first `/api/send-brandbook` was an open relay: no auth, any recipient, unescaped HTML. Separately, the original note says uploaded contact lists are never stored, but a mailing queue has to store recipient emails.

## Decision
- Anything that can send, write or cost money is off by default behind a flag. Mail needs `MAIL_ENABLED=true` exactly; otherwise the route returns 501.
- The provider (Resend) is not enabled until the mail sprint rebuilds sending behind auth, a rate limit and Turnstile. Third-party API keys will live encrypted in D1, not in env vars.

## Open decision: retention of queued recipients (needs the owner)
Options, with the trade-off:
1. **Keep only for the job, purge on completion** with a cron job (the cron dispatcher exists). Simple, honest, small window of storage. Recommended.
2. **Encrypt the recipient column.** Stronger at rest, but the key still has to be on the Worker, and rows still exist.
3. **Stream from the upload, store nothing.** Matches the old promise, but a failure mid-send loses the job, and retries are impossible.

Whatever is chosen, the Privacy page must describe the real behavior before mailing is enabled.
