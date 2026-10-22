// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import worker from '../../worker.ts'
import { hashPassword } from '../../_lib/password.ts'
import { PER_CLIENT_LIMIT } from '../../_lib/loginLimit.ts'
import { requireAdmin } from '../../_lib/adminGuard.ts'

const ORIGIN = 'https://site.test'
const SECRET = 'k'.repeat(40)
let db, env

beforeEach(async () => {
  db = createTestD1()
  env = {
    ASSETS: { fetch: async () => new Response('x') },
    DB: db,
    ADMIN_USERNAME: 'ekin',
    ADMIN_PASSWORD_HASH: await hashPassword('a long passphrase here', 2000),
    SESSION_SECRET: SECRET,
  }
})
afterEach(() => db.close())

const call = (path, { method = 'POST', body, origin = ORIGIN, cookie, ip = '203.0.113.1' } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }), env)

const good = { username: 'ekin', password: 'a long passphrase here' }
const cookieOf = (res) => res.headers.get('Set-Cookie').split(';')[0]

describe('POST /api/admin/login', () => {
  it('signs in with the right credentials: hardened cookie, then /me knows you', async () => {
    const res = await call('/api/admin/login', { body: good })
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('Set-Cookie')
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) expect(setCookie).toContain(flag)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const me = await call('/api/admin/me', { method: 'GET', cookie: cookieOf(res), origin: null })
    expect(me.status).toBe(200)
    expect((await me.json()).user).toBe('owner')
  })

  it('answers a wrong username and a wrong password the same way, and sets no cookie', async () => {
    const wrongUser = await call('/api/admin/login', { body: { ...good, username: 'someone' } })
    const wrongPass = await call('/api/admin/login', { body: { ...good, password: 'nope nope nope' } })
    expect(wrongUser.status).toBe(401)
    expect(wrongPass.status).toBe(401)
    expect(await wrongUser.text()).toBe(await wrongPass.text())
    expect(wrongUser.headers.get('Set-Cookie')).toBeNull()
  })

  it('treats junk bodies as a failed attempt, not a crash', async () => {
    for (const body of ['not json', '{}', '{"username":1,"password":2}', 'x'.repeat(5000), JSON.stringify({ username: 'ekin', password: 'p'.repeat(500) })]) {
      const res = await call('/api/admin/login', { body })
      expect(res.status).toBe(401)
    }
  })

  it('rate limits guessing, even if the next guess is right', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT; i++) expect((await call('/api/admin/login', { body: { ...good, password: `wrong ${i}` } })).status).toBe(401)
    const locked = await call('/api/admin/login', { body: good })
    expect(locked.status).toBe(429)
    expect(Number(locked.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect((await call('/api/admin/login', { body: good, ip: '203.0.113.99' })).status).toBe(200) // another client is not locked
  })

  it('refuses a request from another site or with no Origin', async () => {
    expect((await call('/api/admin/login', { body: good, origin: 'https://evil.test' })).status).toBe(403)
    expect((await call('/api/admin/login', { body: good, origin: null })).status).toBe(403)
  })

  it('is unavailable (not open) when a secret or the database is missing', async () => {
    for (const missing of ['ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET', 'DB']) {
      const saved = env[missing]
      delete env[missing]
      expect((await call('/api/admin/login', { body: good })).status).toBe(503)
      env[missing] = saved
    }
    env.SESSION_SECRET = 'short'
    expect((await call('/api/admin/login', { body: good })).status).toBe(503)
  })

  it('only answers POST', async () => {
    expect((await call('/api/admin/login', { method: 'GET', origin: null })).status).toBe(405)
  })
})

describe('/api/admin/me and logout', () => {
  it('/me is 401 with no cookie, a forged cookie or a cookie signed with another secret', async () => {
    expect((await call('/api/admin/me', { method: 'GET', origin: null })).status).toBe(401)
    expect((await call('/api/admin/me', { method: 'GET', origin: null, cookie: 'gnr_admin=a.b' })).status).toBe(401)
    const other = await call('/api/admin/login', { body: good })
    env.SESSION_SECRET = 'z'.repeat(40)
    expect((await call('/api/admin/me', { method: 'GET', origin: null, cookie: cookieOf(other) })).status).toBe(401)
  })

  it('logout clears the cookie and needs the same origin', async () => {
    const res = await call('/api/admin/logout', { body: '' })
    expect(res.status).toBe(200)
    expect(res.headers.get('Set-Cookie')).toContain('Max-Age=0')
    expect((await call('/api/admin/logout', { body: '', origin: 'https://evil.test' })).status).toBe(403)
  })
})

describe('requireAdmin', () => {
  it('lets a signed-in admin through and answers 401 otherwise; changes also need the origin', async () => {
    const login = await call('/api/admin/login', { body: good })
    const withCookie = (extra = {}) => new Request(`${ORIGIN}/api/admin/x`, { method: 'POST', headers: { Cookie: cookieOf(login), ...extra } })
    expect((await requireAdmin(withCookie(), env)).sub).toBe('owner')
    const noOrigin = await requireAdmin(withCookie(), env, { changes: true })
    expect(noOrigin.status).toBe(403)
    expect((await requireAdmin(withCookie({ Origin: ORIGIN }), env, { changes: true })).sub).toBe('owner')
    const anonymous = await requireAdmin(new Request(`${ORIGIN}/api/admin/x`), env)
    expect(anonymous.status).toBe(401)
  })
})
