import { describe, it, expect } from 'vitest'
import { suggestRoute, editDistance } from './suggestRoute'

const routes = ['/', '/about', '/projects', '/contact', '/colophon', '/privacy', '/terms']

describe('suggestRoute', () => {
    it('suggests the closest page for a typo, a prefix or a different case', () => {
        expect(suggestRoute('/projetcs', routes)).toBe('/projects')
        expect(suggestRoute('/proj', routes)).toBe('/projects')
        expect(suggestRoute('/About', routes)).toBe('/about')
        expect(suggestRoute('/en/contcat', routes)).toBe('/contact')
    })

    it('suggests nothing for something unrelated, too short, or empty', () => {
        expect(suggestRoute('/zzzzzz', routes)).toBeNull()
        expect(suggestRoute('/a', routes)).toBeNull()
        expect(suggestRoute('/', routes)).toBeNull()
    })

    it('survives a malformed escape sequence', () => {
        expect(suggestRoute('/%E0%A4%A', routes)).toBeNull()
    })

    it('computes edit distance', () => {
        expect(editDistance('kitten', 'sitting')).toBe(3)
        expect(editDistance('', 'abc')).toBe(3)
        expect(editDistance('same', 'same')).toBe(0)
    })
})
