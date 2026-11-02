import { describe, it, expect } from 'vitest'
import { slugify, SLUG_PATTERN } from './slugify'

describe('slugify', () => {
    it('makes lower-case hyphenated ascii', () => {
        expect(slugify('Hello, World!  Again')).toBe('hello-world-again')
        expect(slugify('  --Trim me--  ')).toBe('trim-me')
    })
    it('folds accents and Turkish letters', () => {
        expect(slugify('Şifreleme ve Güvenlik, ığüöç')).toBe('sifreleme-ve-guvenlik-iguoc')
        expect(slugify('Café déjà vu Łódź')).toBe('cafe-deja-vu-lodz')
    })
    it('drops anything that is not a letter or digit, and is empty for nothing useful', () => {
        expect(slugify('密码 !!!')).toBe('')
        expect(slugify('<script>alert(1)</script>')).toBe('script-alert-1-script')
        expect(slugify(undefined)).toBe('')
    })
    it('cuts to the limit without a trailing hyphen, and always matches the pattern when not empty', () => {
        const s = slugify('word '.repeat(40), 20)
        expect(s.length).toBeLessThanOrEqual(20)
        expect(s.endsWith('-')).toBe(false)
        for (const t of ['A b C', 'x', '2026 notes', 'a--b']) expect(SLUG_PATTERN.test(slugify(t))).toBe(true)
    })
})
