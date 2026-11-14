import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
const SUMMARY = { messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } }
const ROW = { id: 4, kind: 'problem', page: '/projects', message: 'The page does not scroll.', email: 'ada@example.com', createdAt: 1, readAt: null, read: false }
afterEach(() => vi.restoreAllMocks())

const admin = (handler) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (url === '/api/admin/me') return reply(200, { ok: true, user: 'owner' })
    if (url === '/api/admin/summary') return reply(200, SUMMARY)
    return handler(url, init)
})
const at = () => render(<MemoryRouter initialEntries={['/admin/feedback']}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></MemoryRouter>)

describe('admin feedback', () => {
    it('is in the menu and lists reports with kind, page and unread state', async () => {
        admin(() => reply(200, { feedback: [ROW], unread: 1 }))
        at()
        expect(await screen.findByText('The page does not scroll.')).toBeInTheDocument()
        expect(screen.getByText('Problem')).toBeInTheDocument()
        expect(screen.getByText('/projects')).toBeInTheDocument()
        expect(screen.getByText('(1 unread)')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Feedback' })).toHaveAttribute('href', '/admin/feedback')
    })
    it('marks a report read when opened and shows the reply address', async () => {
        const sent = []
        admin((url, init) => {
            if (init?.method === 'POST') { sent.push([url, JSON.parse(init.body)]); return reply(200, { ok: true }) }
            return reply(200, { feedback: [ROW], unread: 1 })
        })
        at()
        fireEvent.click(await screen.findByRole('button', { name: /The page does not scroll/ }))
        expect(await screen.findByRole('link', { name: 'ada@example.com' })).toHaveAttribute('href', 'mailto:ada@example.com')
        await waitFor(() => expect(sent).toEqual([['/api/admin/feedback/4', { action: 'read' }]]))
    })
    it('says so when there is nothing yet', async () => {
        admin(() => reply(200, { feedback: [], unread: 0 }))
        at()
        expect(await screen.findByText(/No feedback yet/)).toBeInTheDocument()
    })
})
