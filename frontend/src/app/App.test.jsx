import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

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

        // The logo link is labelled from brand.js, so a rename does not break this test.
        expect(screen.getByRole('link', { name: /GNR\s*digital/i })).toBeInTheDocument()

        const nav = screen.getByRole('navigation', { name: 'Main' })
        for (const label of ['Home', 'About']) {
            expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
        }
        // Unfinished areas are flagged off at launch (shared/config/features.js)
        for (const label of ['Blogs', 'Tools']) {
            expect(within(nav).queryByRole('link', { name: label })).not.toBeInTheDocument()
        }

        // Home content that renders immediately (the typed hero text animates in later).
        expect(screen.getByRole('link', { name: /More About Me/i })).toBeInTheDocument()
    })

    it.each(['/login', '/register', '/dashboard', '/blogs', '/tools', '/tools/brandbook'])('flagged-off route %s shows the 404', async (path) => {
        window.history.pushState({}, '', path)
        render(<App />)
        expect(await screen.findByText(/404/)).toBeInTheDocument()
        window.history.pushState({}, '', '/')
    })

    it('loads a lazy route on demand', async () => {
        window.history.pushState({}, '', '/contact')
        render(<App />)
        expect(await screen.findByText('/CONTACT')).toBeInTheDocument()
        window.history.pushState({}, '', '/')
    })
})
