
## The screen
`/admin` (not linked anywhere, not in the sitemap, `noindex`) shows the sign-in form, then the admin shell. Plain `npm run dev` has no API behind it, so there you only see the form and sign-in cannot succeed; to try the whole thing run `npm run dev:worker` (builds first) and open http://localhost:8787/admin.
