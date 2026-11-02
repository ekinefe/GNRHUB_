import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
const SUMMARY = { messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } }
const V2 = { version: 2, summary: 'A personal site that keeps almost nothing.', body: '# Privacy\n\nText.', createdAt: 1 }
afterEach(() => vi.restoreAllMocks())

const admin = (handler) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (url === '/api/admin/me') return reply(200, { ok: true, user: 'owner' })
    if (url === '/api/admin/summary') return reply(200, SUMMARY)
    return handler(url, init)
})
const at = () => render(<MemoryRouter initialEntries={['/admin/legal']}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></MemoryRouter>)

describe('admin legal texts', () => {
    it('is in the menu, loads the newest version and lists the versions', async () => {
        admin(() => reply(200, { doc: 'privacy', current: V2, versions: [{ version: 2, createdAt: 1 }, { version: 1, createdAt: 0 }] }))
        at()
        expect(await screen.findByDisplayValue(V2.summary)).toBeInTheDocument()
        expect(screen.getByText(/shows version 2/)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'Load into the editor' })).toHaveLength(2)
        expect(screen.getByRole('link', { name: 'Legal' })).toHaveAttribute('href', '/admin/legal')
    })
    it('says the built-in text is shown when nothing was saved, and saves a new version', async () => {
        const sent = []
        admin((url, init) => {
            if (init?.method === 'POST') { sent.push([url, JSON.parse(init.body)]); return reply(201, { ok: true, version: 1, unchanged: false }) }
            return reply(200, { doc: 'privacy', current: null, versions: [] })
        })
        at()
        expect(await screen.findByText(/text that ships with the site/)).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText(/Plain-language summary/), { target: { value: 'A summary that is long enough.' } })
        fireEvent.change(screen.getByLabelText(/Full text/), { target: { value: 'Body '.repeat(30) } })
        fireEvent.click(screen.getByRole('button', { name: 'Save as new version' }))
        expect(await screen.findByText(/Saved as version 1/)).toBeInTheDocument()
        expect(sent[0][0]).toBe('/api/admin/legal/privacy')
    })
    it('shows the server message under a bad field and switches to Terms', async () => {
        admin((url, init) => init?.method === 'POST'
            ? reply(400, { errors: { summary: 'Write a plain-language summary of at least 20 characters.' } })
            : reply(200, { doc: url.includes('terms') ? 'terms' : 'privacy', current: null, versions: [] }))
        at()
        fireEvent.click(await screen.findByRole('button', { name: 'Save as new version' }))
        expect(await screen.findByText(/at least 20 characters/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('tab', { name: 'Terms' }))
        await waitFor(() => expect(screen.getByRole('form', { name: 'Edit terms' })).toBeInTheDocument())
    })
})
