import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

// "Nothing dead": every literal internal link in src/ must match a route in App.jsx.
const walk = (dir) => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : /\.jsx?$/.test(n) && !/\.test\./.test(n) ? [p] : []
})

const routes = [...readFileSync('src/app/App.jsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])
const known = (path) => routes.includes(path) || path === '/'

describe('internal links', () => {
    it('every literal to="/..." and navigate(\'/...\') points at a route', () => {
        const bad = []
        for (const file of walk('src')) {
            const text = readFileSync(file, 'utf8')
            for (const [, path] of text.matchAll(/(?:\bto=\{?["'`]|navigate\(\s*["'`])(\/[^"'`#?{}$]*)/g)) {
                if (!known(path)) bad.push(`${file}: ${path}`)
            }
        }
        expect(bad).toEqual([])
    })
})
