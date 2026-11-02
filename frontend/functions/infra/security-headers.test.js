/* global URLPattern */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import worker, { routes } from '../worker.ts'
import { CSP, SECURITY_HEADERS } from './security-headers.ts'

const env = { ASSETS: { fetch: async () => new Response('<div id="root"></div>', { headers: { 'Content-Type': 'text/html' } }) } }
const ping = { pattern: new URLPattern({ pathname: '/api/ping' }), module: { onRequestPost: () => new Response('pong') } }
beforeAll(() => { routes.push(ping) })
afterAll(() => { routes.splice(routes.indexOf(ping), 1) })

const get = (path, method = 'GET') => worker.fetch(new Request(`https://example.com${path}`, { method }), env)

describe('security headers', () => {
  it.each(['/', '/about', '/api/nope', '/api/ping'])('are set on %s', async (path) => {
    const res = await get(path, path === '/api/ping' ? 'POST' : 'GET')
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(res.headers.get(name)).toBe(value)
  })

  it('are set on error responses too', async () => {
    const res = await get('/api/ping', 'GET')
    expect(res.status).toBe(405)
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('keeps the original headers', async () => {
    const res = await get('/')
    expect(res.headers.get('Content-Type')).toBe('text/html')
  })

  it('CSP forbids framing, plugins and any external origin', () => {
    expect(CSP).toContain("frame-ancestors 'none'")
    expect(CSP).toContain("object-src 'none'")
    expect(CSP).not.toContain('*')
    const scriptSrc = CSP.split('; ').find((d) => d.startsWith('script-src'))
    expect(scriptSrc).toBe("script-src 'self'")
    expect(CSP).not.toMatch(/https?:/)
  })

  it('exposes the required headers', () => {
    for (const h of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
      expect(SECURITY_HEADERS[h]).toBeTruthy()
    }
  })
})

describe('public/_headers', () => {
  it('matches the Worker headers so static pages and the API agree', async () => {
    const { readFileSync } = await import('node:fs')
    const text = readFileSync('public/_headers', 'utf8')
    const block = text.split('\n/*\n')[1].split('\n\n')[0] // the `/*` rule only
    const lines = block.split('\n').filter((l) => l.startsWith('  '))
    const parsed = Object.fromEntries(lines.map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
    expect(parsed).toEqual(SECURITY_HEADERS)
  })
})
