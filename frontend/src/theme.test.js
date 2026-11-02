import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import tailwindConfig from '../tailwind.config.js'

// Every `cyber-<name>` class must exist in tailwind.config.js. Tailwind silently ignores
// unknown colors, so an undefined token (e.g. cyber-primary) renders as "no style at all".
const defined = new Set(Object.keys(tailwindConfig.theme.extend.colors.cyber))

function sourceFiles(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) return sourceFiles(path)
        return /\.(jsx?|css)$/.test(name) && !name.endsWith('.test.js') && !name.endsWith('.test.jsx') ? [path] : []
    })
}

const withoutComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')

describe('Tailwind color tokens', () => {
    it('uses only cyber-* colors that are defined in tailwind.config.js', () => {
        const undefinedTokens = []
        for (const file of sourceFiles('src')) {
            for (const [, token] of withoutComments(readFileSync(file, 'utf8')).matchAll(/cyber-([a-z]+)/g)) {
                if (!defined.has(token)) undefinedTokens.push(`${file}: cyber-${token}`)
            }
        }
        expect(undefinedTokens).toEqual([])
    })
})
