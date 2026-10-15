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
        expect(screen.getAllByText('Tools')).toHaveLength(1)

        const toggle = screen.getByRole('button')
        fireEvent.click(toggle)
        // Open: the mobile overlay renders a second copy of every link.
        expect(screen.getAllByText('Tools')).toHaveLength(2)

        fireEvent.click(screen.getByRole('button'))
        expect(screen.getAllByText('Tools')).toHaveLength(1)
    })
})
