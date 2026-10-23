import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Header from './Header'

describe('Header mobile menu', () => {
    it('opens and closes without crashing (the X icon must be imported)', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        )

        // Closed: only the desktop nav renders each label once.
        expect(screen.getAllByText('About')).toHaveLength(1)

        const toggle = screen.getByRole('button')
        fireEvent.click(toggle)
        // Open: the mobile overlay renders a second copy of every link.
        expect(screen.getAllByText('About')).toHaveLength(2)

        fireEvent.click(screen.getByRole('button'))
        expect(screen.getAllByText('About')).toHaveLength(1)
    })
})

describe('Header navigation', () => {
    it('has Contact in the main navigation, marked as the current page on /contact', () => {
        render(<MemoryRouter initialEntries={['/contact']}><Header /></MemoryRouter>)
        const link = screen.getByRole('navigation', { name: 'Main' }).querySelector('a[href="/contact"]')
        expect(link).toHaveTextContent('Contact')
        expect(link.className).toMatch(/text-cyber-pink/)
        expect(screen.getByRole('navigation', { name: 'Main' }).querySelector('a[href="/about"]').className).not.toMatch(/text-cyber-pink/)
    })

    it('lists Home, Projects, Blog, About and Contact in that order', () => {
        render(<MemoryRouter><Header /></MemoryRouter>)
        const hrefs = [...screen.getByRole('navigation', { name: 'Main' }).querySelectorAll('a')].map((a) => a.getAttribute('href'))
        expect(hrefs).toEqual(['/', '/projects', '/blog', '/about', '/contact'])
    })
})
