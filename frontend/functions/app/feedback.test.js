// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { adminEnv, loginBody } from '../_test/factories.js'
import worker from '../worker.ts'

const ORIGIN = 'https://site.test'
let db, env
beforeEach(async () => { db = createTestD1(); env = await adminEnv(db) })
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie, withEnv = env, raw } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  }), withEnv)
const report = (over = {}) => ({ kind: 'problem', page: '/about', message: 'The About page is missing a heading.', ...over })
const signIn = async () => (await call('/api/admin/login', { method: 'POST', body: loginBody() })).headers.get('Set-Cookie').split(';')[0]

describe('POST /api/feedback', () => {
  it('stores a report and answers 201', async () => {
    expect((await call('/api/feedback', { method: 'POST', body: report() })).status).toBe(201)
    expect((await db.prepare('SELECT COUNT(*) AS n FROM feedback').first()).n).toBe(1)
  })
  it('answers 400 with a message per field', async () => {
    const res = await call('/api/feedback', { method: 'POST', body: report({ message: '' }) })
    expect(res.status).toBe(400)
    expect((await res.json()).errors.message).toBeTruthy()
  })
  it('refuses another origin, an unreadable or oversized body, and a missing database', async () => {
    expect((await call('/api/feedback', { method: 'POST', origin: 'https://evil.test', body: report() })).status).toBe(403)
    expect((await call('/api/feedback', { method: 'POST', raw: '{nope' })).status).toBe(400)
    expect((await call('/api/feedback', { method: 'POST', raw: JSON.stringify({ message: 'x'.repeat(9000) }) })).status).toBe(400)
    expect((await call('/api/feedback', { method: 'POST', body: report(), withEnv: { ...env, DB: undefined } })).status).toBe(503)
  })
  it('answers 429 with Retry-After after three reports', async () => {
    for (let i = 0; i < 3; i++) await call('/api/feedback', { method: 'POST', body: report() })
    const res = await call('/api/feedback', { method: 'POST', body: report() })
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0)
  })
})

describe('admin feedback', () => {
  it('is closed without a session', async () => {
    expect((await call('/api/admin/feedback')).status).toBe(401)
    expect((await call('/api/admin/feedback/1', { method: 'POST', body: { action: 'read' } })).status).toBe(401)
  })
  it('needs the same origin to change anything', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/feedback/1', { method: 'POST', cookie, origin: 'https://evil.test', body: { action: 'read' } })).status).toBe(403)
  })
  it('lists, marks read and deletes', async () => {
    await call('/api/feedback', { method: 'POST', body: report({ email: 'ada@example.com' }) })
    const cookie = await signIn()
    const list = await (await call('/api/admin/feedback', { cookie })).json()
    expect(list.unread).toBe(1)
    expect(list.feedback[0]).toMatchObject({ kind: 'problem', page: '/about', email: 'ada@example.com', read: false })
    const id = list.feedback[0].id
    expect((await call(`/api/admin/feedback/${id}`, { method: 'POST', cookie, body: { action: 'read' } })).status).toBe(200)
    expect((await (await call('/api/admin/feedback', { cookie })).json()).unread).toBe(0)
    expect((await call(`/api/admin/feedback/${id}`, { method: 'POST', cookie, body: { action: 'nope' } })).status).toBe(400)
    expect((await call(`/api/admin/feedback/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(200)
    expect((await call(`/api/admin/feedback/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(404)
  })
})
