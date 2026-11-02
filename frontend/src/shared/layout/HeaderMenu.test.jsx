import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Header from './Header'
import DashboardLayout from './DashboardLayout'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Header mobile menu', () => {
    it('has a labelled, expandable toggle', () => {
        wrap(<Header />)
        const toggle = screen.getByRole('button', { name: 'Open menu' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
        fireEvent.click(toggle)
        expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument()
    })

    it('closes on Escape', () => {
        wrap(<Header />)
        fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull()
    })

    it('closes when the route changes', () => {
        render(
            <MemoryRouter>
                <Header />
                <Routes><Route path="*" element={<Link to="/tools">go</Link>} /></Routes>
            </MemoryRouter>
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
        fireEvent.click(screen.getByText('go'))
        expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull()
    })
})

describe('DashboardLayout', () => {
    it('has a skip link to the main landmark', () => {
        wrap(<Routes><Route element={<DashboardLayout />}><Route path="*" element={<p>page</p>} /></Route></Routes>)
        expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
        expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    })
})
