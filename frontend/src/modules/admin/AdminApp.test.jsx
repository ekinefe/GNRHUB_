import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminApp from './AdminApp'
import { loginMessage } from './api'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const SUMMARY = {
    messages: { total: 3, unread: 2 },
    posts: { draft: 1, private: 2, public: 4 },
    recent: {
        messages: [{ id: 3, name: 'Ada', subject: 'Hello there', preview: 'Hi, I saw your work', createdAt: 1_790_000_000, read: false }],
        posts: [{ id: 7, title: 'Notes on cron', status: 'draft', updatedAt: 1_790_000_000 }],
    },
}
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

describe('AdminApp two-factor', () => {
    it('asks for the authentication code only when the server says it is needed, and sends it', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(reply(200, { ok: false, needsCode: true }))
            .mockResolvedValueOnce(reply(401, { error: 'Wrong username, password or code.' }))
        page()
        fireEvent.change(await screen.findByLabelText(/Username/), { target: { value: 'ekin' } })
        fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pw pw pw pw pw' } })
        const code = screen.getByLabelText(/Authentication code/)
        expect(code).toHaveAttribute('autocomplete', 'one-time-code')
        expect(code).toHaveAttribute('inputmode', 'numeric')
        fireEvent.change(code, { target: { value: '123 456' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Wrong username, password or code.'))
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ username: 'ekin', password: 'pw pw pw pw pw', code: '123 456' })
        expect(screen.getByLabelText(/Authentication code/)).toHaveValue('') // cleared after a failed try
    })

    it('has no code field when two-factor is not set up', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { ok: false, needsCode: false }))
        page()
        await screen.findByLabelText(/Username/)
        expect(screen.queryByLabelText(/Authentication code/)).toBeNull()
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
        expect(screen.getAllByRole('link', { name: /Messages/ }).length).toBeGreaterThanOrEqual(2) // the menu and the card
    })
})

describe('AdminApp home, latest items', () => {
    const signedIn = (summary) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => (url === '/api/admin/me' ? reply(200, { ok: true, user: 'owner' }) : reply(200, summary)))

    it('lists the latest messages and posts with links, and a New post button', async () => {
        signedIn(SUMMARY)
        page()
        expect(await screen.findByText('Ada')).toBeInTheDocument()
        expect(screen.getByText('Hello there')).toBeInTheDocument()
        expect(screen.getByText('unread')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Notes on cron/ })).toHaveAttribute('href', '/admin/posts/7')
        expect(screen.getByRole('link', { name: /New post/ })).toHaveAttribute('href', '/admin/posts/new')
        expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/admin')
    })

    it('says what to do when there is nothing yet, instead of staying blank', async () => {
        signedIn({ messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } })
        page()
        expect(await screen.findByText(/No messages yet/)).toBeInTheDocument()
        expect(screen.getByText(/No posts yet/)).toBeInTheDocument()
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
