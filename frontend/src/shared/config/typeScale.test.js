import { describe, it, expect } from 'vitest'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'
import { typeScale } from './typeScale'

const theme = resolveConfig(tailwindConfig).theme

describe('typeScale', () => {
    it('lists only real Tailwind sizes with the right pixel value', () => {
        for (const { cls, px } of typeScale) {
            const size = theme.fontSize[cls.replace('text-', '')]
            expect(size, cls).toBeDefined()
            expect(parseFloat(Array.isArray(size) ? size[0] : size) * 16, cls).toBe(px)
        }
    })

    it('is ordered small to large', () => {
        const px = typeScale.map((t) => t.px)
        expect([...px].sort((a, b) => a - b)).toEqual(px)
    })
})

describe('fonts', () => {
    it('Tailwind defines the display family and keeps JetBrains Mono as the default', () => {
        expect(theme.fontFamily.sans[0]).toBe('"JetBrains Mono"')
        expect(theme.fontFamily.display[0]).toBe('"Space Grotesk"')
    })
})
