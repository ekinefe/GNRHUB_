// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { adminEnv, loginBody } from '../_test/factories.js'
import worker from '../worker.ts'

const ORIGIN = 'https://site.test'
let db, env
beforeEach(async () => { db = createTestD1(); env = await adminEnv(db) })
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie, headers = {}, withEnv = env } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), withEnv)
const total = async () => (await db.prepare('SELECT COALESCE(SUM(views), 0) AS n FROM page_views').first()).n

describe('POST /api/hit', () => {
  it('counts a page and answers 204 with no body', async () => {
    const res = await call('/api/hit', { method: 'POST', body: { path: '/about' } })
    expect(res.status).toBe(204)
    expect(await res.text()).toBe('')
    expect(await total()).toBe(1)
  })
  it('does not count other origins, Do Not Track, Global Privacy Control, the admin area or bad bodies', async () => {
    await call('/api/hit', { method: 'POST', origin: 'https://evil.test', body: { path: '/a' } })
    await call('/api/hit', { method: 'POST', headers: { DNT: '1' }, body: { path: '/a' } })
    await call('/api/hit', { method: 'POST', headers: { 'Sec-GPC': '1' }, body: { path: '/a' } })
    await call('/api/hit', { method: 'POST', body: { path: '/admin' } })
    const bad = await call('/api/hit', { method: 'POST', headers: { 'Content-Length': '99999' }, body: { path: '/a' } })
    expect(bad.status).toBe(204)
    expect(await total()).toBe(0)
  })
  it('still answers 204 without a database', async () => {
    const res = await call('/api/hit', { method: 'POST', body: { path: '/a' }, withEnv: { ...env, DB: undefined } })
    expect(res.status).toBe(204)
  })
  it('only accepts POST', async () => {
    expect((await call('/api/hit')).status).toBe(405)
  })
})

describe('GET /api/admin/analytics', () => {
  it('is closed without a session', async () => {
    expect((await call('/api/admin/analytics')).status).toBe(401)
  })
  it('shows the counts to the owner', async () => {
    await call('/api/hit', { method: 'POST', body: { path: '/blog' } })
    const cookie = (await call('/api/admin/login', { method: 'POST', body: loginBody() })).headers.get('Set-Cookie').split(';')[0]
    const res = await call('/api/admin/analytics', { cookie })
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toContain('no-store')
    const data = await res.json()
    expect(data.total).toBe(1)
    expect(data.top).toEqual([{ path: '/blog', views: 1 }])
  })
})
