import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
    it('links to the legal pages and shows build info', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
        expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
        expect(screen.getByTestId('build-info').textContent).toMatch(/^build \S+/)
    })

    it('opens external links safely', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
