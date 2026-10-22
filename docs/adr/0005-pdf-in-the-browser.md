# ADR 0005: PDFs are generated in the browser

Status: accepted. Date: 2026-10-17.

## Context
The brand book editor exports a PDF. A server renderer would cost money and need a queue; the data never needs to leave the user's browser for this.

## Decision
- `html2pdf.js` renders the editor's HTML to a PDF client-side. It is an approved dependency (it was imported but missing from `package.json`, which broke the build; fixed in GNR-168's batch).
- It loads only with the lazy brand book chunk, so the initial bundle budget (220 kB gzip) is untouched.
- The CSP allows what it needs (`blob:` and `data:` images, canvas); a manual check of the export after deploy is on the launch checklist.
- "Email the PDF" stays behind `MAIL_ENABLED` (ADR 0006).

## Consequences
- Output depends on the user's browser fonts and canvas; no server-side parity.
- CV rendering (templates, server or client) is a separate decision and is not covered here.
