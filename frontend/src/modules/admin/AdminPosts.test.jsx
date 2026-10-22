import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminPosts from './AdminPosts'

const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
afterEach(() => vi.restoreAllMocks())

const Where = () => <p data-testid="where">{useLocation().pathname}</p>
const page = (path) => render(
    <MemoryRouter initialEntries={[path]}>
        <Routes><Route path="/admin/posts/*" element={<><AdminPosts /><Where /></>} /></Routes>
    </MemoryRouter>,
)

const posts = [
    { id: 2, title: 'Notebook day', slug: 'notebook-day', status: 'private', tags: [], createdAt: 1_800_000_000, updatedAt: 1_800_000_000, publishedAt: null },
    { id: 1, title: 'About cron', slug: 'about-cron', status: 'public', tags: ['linux'], createdAt: 1_790_000_000, updatedAt: 1_790_000_000, publishedAt: 1_790_000_000 },
]

describe('post list', () => {
    it('lists posts with their status and a way to write a new one', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        page('/admin/posts')
        expect(await screen.findByText('Notebook day')).toBeInTheDocument()
        const list = screen.getByRole('list')
        expect(within(list).getByText('private')).toBeInTheDocument()
        expect(within(list).getByText('public')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /New post/ })).toHaveAttribute('href', '/admin/posts/new')
        expect(screen.getByRole('link', { name: /About cron/ })).toHaveAttribute('href', '/admin/posts/1')
    })

    it('searches (forgivingly) and filters the list by who can see a post', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        page('/admin/posts')
        await screen.findByText('Notebook day')
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: 'crn' } })
        expect(screen.getByText('About cron')).toBeInTheDocument()
        expect(screen.queryByText('Notebook day')).toBeNull()
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: '' } })
        fireEvent.click(screen.getByRole('button', { name: 'private' }))
        expect(screen.getByText('Notebook day')).toBeInTheDocument()
        expect(screen.queryByText('About cron')).toBeNull()
        fireEvent.click(screen.getByRole('button', { name: 'draft' }))
        expect(screen.getByText('No post matches.')).toBeInTheDocument()
    })

    it('invites you to write the first post, and explains a load failure', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(200, { posts: [] }))
        const { unmount } = page('/admin/posts')
        expect(await screen.findByText(/No posts yet/)).toBeInTheDocument()
        unmount()
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(503, {}))
        page('/admin/posts')
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the posts')
    })
})

describe('post editor', () => {
    it('suggests the address from the title until you edit the address yourself', () => {
        page('/admin/posts/new')
        fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'Şifreleme notes' } })
        expect(screen.getByLabelText(/^Address/)).toHaveValue('sifreleme-notes')
        fireEvent.change(screen.getByLabelText(/^Address/), { target: { value: 'mine' } })
        fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'Another title' } })
        expect(screen.getByLabelText(/^Address/)).toHaveValue('mine')
    })

    it('previews the Markdown safely, as you type', () => {
        const { container } = render(<MemoryRouter initialEntries={['/admin/posts/new']}><Routes><Route path="/admin/posts/*" element={<AdminPosts />} /></Routes></MemoryRouter>)
        fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: '# Heading\n\n**bold** <script>window.x=1</script> [bad](javascript:alert(1))' } })
        const preview = screen.getByTestId('preview')
        expect(preview.querySelector('h2')).toHaveTextContent('Heading')
        expect(preview.querySelector('strong')).toHaveTextContent('bold')
        expect(container.querySelector('script')).toBeNull()
        expect(preview.querySelector('a')).toBeNull()
    })

    it('creates a post and moves to its page; shows the server messages under bad fields', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(reply(409, { errors: { slug: 'That address is already used by another post.' } }))
            .mockResolvedValueOnce(reply(201, { ok: true, id: 7 }))
            .mockResolvedValueOnce(reply(200, { post: { ...posts[0], id: 7, body: 'x', tags: [] } }))
        page('/admin/posts/new')
        fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'Same' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText('That address is already used by another post.')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/admin/posts/7'))
        expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/posts')
        expect(JSON.parse(fetchMock.mock.calls[1][1].body).title).toBe('Same')
    })

    it('loads an existing post, saves it with the save action, and asks before deleting', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(reply(200, { post: { ...posts[1], body: 'Old body', summary: 's', tags: ['linux', 'cron'] } }))
            .mockResolvedValueOnce(reply(200, { ok: true }))
            .mockResolvedValueOnce(reply(200, { ok: true }))
        page('/admin/posts/1')
        expect(await screen.findByLabelText(/^Title/)).toHaveValue('About cron')
        expect(screen.getByLabelText(/^Tags/)).toHaveValue('linux, cron')
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText('Saved.')).toBeInTheDocument()
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ action: 'save', slug: 'about-cron', status: 'public', tags: 'linux, cron' })
        fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }))
        expect(screen.getByText('Delete this post for good?')).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledTimes(2)
        fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
        await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/admin/posts'))
        expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ action: 'delete' })
    })

    it('says when the post does not exist', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(404, { error: 'Not found.' }))
        page('/admin/posts/99')
        expect(await screen.findByText(/That post does not exist/)).toBeInTheDocument()
    })
})
