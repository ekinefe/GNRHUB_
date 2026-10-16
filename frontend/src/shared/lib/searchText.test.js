import { describe, it, expect } from 'vitest'
import { matchesQuery, highlightParts, closestTags } from './searchText'

describe('matchesQuery', () => {
    const fields = ['Brandbook Maker', 'help create a brand book', 'Design', 'pdf']
    it('matches a plain substring in any field', () => {
        expect(matchesQuery('pdf', fields)).toBe(true)
        expect(matchesQuery('design', fields)).toBe(true)
    })
    it('finds "brand" when typing "brnd"', () => {
        expect(matchesQuery('brnd', fields)).toBe(true)
    })
    it('needs every typed word to match', () => {
        expect(matchesQuery('brand zzz', fields)).toBe(false)
    })
    it('ignores case and accents', () => {
        expect(matchesQuery('BRÄND', ['brand'])).toBe(true)
    })
    it('does not fuzzy-match very short words', () => {
        expect(matchesQuery('bk', ['book'])).toBe(false)
    })
})

describe('highlightParts', () => {
    it('marks exact matches only', () => {
        expect(highlightParts('Brandbook Maker', 'brand')).toEqual([
            { text: 'Brand', match: true },
            { text: 'book Maker', match: false },
        ])
    })
    it('returns plain text when the query is empty', () => {
        expect(highlightParts('abc', '')).toEqual([{ text: 'abc', match: false }])
    })
})

describe('closestTags', () => {
    const tags = ['Embedded', 'Linux', 'Design', 'Data']
    it('suggests tags that contain or resemble the query', () => {
        expect(closestTags('da', tags)).toContain('Data')
        expect(closestTags('desing', tags)).toContain('Design')
    })
    it('returns nothing for an empty query', () => {
        expect(closestTags('', tags)).toEqual([])
    })
})
