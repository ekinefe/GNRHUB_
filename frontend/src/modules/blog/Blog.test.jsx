import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BlogList from './BlogList'
import BlogPost from './BlogPost'

// The big 404 is drawn on a canvas, which jsdom does not have.
vi.mock('@/shared/animations/FuzzyText', () => ({ default: ({ children }) => <div>{children}</div> }))

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
afterEach(() => vi.restoreAllMocks())

const posts = [
    { slug: 'about-cron', title: 'About cron', summary: 'How cron really works.', tags: ['linux', 'cron'], publishedAt: 1_790_000_000 },
    { slug: 'notes', title: 'Notes', summary: '', tags: [], publishedAt: 1_780_000_000 },
]
const list = (path = '/blog') => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/blog" element={<BlogList />} /></Routes></MemoryRouter>)
const single = (path) => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/blog/:slug" element={<BlogPost />} /><Route path="*" element={<p>other</p>} /></Routes></MemoryRouter>)

describe('BlogList', () => {
    it('lists public posts with date, summary and tag buttons, and asks the API once', async () => {
        const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        expect(await screen.findByRole('link', { name: 'About cron' })).toHaveAttribute('href', '/blog/about-cron')
        expect(screen.getByText('How cron really works.')).toBeInTheDocument()
        expect(f).toHaveBeenCalledTimes(1)
        expect(f.mock.calls[0][0]).toBe('/api/posts')
    })

    it('has a sidebar with the tags and their counts, and filters by a tag', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        await screen.findByRole('link', { name: 'About cron' })
        expect(screen.getByRole('button', { name: 'all 2' })).toHaveAttribute('aria-pressed', 'true')
        fireEvent.click(screen.getByRole('button', { name: '#linux 1' }))
        expect(screen.getByRole('link', { name: 'About cron' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Notes' })).toBeNull()
        expect(screen.getByRole('button', { name: '#linux 1' })).toHaveAttribute('aria-pressed', 'true')
        fireEvent.click(screen.getByRole('button', { name: /Clear filters/ }))
        expect(screen.getByRole('link', { name: 'Notes' })).toBeInTheDocument()
    })

    it('reads the tag from the address and ignores hostile characters in it', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list('/blog?tag=Linux%22%3E%3Cscript%3E')
        expect(await screen.findByText(/No posts match your search/)).toBeInTheDocument()
        expect(document.querySelector('script')).toBeNull()
    })

    it('keeps a line under the search box at all times: ready before you type, the count while you do', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        const { container } = list()
        await screen.findByRole('link', { name: 'About cron' })
        await waitFor(() => expect(container.textContent).toMatch(/2 posts\. Type to search/))
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: 'zzzzzz' } })
        await waitFor(() => expect(container.textContent).toMatch(/Found 0 results/))
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: '' } })
        await waitFor(() => expect(container.textContent).toMatch(/2 posts\. Type to search/))
    })

    it('searches forgivingly, shows the animated result count under the search box and highlights matches', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        const { container } = list()
        await screen.findByRole('link', { name: 'About cron' })
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: 'crn' } })
        await waitFor(() => expect(screen.queryByRole('link', { name: 'Notes' })).toBeNull())
        expect(screen.getByRole('link', { name: 'About cron' })).toBeInTheDocument()
        await waitFor(() => expect(container.textContent).toMatch(/Found 1 result/))
    })

    it('suggests tags when nothing matches, and picking one shows its posts', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        await screen.findByRole('link', { name: 'About cron' })
        fireEvent.change(screen.getByLabelText('Search posts'), { target: { value: 'zzzzzz' } })
        expect(await screen.findByText(/No posts match your search/)).toBeInTheDocument()
        fireEvent.click(screen.getAllByRole('button', { name: '#linux' })[0])
        expect(await screen.findByRole('link', { name: 'About cron' })).toBeInTheDocument()
    })

    it('offers the RSS feed in the sidebar', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        expect(await screen.findByRole('link', { name: /Subscribe with RSS/ })).toHaveAttribute('href', '/blog/feed.xml')
    })

    it('can show the oldest posts first', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        await screen.findByRole('link', { name: 'About cron' })
        fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }))
        const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent).filter((t) => ['About cron', 'Notes'].includes(t))
        expect(titles).toEqual(['Notes', 'About cron'])
    })

    it('says so when there are no posts, and when loading fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(200, { posts: [] }))
        const { unmount } = list()
        expect(await screen.findByText(/No posts yet/)).toBeInTheDocument()
        unmount()
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(500, {}))
        list()
        expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument()
    })
})

describe('BlogPost', () => {
    const post = { slug: 'about-cron', title: 'About cron', summary: 'S', tags: ['linux'], publishedAt: 1_790_000_000, body: '# Hello\n\n**bold** <script>window.hacked=1</script> [x](javascript:alert(1))' }

    it('shows the post through the safe renderer: HTML and javascript links stay text', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { post }))
        const { container } = single('/blog/about-cron')
        expect(await screen.findByRole('heading', { level: 1, name: 'About cron' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument()
        expect(container.querySelector('script')).toBeNull()
        expect(container.querySelector('a[href^="javascript"]')).toBeNull()
        expect(window.hacked).toBeUndefined()
        expect(screen.getByRole('link', { name: '#linux' })).toHaveAttribute('href', '/blog?tag=linux')
    })

    it('shows the 404 page for a post that does not exist (or is not public)', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(404, { error: 'Not found.' }))
        single('/blog/secret-draft')
        expect(await screen.findByText('404')).toBeInTheDocument()
    })

    it('asks for the post by an encoded slug', async () => {
        const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(404, {}))
        single('/blog/a%2Fb')
        await screen.findByText('404')
        expect(f.mock.calls[0][0]).toBe('/api/posts/a%2Fb')
    })
})
