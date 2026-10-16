import { readFileSync, existsSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const html = readFileSync('index.html', 'utf8')

describe('index.html', () => {
    it('has a title, description and theme color', () => {
        expect(html).toMatch(/<title>%BRAND_NAME%<\/title>/)
        expect(html).toMatch(/name="description"/)
        expect(html).toMatch(/name="theme-color" content="#050505"/)
    })
    it('has Open Graph and Twitter tags', () => {
        for (const tag of ['og:type', 'og:title', 'og:description', 'twitter:card']) expect(html).toContain(tag)
    })
    it('points at icon files that exist (not the Vite default)', () => {
        expect(html).not.toContain('vite.svg')
        for (const href of ['favicon.svg', 'site.webmanifest']) {
            expect(html).toContain(href)
            expect(existsSync(`public/${href}`)).toBe(true)
        }
    })
})

describe('index.html privacy', () => {
    it('loads no third-party stylesheets or fonts (the Privacy page says fonts are self-hosted)', () => {
        expect(html).not.toMatch(/<link[^>]+href="https?:/)
        expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    })
})
