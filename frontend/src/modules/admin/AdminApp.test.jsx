import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminApp from './AdminApp'
import { loginMessage } from './api'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const SUMMARY = { messages: { total: 3, unread: 2 }, posts: { draft: 1, private: 2, public: 4 } }
const reply = (status, body = {}, headers = {}) => new Response(JSON.stringify(body), { status, headers })
const page = () => render(<MemoryRouter initialEntries={['/admin']}><AdminApp /></MemoryRouter>)
afterEach(() => vi.restoreAllMocks())

describe('AdminApp', () => {
    it('shows the sign-in form when the server says you are not signed in', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(401, { error: 'Not signed in.' }))
        page()
        expect(await screen.findByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument()
        expect(screen.getByLabelText(/Password/)).toHaveAttribute('type', 'password')
        expect(screen.getByLabelText(/Password/)).toHaveAttribute('autocomplete', 'current-password')
    })

    it('shows the sign-in form when the server answers 200 with ok:false (the normal signed-out answer)', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { ok: false }))
        page()
        expect(await screen.findByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument()
    })

    it('does not treat an HTML 200 (no API behind the page) as signed in', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<!doctype html><div id="root"></div>', { status: 200, headers: { 'Content-Type': 'text/html' } }))
        page()
        expect(await screen.findByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument()
    })

    it('signs in, then shows the admin shell, and signs out again', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(reply(401))                 // me
            .mockResolvedValueOnce(reply(200, { ok: true }))   // login
            .mockResolvedValueOnce(reply(200, { ok: true, user: 'owner' })) // me again
            .mockResolvedValueOnce(reply(200, SUMMARY))         // summary
            .mockResolvedValueOnce(reply(200, { ok: true }))   // logout
        page()
        fireEvent.change(await screen.findByLabelText(/Username/), { target: { value: 'ekin' } })
        fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pw pw pw pw pw' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
        expect(await screen.findByRole('heading', { name: 'Admin' })).toBeInTheDocument()
        const [url, init] = fetchMock.mock.calls[1]
        expect(url).toBe('/api/admin/login')
        expect(init.credentials).toBe('same-origin')
        expect(JSON.parse(init.body)).toEqual({ username: 'ekin', password: 'pw pw pw pw pw' })
        fireEvent.click(screen.getByRole('button', { name: /Sign out/ }))
        expect(await screen.findByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument()
        expect(fetchMock.mock.calls[4][0]).toBe('/api/admin/logout')
    })

    it('says why a sign-in failed and keeps you on the form', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(reply(401))
            .mockResolvedValueOnce(reply(429, {}, { 'Retry-After': '600' }))
        page()
        fireEvent.change(await screen.findByLabelText(/Username/), { target: { value: 'ekin' } })
        fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'x' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Try again in 10 minutes'))
        expect(screen.getByRole('heading', { name: 'Admin sign-in' })).toBeInTheDocument()
    })
})

describe('AdminApp home', () => {
    it('shows what needs attention and an unread badge in the menu', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => (url === '/api/admin/me' ? reply(200, { ok: true, user: 'owner' }) : reply(200, SUMMARY)))
        page()
        expect(await screen.findByText(/unread messages, 3 in total/)).toBeInTheDocument()
        expect(screen.getByText(/4 public, 2 private, 1 draft/)).toBeInTheDocument()
        expect(screen.getByLabelText('2 unread')).toBeInTheDocument()
        for (const link of screen.getAllByRole('link', { name: /Messages/ })) expect(link).toHaveAttribute('href', '/admin/messages')
        for (const link of screen.getAllByRole('link', { name: /Posts/ })) expect(link).toHaveAttribute('href', '/admin/posts')
        expect(screen.getAllByRole('link', { name: /Messages/ })).toHaveLength(2) // the menu and the card
    })
})

describe('loginMessage', () => {
    it('has a plain message for each case, including an unreachable server', () => {
        expect(loginMessage({ status: 401 })).toMatch(/Wrong username or password/)
        expect(loginMessage({ status: 429, retryAfter: 61 })).toMatch(/2 minutes/)
        expect(loginMessage({ status: 503 })).toMatch(/not set up/)
        expect(loginMessage({ status: 403 })).toMatch(/refused/)
        expect(loginMessage({ status: 0 })).toMatch(/Could not reach/)
    })
})
