import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, it, expect } from 'vitest'

// Colors live in src/index.css (:root). Components use Tailwind token classes or var(--cyber-*), never raw values.
// Allowed: index.css (the definitions), shared/config/tokens.js (canvas fallbacks), BrandBookEditor
// (colors there are user content), assets and tests.
const ALLOWED = ['src/index.css', 'src/shared/config/tokens.js', 'src/modules/brandbook/BrandBookEditor.jsx']
const RAW = /#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(\s*\d/g

function files(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) return name === 'assets' ? [] : files(path)
        return /\.(jsx?|css)$/.test(name) && !/\.test\.jsx?$/.test(name) ? [path] : []
    })
}

const strip = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')

describe('design tokens', () => {
    it('has no raw hex or rgb() color values outside the token files', () => {
        const hits = []
        for (const file of files('src')) {
            const rel = file.split(sep).join('/')
            if (ALLOWED.includes(rel)) continue
            for (const m of strip(readFileSync(file, 'utf8')).matchAll(RAW)) hits.push(`${rel}: ${m[0]}`)
        }
        expect(hits).toEqual([])
    })

    it('defines every cyber-* color as a CSS variable', () => {
        const css = readFileSync('src/index.css', 'utf8')
        const config = readFileSync('tailwind.config.js', 'utf8')
        for (const [, name] of config.matchAll(/--cyber-([a-z]+)\)/g)) {
            expect(css).toContain(`--cyber-${name}:`)
        }
    })
})
