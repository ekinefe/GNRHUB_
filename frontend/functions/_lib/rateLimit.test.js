// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { rateLimit, hashIp } from './rateLimit.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

const req = (ip = '203.0.113.7') => new Request('https://x.test/api/thing', { method: 'POST', headers: { 'CF-Connecting-IP': ip } })
const opts = { route: '/api/thing', limit: 3, now: 1_700_000_000_000, random: () => 0.5 }

describe('rateLimit', () => {
  it('allows up to the limit, then 429 with Retry-After', async () => {
    const env = { DB: db, RATE_LIMIT_SALT: 's' }
    for (let i = 0; i < 3; i++) expect(await rateLimit(req(), env, opts)).toBeNull()
    const res = await rateLimit(req(), env, opts)
    expect(res.status).toBe(429)
    const retry = Number(res.headers.get('Retry-After'))
    expect(retry).toBeGreaterThan(0)
    expect(retry).toBeLessThanOrEqual(60)
  })

  it('counts each caller and each minute separately', async () => {
    const env = { DB: db, RATE_LIMIT_SALT: 's' }
    for (let i = 0; i < 3; i++) await rateLimit(req('1.1.1.1'), env, opts)
    expect(await rateLimit(req('2.2.2.2'), env, opts)).toBeNull()
    expect(await rateLimit(req('1.1.1.1'), env, { ...opts, now: opts.now + 60_000 })).toBeNull()
  })

  it('never stores the raw IP', async () => {
    const env = { DB: db, RATE_LIMIT_SALT: 's' }
    await rateLimit(req('198.51.100.9'), env, opts)
    const { results } = await db.prepare('SELECT key FROM rate_limit_hits').all()
    expect(results).toHaveLength(1)
    expect(results[0].key).not.toContain('198.51.100.9')
    expect(results[0].key).toBe(`/api/thing:${await hashIp('198.51.100.9', 's')}`)
  })

  it('hashes differently with a different salt', async () => {
    expect(await hashIp('1.1.1.1', 'a')).not.toBe(await hashIp('1.1.1.1', 'b'))
  })

  it('fails open when the counter cannot be written', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken = { prepare: () => { throw new Error('d1 down') } }
    expect(await rateLimit(req(), { DB: broken, RATE_LIMIT_SALT: 's' }, opts)).toBeNull()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('is off without a salt or a database', async () => {
    expect(await rateLimit(req(), { DB: db }, opts)).toBeNull()
    expect(await rateLimit(req(), { RATE_LIMIT_SALT: 's' }, opts)).toBeNull()
    expect((await db.prepare('SELECT COUNT(*) AS n FROM rate_limit_hits').first('n'))).toBe(0)
  })

  it('sweeps old rows on a lucky request', async () => {
    const env = { DB: db, RATE_LIMIT_SALT: 's' }
    await rateLimit(req(), env, opts)
    await rateLimit(req(), env, { ...opts, now: opts.now + 3600_000, random: () => 0 })
    expect((await db.prepare('SELECT COUNT(*) AS n FROM rate_limit_hits').first('n'))).toBe(1)
  })
})
