import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AboutMe from './AboutMe'
import { about, skillGroups } from '@/shared/content/about'
import { profile } from '@/shared/config/profile'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
vi.mock('@/shared/animations/TextType', () => ({ default: ({ text }) => <span>{text}</span> }))

const wrap = () => render(<MemoryRouter><AboutMe /></MemoryRouter>)

describe('About page', () => {
    it('shows the skills as plain labelled lines built from the data file', () => {
        wrap()
        const list = screen.getByLabelText('Skills')
        for (const { key, label } of skillGroups) {
            expect(list).toHaveTextContent(label)
            for (const skill of about.skills[key]) expect(list).toHaveTextContent(skill)
        }
        expect(list.textContent).not.toMatch(/[{}[\]"]/)
    })
    it('shows project cards without screenshots here (the Projects page has the previews)', () => {
        wrap()
        expect(document.querySelector('img[src^="/projects/"]')).toBeNull()
    })
    it('explains what the pink and grey dots in the timelines mean, and lists current entries first', () => {
        wrap()
        expect(screen.getAllByText(/still doing this/).length).toBe(about.log.length)
        for (const group of about.log) {
            const currents = group.entries.map((e) => !!e.current)
            expect(currents).toEqual([...currents].sort((a, b) => Number(b) - Number(a)))
        }
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

    it('keeps its section headings readable for screen readers while they decrypt in', () => {
        wrap()
        expect(screen.getByRole('heading', { name: 'SKILLS' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'PROFESSIONAL_SUMMARY' })).toBeInTheDocument()
    })
})
