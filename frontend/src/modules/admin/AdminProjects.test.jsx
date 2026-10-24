import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp'
import { fromBuiltIn, fromApi } from './projectForm'
import { projects as builtIn, toolProjects as builtInTools } from '@/shared/content/projects'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
const SUMMARY = { messages: { total: 0, unread: 0 }, posts: { draft: 0, private: 0, public: 0 }, recent: { messages: [], posts: [] } }
const ROW = { dbId: 4, id: 'alpha', group: 'project', name: 'Alpha', kind: 'Web app', summary: 'The first.', tech: ['React', 'D1'], points: ['One', 'Two'], status: 'live', repo: 'https://github.com/x/alpha', url: null, featured: true, inAbout: false, sort: 10 }
afterEach(() => vi.restoreAllMocks())

// Signed in, with a scripted answer per admin projects call.
const admin = (handler) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (url === '/api/admin/me') return reply(200, { ok: true, user: 'owner' })
    if (url === '/api/admin/summary') return reply(200, SUMMARY)
    return handler(url, init)
})
const at = (path) => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></MemoryRouter>)

describe('admin portfolio list', () => {
    it('has a Portfolio entry in the admin menu and lists the projects with where they show', async () => {
        admin(() => reply(200, { projects: [ROW] }))
        at('/admin/projects')
        expect(await screen.findByRole('link', { name: /Alpha/ })).toHaveAttribute('href', '/admin/projects/4')
        expect(screen.getByText(/on Home/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/admin/projects')
    })

    it('offers to import the built-in projects when the database has none, creating each one', async () => {
        const created = []
        admin((url, init) => {
            if (init?.method === 'POST') { created.push(JSON.parse(init.body)); return reply(201, { ok: true, id: created.length }) }
            return reply(200, { projects: [] })
        })
        at('/admin/projects')
        fireEvent.click(await screen.findByRole('button', { name: /Import the built-in projects/ }))
        await waitFor(() => expect(created).toHaveLength(builtIn.length + builtInTools.length))
        expect(created.filter((c) => c.grp === 'tool')).toHaveLength(builtInTools.length)
        expect(created[0]).toMatchObject({ name: builtIn[0].name, slug: builtIn[0].id, sort: 10, tech: expect.any(String) })
    })

    it('says so when the projects cannot be loaded', async () => {
        admin(() => reply(503, { error: 'x' }))
        at('/admin/projects')
        expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load the projects/)
    })
})

describe('admin project editor', () => {
    it('creates a project, taking the address from the name', async () => {
        const fetchMock = admin((url, init) => (init?.method === 'POST' ? reply(201, { ok: true, id: 9 }) : reply(200, { project: { ...ROW, dbId: 9 } })))
        at('/admin/projects/new')
        fireEvent.change(await screen.findByLabelText(/^Name/), { target: { value: 'My New Thing' } })
        expect(screen.getByLabelText(/^Address/)).toHaveValue('my-new-thing')
        fireEvent.change(screen.getByLabelText(/^Summary/), { target: { value: 'It does things.' } })
        fireEvent.change(screen.getByLabelText(/^Technologies/), { target: { value: 'React, D1' } })
        fireEvent.click(screen.getByLabelText('Show on the Home page'))
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(fetchMock.mock.calls.some(([u, i]) => u === '/api/admin/projects' && i?.method === 'POST')).toBe(true))
        const body = JSON.parse(fetchMock.mock.calls.find(([u, i]) => u === '/api/admin/projects' && i?.method === 'POST')[1].body)
        expect(body).toMatchObject({ name: 'My New Thing', slug: 'my-new-thing', summary: 'It does things.', tech: 'React, D1', featured: true, inAbout: false, grp: 'project', status: 'live' })
    })

    it('shows the server\'s message next to the field that is wrong', async () => {
        admin((url, init) => (init?.method === 'POST' ? reply(400, { error: 'Check the project.', errors: { url: 'Use a full https:// address, or leave it empty.' } }) : reply(200, {})))
        at('/admin/projects/new')
        fireEvent.change(await screen.findByLabelText(/^Name/), { target: { value: 'X' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText(/Use a full https/)).toBeInTheDocument()
    })

    it('loads a project into the form, saves changes with the save action, and deletes only after a second click', async () => {
        const fetchMock = admin((url, init) => (init?.method === 'POST' ? reply(200, { ok: true }) : reply(200, { project: ROW })))
        at('/admin/projects/4')
        expect(await screen.findByLabelText(/^Name/)).toHaveValue('Alpha')
        expect(screen.getByLabelText(/^Points/)).toHaveValue('One\nTwo')
        fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Alpha two' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText(/Saved/)).toBeInTheDocument()
        const save = fetchMock.mock.calls.find(([u, i]) => u === '/api/admin/projects/4' && i?.method === 'POST')
        expect(JSON.parse(save[1].body)).toMatchObject({ action: 'save', name: 'Alpha two', slug: 'alpha' })
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
        expect(fetchMock.mock.calls.filter(([, i]) => i?.body?.includes('delete'))).toHaveLength(0)
        fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
        await waitFor(() => expect(fetchMock.mock.calls.some(([, i]) => i?.body?.includes('"delete"'))).toBe(true))
    })
})

describe('projectForm', () => {
    it('turns arrays into the text the form uses and back to what the API needs', () => {
        expect(fromBuiltIn(builtIn[0], 'project', 10)).toMatchObject({ slug: builtIn[0].id, tech: builtIn[0].tech.join(', '), points: builtIn[0].points.join('\n'), repo: '', sort: 10 })
        expect(fromApi(ROW)).toMatchObject({ slug: 'alpha', grp: 'project', tech: 'React, D1', url: '', featured: true, sort: 10 })
    })
})
