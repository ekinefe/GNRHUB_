import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AboutMe from './AboutMe'
import { about } from '@/shared/content/about'
import { profile } from '@/shared/config/profile'

vi.mock('@/shared/animations/TextType', () => ({ default: ({ text }) => <span>{text}</span> }))

const wrap = () => render(<MemoryRouter><AboutMe /></MemoryRouter>)

describe('About page', () => {
    it('shows skills as a package.json block built from the data file', () => {
        wrap()
        const block = screen.getByLabelText(/package\.json/i)
        expect(block).toHaveTextContent('"programming"')
        for (const skill of about.skills.programming) expect(block).toHaveTextContent(skill)
    })
    it('renders every education and experience entry as a git log', () => {
        wrap()
        for (const group of about.log) {
            expect(screen.getByText(`$ git log --oneline ${group.key}`)).toBeInTheDocument()
            for (const entry of group.entries) expect(screen.getByText(entry.title)).toBeInTheDocument()
        }
    })
    it('explains the name in the first person', () => {
        wrap()
        const story = screen.getByTestId('name-story')
        expect(story).toHaveTextContent(/my surname/i)
        expect(story).toHaveTextContent(/not a studio/i)
    })
    it('adds Person JSON-LD while mounted', () => {
        const { unmount } = wrap()
        const ld = JSON.parse(document.getElementById('ld-person').textContent)
        expect(ld['@type']).toBe('Person')
        expect(ld.sameAs).toContain(profile.github)
        unmount()
        expect(document.getElementById('ld-person')).toBeNull()
    })
    it('uses the contact email from profile data', () => {
        wrap()
        expect(screen.getByRole('link', { name: /email me/i })).toHaveAttribute('href', `mailto:${profile.email}`)
    })
})
