import { readFileSync, existsSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { projects } from './projects'

const routes = [...readFileSync('src/app/App.jsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])

describe('launch content', () => {
    it('every project link resolves: case studies are routes, screenshots exist, live URLs are https', () => {
        for (const p of projects) {
            if (p.caseStudy) expect(routes).toContain(p.caseStudy)
            if (p.image) {
                expect(existsSync(`public${p.image}`)).toBe(true)
                expect(p.imageAlt).toBeTruthy()
            }
            if (p.url) expect(p.url).toMatch(/^https:\/\//)
        }
    })
    it('every project has a unique id, tech, and a public repo URL or none', () => {
        expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
        for (const p of projects) {
            expect(p.tech.length).toBeGreaterThan(0)
            expect(p.repo === null || /^https:\/\/github\.com\/ekinefe\//.test(p.repo)).toBe(true)
        }
    })
})

describe('projects', () => {
    it('uses known statuses, unique ids, and gives a live tool a url', async () => {
        const { projects, toolProjects } = await import('./projects')
        const all = [...projects, ...toolProjects]
        expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
        for (const p of all) expect(['live', 'soon', 'paused']).toContain(p.status)
        for (const p of toolProjects) if (p.status === 'live') expect(p.url, p.id).toMatch(/^https:\/\//)
    })
})
