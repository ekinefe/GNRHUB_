import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import NotFound from './NotFound'
import Unauthorized from './Unauthorized'
import ServerError from './ServerError'

// Mock animations to prevent Canvas errors
vi.mock('@/shared/animations/FuzzyText', () => ({
    default: ({ children }) => <div data-testid="mock-fuzzy">{children}</div>
}))

describe('Error Pages Routing', () => {
    it('renders the NotFound (404) page', () => {
        render(
            <MemoryRouter initialEntries={['/bad-url']}>
                <Routes>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/ERR_PAGE_NOT_FOUND/i)).toBeInTheDocument()
        expect(screen.getByText(/cd \/bad-url/)).toBeInTheDocument()
    })

    it('offers the closest real page for a typo, and none for nonsense', () => {
        const page = (path) => render(
            <MemoryRouter initialEntries={[path]}>
                <Routes><Route path="*" element={<NotFound />} /></Routes>
            </MemoryRouter>
        )
        const { unmount } = page('/projetcs')
        expect(screen.getByRole('link', { name: /Did you mean \/projects\?/ })).toHaveAttribute('href', '/projects')
        unmount()
        page('/qqqqqq')
        expect(screen.queryByRole('link', { name: /Did you mean/ })).toBeNull()
        expect(screen.getByRole('link', { name: /Back to home/ })).toHaveAttribute('href', '/')
    })

    it('renders the Unauthorized (403) page', () => {
        render(
            <MemoryRouter initialEntries={['/403']}>
                <Routes>
                    <Route path="/403" element={<Unauthorized />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
    })

    it('renders the ServerError (500) page', () => {
        render(
            <MemoryRouter initialEntries={['/500']}>
                <Routes>
                    <Route path="/500" element={<ServerError />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/CRITICAL SYSTEM FAILURE/i)).toBeInTheDocument()
    })
})
describe('Landmarks (GNR-39)', () => {
    it.each([['404', <NotFound key="a" />], ['403', <Unauthorized key="b" />], ['500', <ServerError key="c" />]])(
        '%s page has exactly one main landmark',
        (_name, page) => {
            render(<MemoryRouter>{page}</MemoryRouter>)
            expect(screen.getAllByRole('main')).toHaveLength(1)
        }
    )
})
