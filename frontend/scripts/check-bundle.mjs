// Fails when the JavaScript needed for first paint grows past the budget.
// Usage: npm run check:bundle   (run after `npm run build`)
// Counts the entry script plus every modulepreload link in dist/index.html, gzipped.
// Lazy route chunks (for example the brand book editor) are not counted.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB ?? 220)
const dist = new URL('../dist/', import.meta.url).pathname

export function initialScripts(html) {
  const found = new Set()
  for (const m of html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) found.add(m[1])
  for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) found.add(m[1])
  return [...found]
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = initialScripts(readFileSync(join(dist, 'index.html'), 'utf8'))
  if (files.length === 0) {
    console.error('No scripts found in dist/index.html. Did you run npm run build?')
    process.exit(1)
  }
  let total = 0
  for (const f of files) {
    const kb = gzipSync(readFileSync(join(dist, f))).length / 1024
    total += kb
    console.log(`${kb.toFixed(1).padStart(7)} kB gzip  ${f}`)
  }
  console.log(`${total.toFixed(1).padStart(7)} kB gzip  initial JS (budget ${BUDGET_KB} kB)`)
  if (total > BUDGET_KB) {
    console.error('Initial JS is over budget. Lazy-load something or raise the budget on purpose.')
    process.exit(1)
  }
}
