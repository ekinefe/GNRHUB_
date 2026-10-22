import { describe, it, expect } from 'vitest'
import { parseHex, toHex, contrastRatio, passes, formatRatio, rgbToHsl, hslToRgb, rgbToCmyk, suggestAccessible, paletteFrom, simulateCvd, CVD_TYPES } from './color'

const ratio = (a, b) => contrastRatio(parseHex(a), parseHex(b))

describe('color', () => {
    it('parses 3 and 6 digit hex, with or without #, and rejects junk', () => {
        expect(parseHex('#FF318C')).toEqual([255, 49, 140])
        expect(parseHex('0af')).toEqual([0, 170, 255])
        expect(parseHex('nope')).toBeNull()
        expect(parseHex('#12345')).toBeNull()
        expect(toHex([255, 49, 140])).toBe('#FF318C')
    })

    // Reference values from the WCAG definition / WebAIM checker.
    it('matches reference contrast ratios', () => {
        expect(ratio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
        expect(ratio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5)
        expect(ratio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2)
        expect(ratio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2)
        expect(ratio('#FFFFFF', '#767676')).toBeCloseTo(4.54, 2) // symmetric
    })

    it('applies the AA and AAA thresholds', () => {
        expect(passes(4.54)).toBe(true)
        expect(passes(4.48)).toBe(false)
        expect(passes(3, 'AA', true)).toBe(true)
        expect(passes(6.9, 'AAA')).toBe(false)
        expect(passes(4.5, 'AAA', true)).toBe(true)
        expect(formatRatio(4.4999)).toBe('4.49:1') // never rounds a failing ratio up to a pass
    })

    it('converts HSL, CMYK', () => {
        expect(rgbToHsl([255, 0, 0])).toEqual([0, 1, 0.5])
        expect(hslToRgb([120, 1, 0.5])).toEqual([0, 255, 0])
        expect(hslToRgb(rgbToHsl([255, 49, 140]))).toEqual([255, 49, 140])
        expect(rgbToCmyk([0, 0, 0])).toEqual([0, 0, 0, 100])
        expect(rgbToCmyk([255, 255, 255])).toEqual([0, 0, 0, 0])
        expect(rgbToCmyk([255, 0, 0])).toEqual([0, 100, 100, 0])
    })

    it('suggests an accessible version of a failing colour, same hue', () => {
        const bg = parseHex('#FFFFFF')
        const fixed = suggestAccessible(parseHex('#FF318C'), bg)
        expect(contrastRatio(parseHex(fixed), bg)).toBeGreaterThanOrEqual(4.5)
        expect(Math.abs(rgbToHsl(parseHex(fixed))[0] - rgbToHsl([255, 49, 140])[0])).toBeLessThan(6)
        expect(suggestAccessible(parseHex('#111111'), bg)).toBe('#111111') // already fine
        const onDark = suggestAccessible(parseHex('#333333'), parseHex('#000000'))
        expect(contrastRatio(parseHex(onDark), [0, 0, 0])).toBeGreaterThanOrEqual(4.5) // lightens on dark
    })

    it('builds five shades from light to dark', () => {
        const p = paletteFrom(parseHex('#FF318C'))
        expect(p).toHaveLength(5)
        expect(ratio(p[0], '#FFFFFF')).toBeLessThan(ratio(p[4], '#FFFFFF'))
    })

    it('simulates colour-vision deficiency: greys stay grey, red/green collapse', () => {
        for (const t of CVD_TYPES) {
            const grey = simulateCvd([128, 128, 128], t).map(Math.round)
            expect(Math.max(...grey) - Math.min(...grey)).toBeLessThanOrEqual(2)
        }
        const [r, g] = simulateCvd([255, 0, 0], 'deuteranopia')
        expect(Math.abs(r - g)).toBeLessThan(120) // red no longer far from green channel
        expect(() => simulateCvd([0, 0, 0], 'nope')).toThrow()
    })
})
