// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { clientKey, hourlyLimit } from './hourlyLimit.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())
const NOW = Date.UTC(2026, 10, 3, 10, 30)

describe('hourlyLimit', () => {
  it('locks a client after its allowance and tells how long to wait', async () => {
    const limit = hourlyLimit('feedback_hits', 2, 10)
    expect(await limit.lockedFor(db, 'a', NOW)).toBe(0)
    await limit.record(db, 'a', NOW)
    await limit.record(db, 'a', NOW)
    expect(await limit.lockedFor(db, 'a', NOW)).toBe(30 * 60)
    expect(await limit.lockedFor(db, 'b', NOW)).toBe(0)
  })
  it('locks everyone when the overall allowance is used, and frees them in the next hour', async () => {
    const limit = hourlyLimit('feedback_hits', 5, 2)
    await limit.record(db, 'a', NOW)
    await limit.record(db, 'b', NOW)
    expect(await limit.lockedFor(db, 'c', NOW)).toBeGreaterThan(0)
    expect(await limit.lockedFor(db, 'c', NOW + 3_600_000)).toBe(0)
  })
  it('refuses a table it has no statements for', () => {
    expect(() => hourlyLimit('x; DROP TABLE y', 1, 1)).toThrow('Unknown table')
  })
  it('makes a key from the address without storing it, different per purpose', async () => {
    const req = new Request('https://x.test', { headers: { 'CF-Connecting-IP': '203.0.113.9' } })
    const a = await clientKey(req, 's', 'feedback')
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(a).not.toContain('203')
    expect(await clientKey(req, 's', 'contact')).not.toBe(a)
  })
})
