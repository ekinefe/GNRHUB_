# Copy rules

Personal site, first person, plain English.

## Where each voice goes
| Place | Voice | Examples |
|---|---|---|
| Navigation, headings people scan, primary buttons | Plain words | Home, Tools, Blogs, About, Contact, Download CV, Email me, Send email, Copy email |
| Tool screens and small details (empty states, loading, status lines, errors) | Terminal voice, kept short | ACCESS_TOOL, AUTH_REQUIRED, INITIALIZE_USER, `Found 3 results`, ERR_PAGE_NOT_FOUND |
| Legal pages | Plain, short, accurate | Terms, Privacy |

Buttons already render in uppercase (CyberButton), so write them in normal case: `Email me`, not `EMAIL_ME`.

## Rules
1. A primary action is a normal word a stranger understands without the theme.
2. Terminal voice is flavor, never the only way to understand what something does. If a terminal-style label could confuse, add the plain word next to it.
3. First person ("I build...") on About and Home; no "we".
4. No mention of any employer or company. This is a personal site with no connection to one.
5. Errors say what happened and what to do next, in one sentence, before any flavor line.
6. Sentence case for text, `UPPER_SNAKE` only for terminal-voice labels.
