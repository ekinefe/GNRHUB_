import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SectionHeading from './SectionHeading'

describe('SectionHeading', () => {
    it('names the heading by its title only (the "//" marker is decoration)', () => {
        render(<SectionHeading id="x" title="Selected projects" path="/projects/featured" action={<a href="/projects">All</a>} />)
        const h = screen.getByRole('heading', { level: 2, name: 'Selected projects' })
        expect(h).toHaveAttribute('id', 'x')
        expect(screen.getByText('/projects/featured')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'All' })).toBeInTheDocument()
    })
})
