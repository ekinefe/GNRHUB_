import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { brand } from '@/shared/config/brand'

// Heavy canvas animation and the real Supabase client (needs env vars that CI does not have)
// are replaced; this test is about routing and layout, not those.
vi.mock('@/shared/animations/FuzzyText', () => ({
    default: ({ children }) => <div data-testid="mock-fuzzy">{children}</div>
}))
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        rpc: vi.fn(),
    },
}))

describe('App Routing System', () => {
    it('renders the home route with the brand header and main navigation', () => {
        render(<App />)

        // The wordmark comes from src/config/brand.js, so a rename does not break this test.
        expect(screen.getByText(brand.wordmark)).toBeInTheDocument()

        const nav = screen.getByRole('navigation', { name: 'Main' })
        for (const label of ['Home', 'Blogs', 'Tools', 'About_Me']) {
            expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
        }

        // Home content that renders immediately (the typed hero text animates in later).
        expect(screen.getByRole('link', { name: /More About Me/i })).toBeInTheDocument()
    })
})
