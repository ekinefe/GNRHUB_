/* global URLPattern */
import { describe, it, expect, vi } from 'vitest'
import worker, { handle, routes } from './worker.ts'

const assets = { fetch: vi.fn(async () => new Response('<div id="root"></div>', { headers: { 'Content-Type': 'text/html' } })) }
const env = { ASSETS: assets }
const req = (path, method = 'GET') => new Request(`https://example.com${path}`, { method })

describe('worker', () => {
  it('serves non-api paths from assets', async () => {
    const res = await worker.fetch(req('/about'), env)
    expect(res.status).toBe(200)
    expect(assets.fetch).toHaveBeenCalled()
  })

  it('returns JSON 404 for an unknown api path and never hits assets', async () => {
    assets.fetch.mockClear()
    const res = await handle(req('/api/nope'), env)
    expect(res.status).toBe(404)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(assets.fetch).not.toHaveBeenCalled()
  })

  it('calls the handler with { request, env }', async () => {
    const ping = vi.fn(() => new Response('pong'))
    routes.push({ pattern: new URLPattern({ pathname: '/api/ping' }), module: { onRequestPost: ping } })
    const res = await handle(req('/api/ping', 'POST'), env)
    expect(res.status).toBe(200)
    expect(ping.mock.calls[0][0].env).toBe(env)
    routes.pop()
  })

  it('answers 405 with Allow for a wrong method', async () => {
    routes.push({ pattern: new URLPattern({ pathname: '/api/ping' }), module: { onRequestPost: () => new Response('pong') } })
    const res = await handle(req('/api/ping', 'GET'), env)
    expect(res.status).toBe(405)
    expect(res.headers.get('Allow')).toBe('POST')
    routes.pop()
  })

  it('turns a thrown handler into JSON 500', async () => {
    const boom = { pattern: new URLPattern({ pathname: '/api/boom' }), module: { onRequestGet: () => { throw new Error('x') } } }
    routes.push(boom)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await handle(req('/api/boom'), env)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Internal error.' })
    spy.mockRestore()
    routes.pop()
  })

  it('shows the real cause on admin routes only to a signed-in admin', async () => {
    const { signSession, COOKIE_NAME } = await import('./domain/admin/session.ts')
    const secret = 's'.repeat(40)
    routes.push({ pattern: new URLPattern({ pathname: '/api/admin/boom' }), module: { onRequestGet: () => { throw new Error('db down') } } })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const e = { ...env, SESSION_SECRET: secret }
    const anonymous = await handle(req('/api/admin/boom'), e)
    expect(await anonymous.json()).toEqual({ error: 'Internal error.' })
    const token = await signSession(secret, 'owner')
    const signedIn = await handle(new Request('https://example.com/api/admin/boom', { headers: { Cookie: `${COOKIE_NAME}=${token}` } }), e)
    expect(await signedIn.json()).toEqual({ error: 'Server error: db down' })
    spy.mockRestore()
    routes.pop()
  })
})

describe('observability (GNR-126)', () => {
  it('adds a request id header and logs one line without IP or query string', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = await worker.fetch(new Request('https://example.com/api/nope?secret=1', { headers: { 'CF-Connecting-IP': '203.0.113.9' } }), env)
    const id = res.headers.get('X-Request-Id')
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
    const line = log.mock.calls.at(-1)[0]
    log.mockRestore()
    expect(JSON.parse(line)).toMatchObject({ id, method: 'GET', path: '/api/nope', status: 404 })
    expect(line).not.toMatch(/203\.0\.113\.9|secret/)
  })

  it('gives each request its own id', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const a = (await worker.fetch(req('/api/nope'), env)).headers.get('X-Request-Id')
    const b = (await worker.fetch(req('/api/nope'), env)).headers.get('X-Request-Id')
    log.mockRestore()
    expect(a).not.toBe(b)
  })
})
