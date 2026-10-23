import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Home from './Home'
import { profile } from '@/shared/config/profile'
import { about } from '@/shared/content/about'

vi.mock('@/shared/animations/TextType', () => ({ default: ({ text }) => <span>{text}</span> }))

const wrap = () => render(<MemoryRouter><Home /></MemoryRouter>)

describe('Home hero', () => {
    it('has a primary contact call to action', () => {
        wrap()
        for (const link of screen.getAllByRole('link', { name: /get in touch/i })) expect(link).toHaveAttribute('href', '/contact')
        expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '/projects')
    })
    it('shows availability and the local time of the owner', () => {
        wrap()
        expect(screen.getByText(profile.availability.text.toUpperCase())).toBeInTheDocument()
        expect(document.querySelector('time')?.textContent).toMatch(/^\d{2}:\d{2}$/)
    })
    it('shows the featured project cards and nothing with the old GNRHUB name', () => {
        wrap()
        expect(screen.getByText(/PLANNED LOST \(WEB APP\)/)).toBeInTheDocument()
        expect(screen.getByText(/TICKET MANAGER \(WEB APP\)/)).toBeInTheDocument()
        expect(screen.getByText(/CW KEYER \(HARDWARE\)/)).toBeInTheDocument()
        expect(screen.queryByText(/GNRHUB/i)).not.toBeInTheDocument()
    })
})

describe('Home below the hero', () => {
    it('lists every measured result from the data file, as before and after where there is a pair', () => {
        wrap()
        const list = screen.getByRole('region', { name: /results so far/i })
        for (const { before, after, what } of about.results) {
            expect(list).toHaveTextContent(what)
            expect(list).toHaveTextContent(after)
            if (before) expect(list).toHaveTextContent(before)
        }
    })

    it('ends with a contact call to action', () => {
        wrap()
        expect(screen.getByRole('heading', { name: /looking for a junior developer/i })).toBeInTheDocument()
    })

    it('every result is backed by a point in the internship entry, so the numbers are not invented twice', () => {
        const points = about.log.find((g) => g.key === 'professional').entries.flatMap((e) => e.points ?? []).join(' ')
        for (const { before, after } of about.results.filter((r) => r.before)) {
            expect(points).toContain(before.replace(' ', ' '))
            expect(points).toContain(after)
        }
    })
})
