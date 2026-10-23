// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import worker from '../../worker.ts'

const ASSETS = { fetch: async () => new Response('x') }
const get = (env) => worker.fetch(new Request('https://site.test/api/status'), { ASSETS, ...env })
afterEach(() => vi.restoreAllMocks())

describe('GET /api/status', () => {
  it('says ok when the database answers', async () => {
    const db = createTestD1()
    const res = await get({ DB: db })
    db.close()
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toMatch(/no-store/)
    expect(await res.json()).toEqual({ ok: true, db: 'ok' })
  })

  it('is still ok (and says so) before the database exists', async () => {
    const res = await get({})
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, db: 'missing' })
  })

  it('answers 503 when the database is bound but fails, and leaks nothing about why', async () => {
    const broken = { prepare: () => { throw new Error('D1_ERROR: secret detail') } }
    const res = await get({ DB: broken })
    expect(res.status).toBe(503)
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ ok: false, db: 'error' })
    expect(text).not.toMatch(/secret detail/)
  })
})
