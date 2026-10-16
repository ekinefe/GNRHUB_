import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'

let auth = { user: null, loading: false }
vi.mock('./AuthContext', () => ({ useAuth: () => auth }))

function renderAt(minAccess) {
    return render(
        <MemoryRouter initialEntries={['/secret']}>
            <Routes>
                <Route element={<ProtectedRoute minAccess={minAccess} />}><Route path="/secret" element={<p>secret</p>} /></Route>
                <Route path="/login" element={<p>login page</p>} />
                <Route path="/403" element={<p>forbidden</p>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('ProtectedRoute', () => {
    it('waits for the session check instead of bouncing', () => {
        auth = { user: null, loading: true }
        renderAt('member')
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
        expect(screen.queryByText('login page')).toBeNull()
    })
    it('sends guests to login', () => {
        auth = { user: null, loading: false }
        renderAt('member')
        expect(screen.getByText('login page')).toBeInTheDocument()
    })
    it('lets members in and sends them to 403 for admin pages', () => {
        auth = { user: { role: 'free' }, loading: false }
        renderAt('member')
        expect(screen.getByText('secret')).toBeInTheDocument()
    })
    it('403s a member on an admin route', () => {
        auth = { user: { role: 'free' }, loading: false }
        renderAt('admin')
        expect(screen.getByText('forbidden')).toBeInTheDocument()
    })
})
