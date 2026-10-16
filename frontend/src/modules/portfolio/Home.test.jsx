import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Home from './Home'
import { profile } from '@/shared/config/profile'

vi.mock('@/shared/animations/TextType', () => ({ default: ({ text }) => <span>{text}</span> }))

const wrap = () => render(<MemoryRouter><Home /></MemoryRouter>)

describe('Home hero', () => {
    it('has a primary contact call to action', () => {
        wrap()
        expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '/contact')
        expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '/projects')
    })
    it('shows availability and the local time of the owner', () => {
        wrap()
        expect(screen.getByText(profile.availability.text.toUpperCase())).toBeInTheDocument()
        expect(document.querySelector('time')?.textContent).toMatch(/^\d{2}:\d{2}$/)
    })
    it('keeps the featured GNRdigital card instead of the old GNRHUB one', () => {
        wrap()
        expect(screen.getByText(/GNRDIGITAL \(PLATFORM\)/)).toBeInTheDocument()
        expect(screen.queryByText(/GNRHUB/i)).not.toBeInTheDocument()
    })
})
