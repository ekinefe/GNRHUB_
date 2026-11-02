import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
const SUMMARY = { messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } }
const ROW = { id: 3, slug: 'cv', target: 'https://example.com/cv.pdf', permanent: false, clicks: 2, updatedAt: 1 }
afterEach(() => vi.restoreAllMocks())

const admin = (handler) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (url === '/api/admin/me') return reply(200, { ok: true, user: 'owner' })
    if (url === '/api/admin/summary') return reply(200, SUMMARY)
    return handler(url, init)
})
const at = () => render(<MemoryRouter initialEntries={['/admin/redirects']}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></MemoryRouter>)

describe('admin short links', () => {
    it('is in the admin menu and lists each link with its type and visits', async () => {
        admin(() => reply(200, { redirects: [ROW] }))
        at()
        expect(await screen.findByRole('button', { name: /\/r\/cv/ })).toBeInTheDocument()
        expect(screen.getByText('302')).toBeInTheDocument()
        expect(screen.getByText('2 visits')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Links' })).toHaveAttribute('href', '/admin/redirects')
    })

    it('invites you to add the first link when there are none', async () => {
        admin(() => reply(200, { redirects: [] }))
        at()
        expect(await screen.findByText(/No short links yet/)).toBeInTheDocument()
    })

    it('creates a link and shows the field message the server gives for a bad address', async () => {
        const sent = []
        admin((url, init) => {
            if (init?.method === 'POST') {
                sent.push(JSON.parse(init.body))
                return sent.length === 1 ? reply(400, { error: 'Check the link.', errors: { target: 'Use a full https:// address, or a page of this site such as /about.' } }) : reply(201, { ok: true, id: 5 })
            }
            return reply(200, { redirects: [] })
        })
        at()
        fireEvent.click(await screen.findByRole('button', { name: 'New link' }))
        fireEvent.change(screen.getByLabelText(/Short name/), { target: { value: 'cv' } })
        fireEvent.change(screen.getByLabelText(/Goes to/), { target: { value: 'http://x.test' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText(/Use a full https/)).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText(/Goes to/), { target: { value: 'https://example.com/cv.pdf' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(sent).toHaveLength(2))
        expect(sent[1]).toEqual({ slug: 'cv', target: 'https://example.com/cv.pdf', permanent: false })
        expect(await screen.findByText('Saved.')).toBeInTheDocument()
    })

    it('edits a chosen link and deletes it after a confirmation', async () => {
        const sent = []
        admin((url, init) => {
            if (init?.method === 'POST') { sent.push(JSON.parse(init.body)); return reply(200, { ok: true }) }
            return reply(200, { redirects: [ROW] })
        })
        at()
        fireEvent.click(await screen.findByRole('button', { name: /\/r\/cv/ }))
        expect(screen.getByLabelText(/Goes to/)).toHaveValue('https://example.com/cv.pdf')
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
        fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
        await waitFor(() => expect(sent).toEqual([{ action: 'delete' }]))
        expect(await screen.findByText('Deleted.')).toBeInTheDocument()
    })

    it('says so when the links cannot be loaded', async () => {
        admin(() => reply(503, { error: 'x' }))
        at()
        expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load the short links/)
    })
})
