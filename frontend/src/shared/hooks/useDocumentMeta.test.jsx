import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useDocumentMeta } from './useDocumentMeta'
import { brand } from '@/shared/config/brand'

function Page(props) {
    useDocumentMeta(props)
    return null
}
const tag = (sel) => document.head.querySelector(sel)

describe('useDocumentMeta', () => {
    it('sets title, description, canonical and open graph tags', () => {
        render(<Page title="Tools" description="All the tools" />)
        expect(document.title).toBe(`Tools · ${brand.name}`)
        expect(tag('meta[name="description"]').content).toBe('All the tools')
        expect(tag('meta[property="og:title"]').content).toBe(`Tools · ${brand.name}`)
        expect(tag('link[rel="canonical"]').href).toContain(window.location.origin)
        expect(tag('meta[name="robots"]').content).toBe('index, follow')
    })

    it('uses the bare brand name without a title and marks noindex pages', () => {
        render(<Page noindex />)
        expect(document.title).toBe(brand.name)
        expect(tag('meta[name="robots"]').content).toBe('noindex, nofollow')
    })

    it('updates the same tags instead of adding duplicates', () => {
        const { rerender } = render(<Page title="A" description="one" />)
        rerender(<Page title="B" description="two" />)
        expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
        expect(tag('meta[name="description"]').content).toBe('two')
    })
})
