import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Privacy, { PRIVACY_UPDATED } from './Privacy'
import Terms, { TERMS_UPDATED } from './Terms'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('legal pages', () => {
    it('Privacy shows its last-updated date and the no-cookies statement', () => {
        wrap(<Privacy />)
        expect(screen.getByText(PRIVACY_UPDATED)).toBeInTheDocument()
        expect(screen.getAllByText(/sets no cookies/i).length).toBeGreaterThan(0)
        expect(screen.getByText(/keyed hash of their network address/i)).toBeInTheDocument()
        expect(screen.getByText(/I store your name, email address/i)).toBeInTheDocument()
    })
    it('Terms shows its last-updated date', () => {
        wrap(<Terms />)
        expect(screen.getByText(TERMS_UPDATED)).toBeInTheDocument()
    })
    it('each has exactly one main landmark', () => {
        for (const page of [<Privacy key="p" />, <Terms key="t" />]) {
            const { unmount } = wrap(page)
            expect(screen.getAllByRole('main')).toHaveLength(1)
            unmount()
        }
    })
})

describe('saved legal text', () => {
    const saved = { version: 3, summary: 'Almost nothing is kept about you.', body: '## Heading\n\nThe full text.', createdAt: 1793664000 }
    afterEach(() => vi.restoreAllMocks())

    it('replaces the built-in text with the saved version: summary first, then the body', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ document: { doc: 'privacy', ...saved } }), { status: 200 }))
        wrap(<Privacy />)
        expect(await screen.findByText(/Almost nothing is kept about you/)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Heading/ })).toBeInTheDocument()
        expect(screen.getByText('VERSION_3', { exact: false })).toBeInTheDocument()
        expect(screen.queryByText(/WHO IS RESPONSIBLE/)).not.toBeInTheDocument()
    })
    it('keeps the built-in text when none is saved or the server fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('{}', { status: 404 })).mockRejectedValueOnce(new Error('offline'))
        wrap(<Terms />)
        wrap(<Privacy />)
        await Promise.resolve()
        expect(screen.getByText(/USING THE SITE/)).toBeInTheDocument()
        expect(screen.getByText(/WHO IS RESPONSIBLE/)).toBeInTheDocument()
    })
})
