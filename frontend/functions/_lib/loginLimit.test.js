// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { clientKey, lockedFor, recordFailure, PER_CLIENT_LIMIT, GLOBAL_LIMIT, WINDOW_SECONDS } from './loginLimit.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())
const now = 1_800_000_000_000

describe('loginLimit', () => {
  it('locks one client after its limit of failures, not before', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT - 1; i++) await recordFailure(db, 'a', now)
    expect(await lockedFor(db, 'a', now)).toBe(0)
    await recordFailure(db, 'a', now)
    const wait = await lockedFor(db, 'a', now)
    expect(wait).toBeGreaterThan(0)
    expect(wait).toBeLessThanOrEqual(WINDOW_SECONDS)
    expect(await lockedFor(db, 'b', now)).toBe(0)
  })

  it('locks everyone when the total across clients is reached', async () => {
    for (let i = 0; i < GLOBAL_LIMIT; i++) await recordFailure(db, `c${i}`, now)
    expect(await lockedFor(db, 'brand-new-client', now)).toBeGreaterThan(0)
  })

  it('opens again in the next window and sweeps old rows', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT; i++) await recordFailure(db, 'a', now)
    const later = now + WINDOW_SECONDS * 1000
    expect(await lockedFor(db, 'a', later)).toBe(0)
    await recordFailure(db, 'x', now + WINDOW_SECONDS * 5000)
    const rows = await db.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE bucket < ?').bind(Math.floor((now + WINDOW_SECONDS * 5000) / 1000 / WINDOW_SECONDS) - 3).first('n')
    expect(rows).toBe(0)
  })

  it('stores a keyed hash, never the address', async () => {
    const req = new Request('https://x.test', { headers: { 'CF-Connecting-IP': '198.51.100.7' } })
    const key = await clientKey(req, 's'.repeat(40))
    expect(key).toMatch(/^[0-9a-f]{32}$/)
    expect(key).not.toContain('198')
    expect(await clientKey(req, 't'.repeat(40))).not.toBe(key)
    await recordFailure(db, key, now)
    const { results } = await db.prepare('SELECT key FROM login_attempts').all()
    expect(JSON.stringify(results)).not.toContain('198.51.100.7')
  })
})
