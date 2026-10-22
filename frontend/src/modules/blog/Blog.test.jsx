import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    it('lists public posts with date, summary and tag links', async () => {
        const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts }))
        list()
        expect(await screen.findByRole('link', { name: 'About cron' })).toHaveAttribute('href', '/blog/about-cron')
        expect(screen.getByText('How cron really works.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: '#linux' })).toHaveAttribute('href', '/blog?tag=linux')
        expect(f.mock.calls[0][0]).toBe('/api/posts')
    })

    it('filters by tag, and cleans a hostile tag before asking the API', async () => {
        const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { posts: [posts[0]] }))
        list('/blog?tag=Linux%22%3E%3Cscript%3E')
        await screen.findByRole('link', { name: 'About cron' })
        expect(f.mock.calls[0][0]).toBe('/api/posts?tag=linuxscript')
        expect(screen.getByRole('link', { name: 'Show all' })).toHaveAttribute('href', '/blog')
    })

    it('says so when there are no posts, and when loading fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(200, { posts: [] }))
        const { unmount } = list()
        expect(await screen.findByText(/No posts yet/)).toBeInTheDocument()
        unmount()
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(500, {}))
        list()
        expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
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
