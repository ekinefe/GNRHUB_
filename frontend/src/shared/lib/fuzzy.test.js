import { describe, it, expect } from 'vitest'
import { fuzzyScore, fuzzyFilter } from './fuzzy'

describe('fuzzy', () => {
    it('matches letters in order, case-insensitively, and rejects others', () => {
        expect(fuzzyScore('prj', 'Projects')).toBeGreaterThan(0)
        expect(fuzzyScore('PRJ', 'projects')).toBeGreaterThan(0)
        expect(fuzzyScore('jrp', 'Projects')).toBe(-1)
        expect(fuzzyScore('', 'anything')).toBe(0)
    })

    it('ranks consecutive and word-start matches higher', () => {
        expect(fuzzyScore('con', 'Contact')).toBeGreaterThan(fuzzyScore('con', 'Colophon not'))
        const ranked = fuzzyFilter([{ title: 'About' }, { title: 'Contact' }, { title: 'Colophon' }], 'co')
        expect(ranked.map((r) => r.title)).toEqual(['Contact', 'Colophon'])
    })

    it('also searches keywords', () => {
        expect(fuzzyFilter([{ title: 'Toggle effects', keywords: 'motion animation' }], 'anim')).toHaveLength(1)
    })
})
