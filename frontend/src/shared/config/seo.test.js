import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { sitemapPaths, sitemapXml, robotsTxt } from './seo'
import { features } from './features'

const routes = [...readFileSync('src/app/App.jsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])

describe('sitemap and robots', () => {
    it('lists only real routes that are live at launch', () => {
        const gated = ['/login', '/register', '/dashboard', '/blogs', '/403', '/500']
        for (const p of sitemapPaths) {
            expect(routes).toContain(p)
            expect(gated).not.toContain(p)
        }
        expect(Object.values(features).some(Boolean)).toBe(false) // launch defaults: everything gated is off
    })
    it('builds absolute URLs from the base', () => {
        const xml = sitemapXml('https://example.test', ['/', '/about'])
        expect(xml).toContain('<loc>https://example.test/</loc>')
        expect(xml).toContain('<loc>https://example.test/about</loc>')
        expect(robotsTxt('https://example.test')).toContain('Sitemap: https://example.test/sitemap.xml')
    })
})
