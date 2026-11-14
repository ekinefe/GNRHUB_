import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
const SUMMARY = { messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } }
const days = Array.from({ length: 30 }, (_, i) => ({ day: `2026-10-${String(i + 1).padStart(2, '0')}`, views: i === 29 ? 5 : 0 }))
afterEach(() => vi.restoreAllMocks())

const admin = (handler) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (url === '/api/admin/me') return reply(200, { ok: true, user: 'owner' })
    if (url === '/api/admin/summary') return reply(200, SUMMARY)
    return handler(url)
})
const at = () => render(<MemoryRouter initialEntries={['/admin/visits']}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></MemoryRouter>)

describe('admin visits', () => {
    it('is in the menu and shows the total and the most opened pages', async () => {
        admin(() => reply(200, { days, total: 5, top: [{ path: '/about', views: 5 }] }))
        at()
        expect((await screen.findByText(/views in the last 30 days/)).parentElement).toHaveTextContent('5 views in the last 30 days')
        expect(screen.getByText('/about')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Visits' })).toHaveAttribute('href', '/admin/visits')
    })
    it('says so when nothing has been counted yet', async () => {
        admin(() => reply(200, { days: days.map((d) => ({ ...d, views: 0 })), total: 0, top: [] }))
        at()
        expect(await screen.findByText(/No visits yet/)).toBeInTheDocument()
    })
    it('explains a failure', async () => {
        admin(() => reply(503, { error: 'x' }))
        at()
        expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load the visits/)
    })
})
