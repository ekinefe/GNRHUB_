import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import Projects from './Projects'
import { projects, toolProjects } from '@/shared/content/projects'
import { resetProjectsCache } from '@/shared/content/useProjects'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
beforeEach(() => resetProjectsCache())
afterEach(() => vi.restoreAllMocks())

const none = () => vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 404 }))
const at = (path) => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/projects" element={<Projects />} /><Route path="/projects/:id" element={<ProjectDetail />} /><Route path="*" element={<p>other</p>} /></Routes></MemoryRouter>)

describe('project page', () => {
    it('shows a built-in project with its status, summary and a way back', async () => {
        none()
        const p = projects[0]
        at(`/projects/${p.id}`)
        expect(await screen.findByRole('heading', { level: 1, name: p.name })).toBeInTheDocument()
        expect(screen.getByText(p.summary)).toBeInTheDocument()
        expect(screen.getByText(/Works today/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /All projects/ })).toHaveAttribute('href', '/projects')
    })
    it('says plainly that a planned tool is not live and offers no live link', async () => {
        none()
        const soon = toolProjects.find((t) => t.status === 'soon')
        at(`/projects/${soon.id}`)
        expect(await screen.findByText(/not live yet/)).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Live site/ })).not.toBeInTheDocument()
    })
    it('finds a project that only exists in the admin list, once the server has answered', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ managed: true, projects: [{ id: 'new-one', group: 'project', name: 'New One', kind: 'Web app', summary: 'Only in the database.', tech: ['D1'], points: [], status: 'live', repo: null, url: null, featured: false, inAbout: false }] }), { status: 200 }))
        at('/projects/new-one')
        expect(await screen.findByRole('heading', { level: 1, name: 'New One' })).toBeInTheDocument()
    })
    it('shows the not-found page for an unknown project', async () => {
        none()
        at('/projects/nope')
        expect(await screen.findByText('Page not found')).toBeInTheDocument()
    })
    it('is reached from the Projects list', async () => {
        none()
        at('/projects')
        const link = await screen.findByRole('link', { name: projects[0].name })
        expect(link).toHaveAttribute('href', `/projects/${projects[0].id}`)
    })
})
