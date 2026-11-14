import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
    it('gives screen readers the whole "/TITLE" at once while it types in', () => {
        render(<PageHeader title="Contact" />)
        expect(screen.getByRole('heading', { level: 1, name: '/CONTACT' })).toBeInTheDocument()
    })

    it('shows the description only when given', () => {
        const { rerender } = render(<PageHeader title="Blog" />)
        expect(screen.queryByText('Notes')).toBeNull()
        rerender(<PageHeader title="Blog" description="Notes" />)
        expect(screen.getByText('Notes')).toBeInTheDocument()
    })
})
