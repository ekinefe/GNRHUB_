import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { projects } from './projects'
import { tools } from './tools'
import { blogs } from './blogs'

const routes = [...readFileSync('src/app/App.jsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])

describe('launch content', () => {
    it('every tool and blog link points at a real route', () => {
        for (const { link } of [...tools, ...blogs]) expect(routes).toContain(link)
    })
    it('every project has a unique id, tech, and a public repo URL or none', () => {
        expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
        for (const p of projects) {
            expect(p.tech.length).toBeGreaterThan(0)
            expect(p.repo === null || /^https:\/\/github\.com\/ekinefe\//.test(p.repo)).toBe(true)
        }
    })
})
