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

## Testing backend code

Tests sit next to the code (`*.test.js`). Every handler, every module logic file and every security rule gets one.

For anything that touches D1, use the test database instead of mocking queries: `frontend/functions/_test/testD1.js` is a small D1 look-alike over Node's built-in `node:sqlite` that applies the real files in `db/migrations/` first. So an injection or ownership test proves what the database actually does.

```js
// @vitest-environment node
import { createTestD1 } from '../_test/testD1.js'

const env = { DB: createTestD1(), ASSETS: {} }
const res = await handle(new Request('https://x.test/api/thing'), env)
```

Supported calls: `prepare().bind().first/all/run/raw`, `batch` (transactional) and `exec`. Add to it only when a handler needs more.

Not set up yet (each needs a new dev dependency, so ask first): a coverage report (`@vitest/coverage-v8`) and Playwright smoke tests.
