// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { adminEnv, loginBody } from '../_test/factories.js'
import worker from '../worker.ts'

const ORIGIN = 'https://site.test'
let db, env
beforeEach(async () => { db = createTestD1(); env = await adminEnv(db) })
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie, withEnv = env } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), withEnv)
const signIn = async () => (await call('/api/admin/login', { method: 'POST', body: loginBody() })).headers.get('Set-Cookie').split(';')[0]
const text = (over = {}) => ({ summary: 'A personal site. It keeps almost nothing about you.', body: '# Privacy\n\n' + 'Plain text about what is kept. '.repeat(6), ...over })

describe('public legal API', () => {
  it('is 404 until a version is saved, and for an unknown document', async () => {
    expect((await call('/api/legal/privacy')).status).toBe(404)
    expect((await call('/api/legal/cookies')).status).toBe(404)
  })
  it('shows the newest version, cached briefly', async () => {
    const cookie = await signIn()
    await call('/api/admin/legal/privacy', { method: 'POST', cookie, body: text() })
    const res = await call('/api/legal/privacy')
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect((await res.json()).document).toMatchObject({ doc: 'privacy', version: 1 })
  })
  it('answers 503 without a database', async () => {
    expect((await call('/api/legal/privacy', { withEnv: { ...env, DB: undefined } })).status).toBe(503)
  })
})

describe('admin legal API', () => {
  it('is closed without a session', async () => {
    expect((await call('/api/admin/legal/privacy')).status).toBe(401)
    expect((await call('/api/admin/legal/privacy', { method: 'POST', body: text() })).status).toBe(401)
  })
  it('needs the same origin to save', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/legal/privacy', { method: 'POST', cookie, origin: 'https://evil.test', body: text() })).status).toBe(403)
  })
  it('saves versions, reports unchanged text and reads an old version', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/legal/terms', { method: 'POST', cookie, body: text() })).status).toBe(201)
    const same = await call('/api/admin/legal/terms', { method: 'POST', cookie, body: text() })
    expect(same.status).toBe(200)
    expect(await same.json()).toEqual({ ok: true, version: 1, unchanged: true })
    await call('/api/admin/legal/terms', { method: 'POST', cookie, body: text({ summary: 'A second summary, clearly different.' }) })
    const data = await (await call('/api/admin/legal/terms', { cookie })).json()
    expect(data.current.version).toBe(2)
    expect(data.versions.map((v) => v.version)).toEqual([2, 1])
    expect((await (await call('/api/admin/legal/terms?version=1', { cookie })).json()).current.version).toBe(1)
    expect((await call('/api/admin/legal/terms?version=7', { cookie })).status).toBe(404)
    expect((await call('/api/admin/legal/terms?version=x', { cookie })).status).toBe(404)
  })
  it('answers 400 with a message per field and 404 for an unknown document', async () => {
    const cookie = await signIn()
    const bad = await call('/api/admin/legal/terms', { method: 'POST', cookie, body: { summary: '', body: '' } })
    expect(bad.status).toBe(400)
    expect(Object.keys((await bad.json()).errors)).toEqual(['summary', 'body'])
    expect((await call('/api/admin/legal/cookies', { cookie })).status).toBe(404)
  })
})
