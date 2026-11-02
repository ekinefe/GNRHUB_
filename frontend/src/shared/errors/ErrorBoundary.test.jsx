import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

vi.mock('@/shared/animations/FuzzyText', () => ({
    default: ({ children }) => <div>{children}</div>
}))

function Boom() {
    throw new Error('render exploded')
}

describe('ErrorBoundary', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
    afterEach(() => vi.restoreAllMocks())

    it('shows the 500 page when a child throws', () => {
        render(
            <MemoryRouter>
                <ErrorBoundary><Boom /></ErrorBoundary>
            </MemoryRouter>
        )
        expect(screen.getByText(/CRITICAL SYSTEM FAILURE/i)).toBeInTheDocument()
        expect(screen.getByText(/Initiate Reboot/i)).toBeInTheDocument()
    })

    it('renders children when nothing throws', () => {
        render(
            <MemoryRouter>
                <ErrorBoundary><p>all good</p></ErrorBoundary>
            </MemoryRouter>
        )
        expect(screen.getByText('all good')).toBeInTheDocument()
    })
})
