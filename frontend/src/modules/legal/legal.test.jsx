import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
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
