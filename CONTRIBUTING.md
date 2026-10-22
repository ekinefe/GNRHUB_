# Contributing

Short version of [docs/WORKFLOW.md](docs/WORKFLOW.md). Where things live: [docs/REPO_GUIDE.md](docs/REPO_GUIDE.md).

1. **Setup:** Node 24 (`nvm use`), then
   ```bash
   cd frontend && npm install
   cp .env.example .env.local
   npm run dev
   ```
2. **Branch** from the integration branch as `feature/GNR-<n>`. Never commit to `main`.
3. **Commit** as `type(scope): summary`, small and focused.
4. **Check** before pushing: `npm run lint && npm run test:unit && npm run build` (in `frontend/`).
5. **Open a PR** using the template. CI must be green.

Ground rules: match the surrounding code, keep `shared/` independent of `modules/`, use Tailwind color tokens, put unfinished features behind `VITE_FEATURES`, add a test with each change, ask before adding a dependency, and never commit secrets.

## Testing

Tests sit next to the code (`*.test.js`). Server code in `frontend/functions/` is tested by calling the handler with a `Request` and a fake `env`, as `functions/worker.test.js` does. For anything that touches D1, use `frontend/functions/_test/testD1.js` instead of mocking queries: a small D1 look-alike over Node's built-in `node:sqlite` that applies the real files in `db/migrations/` first (`prepare().bind().first/all/run/raw`, `batch`, `exec`). Start such a test file with `// @vitest-environment node`.
