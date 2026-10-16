import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AccountMenu from './AccountMenu'

let auth = { user: null, loading: false }
const signOut = vi.fn()
vi.mock('./AuthContext', () => ({ useAuth: () => auth }))
vi.mock('@/shared/lib/supabase', () => ({ supabase: { auth: { signOut: () => signOut() } } }))

const show = () => render(<MemoryRouter><AccountMenu /></MemoryRouter>)

describe('AccountMenu', () => {
    it('offers Log in to guests', () => {
        auth = { user: null, loading: false }
        show()
        expect(screen.getByRole('link', { name: /Log in/ })).toHaveAttribute('href', '/login')
    })
    it('shows email, role and Log out for members, and signs out', () => {
        auth = { user: { email: 'a@b.c', role: 'free' }, loading: false }
        show()
        expect(screen.getByText('a@b.c')).toBeInTheDocument()
        expect(screen.getByText('member')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /Log out/ }))
        expect(signOut).toHaveBeenCalled()
    })
    it('marks admins', () => {
        auth = { user: { email: 'a@b.c', role: 'admin' }, loading: false }
        show()
        expect(screen.getByText('admin')).toBeInTheDocument()
    })
    it('renders nothing while the session is loading', () => {
        auth = { user: null, loading: true }
        const { container } = show()
        expect(container).toBeEmptyDOMElement()
    })
})
