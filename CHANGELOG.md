# Changelog

All notable changes. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/). Drafts come from `npm run changelog` (see [docs/RELEASING.md](docs/RELEASING.md)).

## [0.1.0] - unreleased

First public launch: static portfolio on one Cloudflare Worker.

### Added
- Pages: Home, About, Projects, Contact, Colophon, Privacy, Terms; tools, blogs and accounts behind `VITE_FEATURES`.
- Single Worker with a routing table, central error handling, security headers and CSP, D1 rate limiting and Turnstile gate (off until configured), a cron dispatcher.
- D1 schema as code (Drizzle) with local and preview databases.
- CI: audit, lint, tests, build, bundle budget, security sweep.

### Changed
- Hosting moves from Pages to a Worker; Supabase removed.

### Security
- The open mail relay is disabled behind `MAIL_ENABLED`.
