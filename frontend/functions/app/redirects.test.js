// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { adminEnv, loginBody, makeRedirect } from '../_test/factories.js'
import worker from '../worker.ts'

const ORIGIN = 'https://site.test'
let db, env
beforeEach(async () => { db = createTestD1(); env = await adminEnv(db) })
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie, withEnv = env } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    redirect: 'manual',
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), withEnv)
const signIn = async () => (await call('/api/admin/login', { method: 'POST', body: loginBody() })).headers.get('Set-Cookie').split(';')[0]

describe('admin redirects', () => {
  it('is closed without a session', async () => {
    expect((await call('/api/admin/redirects')).status).toBe(401)
    expect((await call('/api/admin/redirects', { method: 'POST', body: makeRedirect() })).status).toBe(401)
  })

  it('needs the same origin to change anything', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/redirects', { method: 'POST', cookie, origin: 'https://evil.test', body: makeRedirect() })).status).toBe(403)
  })

  it('creates, lists, changes and deletes', async () => {
    const cookie = await signIn()
    const made = await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect() })
    expect(made.status).toBe(201)
    const { id } = await made.json()
    expect((await (await call('/api/admin/redirects', { cookie })).json()).redirects[0]).toMatchObject({ slug: 'cv', clicks: 0 })
    expect((await call(`/api/admin/redirects/${id}`, { method: 'POST', cookie, body: { action: 'save', ...makeRedirect({ target: '/about' }) } })).status).toBe(200)
    expect((await (await call(`/api/admin/redirects/${id}`, { cookie })).json()).redirect.target).toBe('/about')
    expect((await call(`/api/admin/redirects/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(200)
    expect((await call(`/api/admin/redirects/${id}`, { cookie })).status).toBe(404)
  })

  it('refuses a bad target and a taken name with plain messages', async () => {
    const cookie = await signIn()
    const bad = await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect({ target: 'javascript:alert(1)' }) })
    expect(bad.status).toBe(400)
    expect((await bad.json()).errors.target).toBeTruthy()
    await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect() })
    expect((await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect() })).status).toBe(409)
  })
})

describe('GET /r/:slug', () => {
  it('sends a 302 to a https target and counts the visit', async () => {
    const cookie = await signIn()
    await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect() })
    const res = await call('/r/cv', { origin: null })
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('https://example.com/cv.pdf')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect((await (await call('/api/admin/redirects', { cookie })).json()).redirects[0].clicks).toBe(1)
  })

  it('sends a 301 for a permanent link and resolves a site path against this site', async () => {
    const cookie = await signIn()
    await call('/api/admin/redirects', { method: 'POST', cookie, body: makeRedirect({ slug: 'me', target: '/about', permanent: true }) })
    const res = await call('/r/me', { origin: null })
    expect(res.status).toBe(301)
    expect(res.headers.get('Location')).toBe(`${ORIGIN}/about`)
  })

  it('answers 404 for an unknown or malformed name and 503 without a database', async () => {
    expect((await call('/r/nothing', { origin: null })).status).toBe(404)
    expect((await call('/r/Not%20A%20Slug', { origin: null })).status).toBe(404)
    expect((await call('/r/cv', { origin: null, withEnv: { ASSETS: env.ASSETS } })).status).toBe(503)
  })
})
