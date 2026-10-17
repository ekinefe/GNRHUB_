/* global URLPattern */
import { describe, it, expect, vi } from 'vitest'
import worker, { handle, routes } from './worker.ts'

const assets = { fetch: vi.fn(async () => new Response('<div id="root"></div>', { headers: { 'Content-Type': 'text/html' } })) }
const env = { ASSETS: assets, DB: {} }
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

  it('calls the handler with { request, env } (mail stays off by default)', async () => {
    const res = await handle(req('/api/send-brandbook', 'POST'), env)
    expect(res.status).toBe(501)
  })

  it('answers 405 with Allow for a wrong method', async () => {
    const res = await handle(req('/api/send-brandbook', 'GET'), env)
    expect(res.status).toBe(405)
    expect(res.headers.get('Allow')).toBe('POST')
  })

  it('turns a thrown handler into JSON 500', async () => {
    const boom = { pattern: new URLPattern({ pathname: '/api/boom' }), module: { onRequestGet: () => { throw new Error('x') } } }
    routes.push(boom)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await handle(req('/api/boom'), env)
    expect(res.status).toBe(500)
    spy.mockRestore()
    routes.pop()
  })
})
