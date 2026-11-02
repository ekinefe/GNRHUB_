import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Projects from './Projects'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }

describe('Projects page', () => {
    it('lists the separate tools with their status and no dead links', () => {
        render(<MemoryRouter><Projects /></MemoryRouter>)
        expect(screen.getByText('Brandbook Maker')).toBeInTheDocument()
        expect(screen.getByText('CV Maker')).toBeInTheDocument()
        expect(screen.getByText('ON HOLD')).toBeInTheDocument()
        expect(screen.getAllByText('COMING SOON').length).toBeGreaterThanOrEqual(2)
        // a tool with no address yet must not offer a "Live site" link
        const links = screen.queryAllByRole('link', { name: /live site/i })
        for (const a of links) expect(a.getAttribute('href')).toMatch(/^https:/)
    })
})
