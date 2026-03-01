import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect, vi } from 'vitest'

// Mock the heavy animations
vi.mock('./components/animations/FuzzyText', () => ({
    default: ({ children }) => <div data-testid="mock-fuzzy">{children}</div>
}))

describe('App Routing System', () => {
    it('renders the Landing Page by default', () => {
        render(<App />)

        // We now look for "Landing" because that is what your Home component renders
        expect(screen.getByText(/GNRHUB \[v2\] Landing/i)).toBeInTheDocument()
    })
})