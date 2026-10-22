// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { isDue, runDue, JOBS } from './dispatcher.ts'

let db
beforeEach(() => { db = createTestD1(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}) })
afterEach(() => { db.close(); vi.restoreAllMocks() })

const at = (iso) => Date.parse(iso)
const runs = async () => (await db.prepare('SELECT job, ok, error FROM cron_runs ORDER BY job').all()).results

describe('isDue', () => {
  it('every-trigger always, hourly in the first slot, daily at 03:00 UTC', () => {
    expect(isDue('every-trigger', new Date('2026-01-01T10:45:00Z'))).toBe(true)
    expect(isDue('hourly', new Date('2026-01-01T10:00:00Z'))).toBe(true)
    expect(isDue('hourly', new Date('2026-01-01T10:15:00Z'))).toBe(false)
    expect(isDue('daily', new Date('2026-01-01T03:00:00Z'))).toBe(true)
    expect(isDue('daily', new Date('2026-01-01T04:00:00Z'))).toBe(false)
    expect(isDue('daily', new Date('2026-01-01T03:30:00Z'))).toBe(false)
  })
})

describe('runDue', () => {
  it('runs only the due jobs and records each outcome', async () => {
    const a = { name: 'a', cadence: 'every-trigger', run: vi.fn(async () => {}) }
    const b = { name: 'b', cadence: 'daily', run: vi.fn(async () => {}) }
    await runDue({ DB: db }, at('2026-01-01T10:15:00Z'), [a, b])
    expect(a.run).toHaveBeenCalled()
    expect(b.run).not.toHaveBeenCalled()
    expect(await runs()).toEqual([{ job: 'a', ok: 1, error: null }])
  })

  it('a failing job is recorded and does not stop the others', async () => {
    const bad = { name: 'bad', cadence: 'every-trigger', run: async () => { throw new Error('nope') } }
    const good = { name: 'good', cadence: 'every-trigger', run: vi.fn(async () => {}) }
    await runDue({ DB: db }, at('2026-01-01T10:00:00Z'), [bad, good])
    expect(good.run).toHaveBeenCalled()
    expect(await runs()).toEqual([{ job: 'bad', ok: 0, error: 'nope' }, { job: 'good', ok: 1, error: null }])
  })

  it('times a stuck job out', async () => {
    const stuck = { name: 'stuck', cadence: 'every-trigger', timeoutMs: 10, run: () => new Promise(() => {}) }
    await runDue({ DB: db }, at('2026-01-01T10:00:00Z'), [stuck])
    expect((await runs())[0].error).toMatch(/timed out/)
  })

  it('keeps one row per job across runs', async () => {
    const a = { name: 'a', cadence: 'every-trigger', run: async () => {} }
    await runDue({ DB: db }, at('2026-01-01T10:00:00Z'), [a])
    await runDue({ DB: db }, at('2026-01-01T10:15:00Z'), [a])
    expect(await runs()).toHaveLength(1)
  })
})

describe('retention jobs', () => {
  it('delete old rate-limit rows and old audit rows, keep recent ones', async () => {
    const now = at('2026-01-01T03:00:00Z')
    const bucket = Math.floor(now / 60_000)
    await db.prepare('INSERT INTO rate_limit_hits (key, bucket) VALUES (?, ?)').bind('old', bucket - 60).run()
    await db.prepare('INSERT INTO rate_limit_hits (key, bucket) VALUES (?, ?)').bind('new', bucket).run()
    const sec = Math.floor(now / 1000)
    await db.prepare("INSERT INTO audit_log (action, created_at) VALUES ('old', ?)").bind(sec - 200 * 86400).run()
    await db.prepare("INSERT INTO audit_log (action, created_at) VALUES ('new', ?)").bind(sec - 86400).run()

    await runDue({ DB: db }, now, JOBS)
    await runDue({ DB: db }, now, JOBS) // idempotent

    expect((await db.prepare('SELECT key FROM rate_limit_hits').all()).results).toEqual([{ key: 'new' }])
    expect((await db.prepare('SELECT action FROM audit_log').all()).results).toEqual([{ action: 'new' }])
  })
})
