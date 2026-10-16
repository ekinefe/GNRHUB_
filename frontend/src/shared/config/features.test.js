import { describe, it, expect } from 'vitest'
import { parseFeatures } from './features'

describe('parseFeatures', () => {
    it('has everything off by default', () => {
        expect(parseFeatures()).toEqual({ account: false, tools: false, blogs: false, dashboard: false })
    })
    it('switches on listed areas, ignoring spaces and unknown names', () => {
        expect(parseFeatures(' tools, blogs ,nope')).toEqual({ account: false, tools: true, blogs: true, dashboard: false })
    })
    it('keeps VITE_FEATURE_ACCOUNT as an alias for account', () => {
        expect(parseFeatures('', 'true').account).toBe(true)
        expect(parseFeatures('', 'false').account).toBe(false)
    })
})
