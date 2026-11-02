# ADR 0011: The site is English only

Status: accepted (GNR-83). Date: 2026-10-23.

## Context
The owner speaks Turkish, English and a little Polish. Visitors are mostly recruiters and teams reading the portfolio in English, and the CVs are in English. A second language doubles every text change (pages, blog, error messages, privacy text) and needs a language library, which would be a new dependency.

## Decision
- The site is English only. `<html lang="en">` is set in `index.html`; a test keeps it.
- No language library and no translation files. Page text lives in a few data files (`shared/content/*`, `shared/config/*`) and in the page components, so it stays easy to find if this is ever revisited.
- Blog posts are written in whatever language the post is in; a post that is not English should say so in its title or summary. The site chrome around it stays English.

## Consequences
- Revisit only if the owner decides to add Turkish or Polish. The first step then would be moving the remaining strings out of the components, then picking a small approach (a plain object per language, no library) before any dependency is considered.
