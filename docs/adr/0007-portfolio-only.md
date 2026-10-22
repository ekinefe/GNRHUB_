# ADR 0007: GNRdigital is only the portfolio; tools are separate projects

Status: accepted. Date: 2026-10-22. Supersedes the direction of ADR 0003 (auth), which is now out of scope here.

## Context
The repo grew toward a platform: tools (Brand Book Maker, CV Maker, Gym Tracker), accounts, roles and an admin area. The owner decided each tool is its own project with its own repo and Worker, and GNRdigital stays a personal portfolio. Gym Tracker is on hold (good open-source options exist).

## Decision
- GNRdigital contains: Home, About, Projects, Contact, Colophon, Privacy, Terms, plus the design system page and the site shell (header, footer, command palette, theme controls).
- Each tool is a separate project that gets a Cloudflare Workers address (workers.dev now). When a domain is bought for the portfolio, tools move to subdomains (for example `cvmaker.<domain>`).
- GNRdigital only links to them. `shared/content/projects.js` holds each tool with `status` (`live`, `soon`, `paused`) and `url`. `url: null` means no address yet and the card shows its status with no link. Setting `url` and `status: 'live'` is the whole change when an address exists.
- Accounts, roles and module access belong to whichever tool needs them, not here. The module/role registry idea from the Planned_Lost comparison is not adopted.

## Consequences
- Removed from this repo in follow-up PRs: the Brand Book editor and its API, tool/blog/account flags and pages, the auth stub, the unused D1 tables and the rate limit / cron / Turnstile pieces that only served accounts. Anything that still serves the portfolio (Worker, security headers, CI, command palette) stays.
- The brand book code is copied out before deletion so it can start its own repo.
- Domain-dependent items (canonical URL, sitemap host, Open Graph URL) stay on `brand.publicUrl`, a single value to change when the domain exists.
