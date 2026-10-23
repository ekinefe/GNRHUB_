import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useProjects, resetProjectsCache } from './useProjects'
import { projects as builtIn, toolProjects as builtInTools } from './projects'

const Probe = () => {
    const { projects, toolProjects, featuredProjects, aboutProjects } = useProjects()
    return <p data-testid="out">{[projects.map((p) => p.id).join(','), toolProjects.map((p) => p.id).join(','), featuredProjects.map((p) => p.id).join(','), aboutProjects.map((p) => p.id).join(',')].join('|')}</p>
}
const reply = (status, body) => new Response(JSON.stringify(body), { status })
const row = (id, over = {}) => ({ id, group: 'project', name: id, kind: 'Web app', summary: 's', tech: [], points: [], status: 'live', repo: null, url: null, featured: false, inAbout: false, ...over })
const out = () => screen.getByTestId('out').textContent

beforeEach(resetProjectsCache)
afterEach(() => vi.restoreAllMocks())

describe('useProjects', () => {
    it('starts with the built-in list, so the page is never empty while loading', () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}))
        render(<Probe />)
        expect(out().split('|')[0]).toBe(builtIn.map((p) => p.id).join(','))
        expect(out().split('|')[1]).toBe(builtInTools.map((p) => p.id).join(','))
    })

    it('switches to the owner\'s list once the API answers, split into projects and tools, with the Home and About picks', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { projects: [row('a', { featured: true }), row('b', { inAbout: true }), row('t', { group: 'tool' })] }))
        render(<Probe />)
        await waitFor(() => expect(out()).toBe('a,b|t|a|b'))
    })

    it('keeps the built-in list when the owner has added nothing, the API fails, or the answer is not JSON', async () => {
        for (const mock of [() => reply(200, { projects: [] }), () => reply(500, {}), () => new Response('<html>', { status: 200 })]) {
            resetProjectsCache()
            const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => mock())
            const { unmount } = render(<Probe />)
            await waitFor(() => expect(spy).toHaveBeenCalled())
            await new Promise((r) => setTimeout(r, 0))
            expect(out().split('|')[0]).toBe(builtIn.map((p) => p.id).join(','))
            unmount()
            spy.mockRestore()
        }
    })

    it('keeps the built-in list when the request throws', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
        render(<Probe />)
        await new Promise((r) => setTimeout(r, 0))
        expect(out().split('|')[0]).toBe(builtIn.map((p) => p.id).join(','))
    })

    it('asks the API once for the whole page, however many components use it', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { projects: [row('a')] }))
        render(<><Probe /><Probe /></>)
        await waitFor(() => expect(screen.getAllByTestId('out')[0].textContent).toBe('a||'+'|'))
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
