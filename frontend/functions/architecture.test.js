// @vitest-environment node
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { describe, it, expect } from 'vitest'

// Backend layout rules (ADR 0013, docs/architecture.md):
//   domain/<subject>/  imports only its own folder, infra/ and src/shared/lib; never app/ and never another subject
//   infra/             imports neither domain/ nor app/
//   app/public, app/admin  never import each other; they use domain/ and infra/
//   app/               contains no SQL: that is in a domain repository
const ROOT = join(process.cwd(), 'functions')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|js)$/.test(name)) out.push(p)
  }
  return out
}

const rel = (p) => relative(ROOT, p).split(sep).join('/')
const files = walk(ROOT).map((file) => ({ file, rel: rel(file) }))
const source = files.filter((f) => !f.rel.endsWith('.test.js') && !f.rel.startsWith('_test/'))

// Where each relative import points, as a path under functions/ (or outside it, starting with "../").
function importsOf(file) {
  const text = readFileSync(file, 'utf8')
  return [...text.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g)].map((m) => rel(resolve(dirname(file), m[1])))
}

const breaking = (pick, forbidden) =>
  source
    .filter(pick)
    .flatMap((f) => importsOf(f.file).filter((i) => forbidden(f.rel, i)).map((i) => `${f.rel} -> ${i}`))

describe('backend layout', () => {
  it('has no leftover _lib or modules folder', () => {
    expect(existsSync(join(ROOT, '_lib'))).toBe(false)
    expect(existsSync(join(ROOT, 'modules'))).toBe(false)
  })

  it('domain never imports app/', () => {
    expect(breaking((f) => f.rel.startsWith('domain/'), (_from, to) => to.startsWith('app/'))).toEqual([])
  })

  it('a domain subject does not import another subject', () => {
    const subject = (p) => p.split('/')[1]
    expect(breaking((f) => f.rel.startsWith('domain/'), (from, to) => to.startsWith('domain/') && subject(to) !== subject(from))).toEqual([])
  })

  it('infra imports neither domain/ nor app/', () => {
    expect(breaking((f) => f.rel.startsWith('infra/'), (_from, to) => /^(domain|app)\//.test(to))).toEqual([])
  })

  it('app/public and app/admin do not import each other', () => {
    expect([
      ...breaking((f) => f.rel.startsWith('app/public/'), (_from, to) => to.startsWith('app/admin/')),
      ...breaking((f) => f.rel.startsWith('app/admin/'), (_from, to) => to.startsWith('app/public/')),
    ]).toEqual([])
  })

  it('app/ has no SQL; it lives in a domain repository', () => {
    const bad = source.filter((f) => f.rel.startsWith('app/') && /\.prepare\(/.test(readFileSync(f.file, 'utf8'))).map((f) => f.rel)
    expect(bad).toEqual([])
  })

  it('a domain file imports nothing from outside functions/ except src/shared/lib', () => {
    const outside = breaking((f) => f.rel.startsWith('domain/'), (_from, to) => to.startsWith('..') && !to.includes('src/shared/lib/'))
    expect(outside).toEqual([])
  })
})
