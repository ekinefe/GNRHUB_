// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import worker from '../../worker.ts'
import { hashPassword } from '../../_lib/password.ts'
import { PER_CLIENT_LIMIT, GLOBAL_LIMIT, contactClientKey } from '../../_lib/contactLimit.ts'

const ORIGIN = 'https://site.test'
let db, env

beforeEach(async () => {
  db = createTestD1()
  env = {
    ASSETS: { fetch: async () => new Response('x') },
    DB: db,
    ADMIN_USERNAME: 'ekin',
    ADMIN_PASSWORD_HASH: await hashPassword('a long passphrase here', 2000),
    SESSION_SECRET: 'k'.repeat(40),
  }
})
afterEach(() => db.close())

const call = (path, { method = 'POST', body, origin = ORIGIN, cookie, ip = '203.0.113.1' } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }), env)

const msg = { name: 'Ada', email: 'ada@example.com', subject: 'Internship', message: 'I would like to talk about an internship.' }
const rows = async () => (await db.prepare('SELECT name, email, subject, message, read_at FROM contact_messages ORDER BY id').all()).results
const signIn = async () => (await call('/api/admin/login', { body: { username: 'ekin', password: 'a long passphrase here' } })).headers.get('Set-Cookie').split(';')[0]

describe('POST /api/contact', () => {
  it('stores a valid message', async () => {
    const res = await call('/api/contact', { body: msg })
    expect(res.status).toBe(201)
    expect(await rows()).toEqual([{ ...msg, read_at: null }])
  })

  it('answers 400 with one message per bad field and stores nothing', async () => {
    const res = await call('/api/contact', { body: { name: '', email: 'x', message: 'hi' } })
    expect(res.status).toBe(400)
    const { errors } = await res.json()
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
    expect(await rows()).toEqual([])
  })

  it('pretends to accept a filled honeypot but stores nothing', async () => {
    const res = await call('/api/contact', { body: { ...msg, website: 'http://spam.test' } })
    expect(res.status).toBe(201)
    expect(await rows()).toEqual([])
  })

  it('rate limits a client, but not another one', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT; i++) expect((await call('/api/contact', { body: msg })).status).toBe(201)
    const limited = await call('/api/contact', { body: msg })
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect((await call('/api/contact', { body: msg, ip: '203.0.113.50' })).status).toBe(201)
    expect((await rows()).length).toBe(PER_CLIENT_LIMIT + 1)
  })

  it('has an overall cap across clients', async () => {
    for (let i = 0; i < GLOBAL_LIMIT; i++) expect((await call('/api/contact', { body: msg, ip: `198.51.100.${i}` })).status).toBe(201)
    expect((await call('/api/contact', { body: msg, ip: '192.0.2.77' })).status).toBe(429)
  })

  it('refuses another site and a missing Origin, an oversize body, and non-JSON', async () => {
    expect((await call('/api/contact', { body: msg, origin: 'https://evil.test' })).status).toBe(403)
    expect((await call('/api/contact', { body: msg, origin: null })).status).toBe(403)
    expect((await call('/api/contact', { body: JSON.stringify({ ...msg, message: 'x'.repeat(20000) }) })).status).toBe(413)
    expect((await call('/api/contact', { body: 'not json' })).status).toBe(400)
    expect(await rows()).toEqual([])
  })

  it('says it is unavailable (not silently lost) when there is no database', async () => {
    delete env.DB
    const res = await call('/api/contact', { body: msg })
    expect(res.status).toBe(503)
    expect((await res.json()).error).toMatch(/email me/)
  })

  it('keeps hostile text as plain stored text, bound as values', async () => {
    const evil = { ...msg, name: "x'); DROP TABLE contact_messages;--", message: '<script>alert(1)</script> and more text' }
    expect((await call('/api/contact', { body: evil })).status).toBe(201)
    expect((await rows())[0].name).toBe(evil.name)
    expect((await rows()).length).toBe(1)
  })

  it('stores a keyed hash of the address, never the address', async () => {
    await call('/api/contact', { body: msg, ip: '198.51.100.9' })
    const { results } = await db.prepare('SELECT key FROM contact_hits').all()
    expect(JSON.stringify(results)).not.toContain('198.51.100.9')
    expect(results.some((r) => r.key === '*')).toBe(true)
    expect(await contactClientKey(new Request('https://x.test', { headers: { 'CF-Connecting-IP': '198.51.100.9' } }), env.SESSION_SECRET)).toMatch(/^[0-9a-f]{32}$/)
  })
})

describe('admin messages', () => {
  it('needs a signed-in admin for everything', async () => {
    await call('/api/contact', { body: msg })
    expect((await call('/api/admin/messages', { method: 'GET', origin: null })).status).toBe(401)
    expect((await call('/api/admin/messages/1', { body: { action: 'delete' } })).status).toBe(401)
    expect((await rows()).length).toBe(1)
  })

  it('lists newest first with the unread count, then marks read and unread', async () => {
    await call('/api/contact', { body: msg })
    await call('/api/contact', { body: { ...msg, name: 'Bo', subject: 'Second' }, ip: '203.0.113.9' })
    const cookie = await signIn()
    const listed = await (await call('/api/admin/messages', { method: 'GET', cookie, origin: null })).json()
    expect(listed.unread).toBe(2)
    expect(listed.messages.map((m) => m.name)).toEqual(['Bo', 'Ada'])
    const id = listed.messages[0].id
    expect((await call(`/api/admin/messages/${id}`, { cookie, body: { action: 'read' } })).status).toBe(200)
    expect((await (await call('/api/admin/messages', { method: 'GET', cookie, origin: null })).json()).unread).toBe(1)
    await call(`/api/admin/messages/${id}`, { cookie, body: { action: 'unread' } })
    expect((await (await call('/api/admin/messages', { method: 'GET', cookie, origin: null })).json()).unread).toBe(2)
  })

  it('deletes one message, answers 404 for a missing one, 400 for a bad action, and needs the same origin', async () => {
    await call('/api/contact', { body: msg })
    const cookie = await signIn()
    expect((await call('/api/admin/messages/1', { cookie, body: { action: 'delete' }, origin: 'https://evil.test' })).status).toBe(403)
    expect((await call('/api/admin/messages/1', { cookie, body: { action: 'explode' } })).status).toBe(400)
    expect((await call('/api/admin/messages/999', { cookie, body: { action: 'read' } })).status).toBe(404)
    expect((await call('/api/admin/messages/abc', { cookie, body: { action: 'read' } })).status).toBe(404)
    expect((await call('/api/admin/messages/1', { cookie, body: { action: 'delete' } })).status).toBe(200)
    expect(await rows()).toEqual([])
  })
})
