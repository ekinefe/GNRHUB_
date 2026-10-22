// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { scanFile, scanWrangler, scanGitignore, sweep, renderReport } from './security-sweep.mjs'

const rules = (f) => f.map((x) => x.rule)
// Fake secrets are assembled at runtime so this file does not trip the sweep itself.
const AWS = 'AK' + 'IA' + 'ABCDEFGHIJKLMNOP'

describe('security sweep', () => {
  it('flags tracked secret files but not examples', () => {
    expect(rules(scanFile('frontend/.env.local', ''))).toContain('secret-file-tracked')
    expect(rules(scanFile('frontend/.dev.vars', ''))).toContain('secret-file-tracked')
    expect(scanFile('frontend/.dev.vars.example', '')).toEqual([])
    expect(scanFile('frontend/.env.example', '')).toEqual([])
  })

  it('flags secret patterns and honours sweep-ignore', () => {
    expect(rules(scanFile('frontend/src/a.js', `const k = '${AWS}'`))).toEqual(['secret-pattern'])
    expect(scanFile('frontend/src/a.js', `const k = '${AWS}' // sweep-ignore`)).toEqual([])
  })

  it('flags SQL built with interpolation in functions, not bound SQL', () => {
    expect(rules(scanFile('frontend/functions/x.ts', 'db.prepare(`SELECT * FROM t WHERE a = ${id}`)'))).toEqual(['sql-interpolation'])
    expect(scanFile('frontend/functions/x.ts', "db.prepare('SELECT * FROM t WHERE a = ?').bind(id)")).toEqual([])
    expect(scanFile('frontend/functions/x.ts', 'db.prepare(`SELECT * FROM t WHERE a = ?`).bind(id)')).toEqual([])
  })

  it('flags dangerous DOM sinks in src and functions only', () => {
    expect(rules(scanFile('frontend/src/a.jsx', '<div dangerouslySetInnerHTML={{ __html: x }} />'))).toEqual(['dangerous-sink'])
    expect(scanFile('frontend/scripts/a.mjs', 'eval(x)')).toEqual([])
  })

  it('flags target=_blank without noopener', () => {
    expect(rules(scanFile('frontend/src/a.jsx', '<a href="x" target="_blank">x</a>'))).toEqual(['blank-target-no-noopener'])
    expect(scanFile('frontend/src/a.jsx', '<a href="x" target="_blank" rel="noopener noreferrer">x</a>')).toEqual([])
    expect(scanFile('frontend/src/a.jsx', '<a href="x" target="_blank" rel="noreferrer">x</a>')).toEqual([])
  })

  it('skips test files for source rules', () => {
    expect(scanFile('frontend/src/a.test.jsx', 'eval(x)')).toEqual([])
  })

  it('flags a secret value in wrangler.jsonc but allows comments mentioning it', () => {
    expect(scanWrangler('{ // no secret here\n "name": "x" }')).toEqual([])
    expect(rules(scanWrangler('{ "vars": { "API_KEY": "abc" } }'))).toEqual(['wrangler-secret'])
  })

  it('requires .env and .dev.vars in .gitignore', () => {
    expect(scanGitignore('.env\n.dev.vars\n')).toEqual([])
    expect(scanGitignore('node_modules\n').map((f) => f.detail)).toEqual(['.env is not ignored', '.dev.vars is not ignored'])
  })

  it('the repository itself is clean', () => {
    const root = new URL('../../', import.meta.url).pathname.replace(/\/$/, '')
    const { findings } = sweep(root)
    expect(findings).toEqual([])
  })

  it('renders a report', () => {
    expect(renderReport({ files: 3, findings: [] }, '2026-01-01')).toContain('No findings')
    expect(renderReport({ files: 3, findings: [{ rule: 'r', path: 'p', line: 1, detail: 'd' }] }, '2026-01-01')).toContain('| r |')
  })
})
