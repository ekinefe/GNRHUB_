import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Link, Routes, Route } from 'react-router-dom'
import PageViews from './PageViews'

afterEach(() => vi.restoreAllMocks())
const spy = () => vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
const at = (path) => render(<MemoryRouter initialEntries={[path]}><PageViews /><Routes><Route path="*" element={<Link to="/other">go</Link>} /></Routes></MemoryRouter>)

describe('PageViews', () => {
    it('sends only the path, once per page', () => {
        const f = spy()
        at('/about')
        expect(f).toHaveBeenCalledTimes(1)
        const [url, init] = f.mock.calls[0]
        expect(url).toBe('/api/hit')
        expect(JSON.parse(init.body)).toEqual({ path: '/about' })
        expect(init.credentials).toBeUndefined()
    })
    it('does not count the admin area', () => {
        const f = spy()
        at('/admin/posts')
        expect(f).not.toHaveBeenCalled()
    })
    it('survives a failing request', () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
        expect(() => at('/')).not.toThrow()
    })
})
