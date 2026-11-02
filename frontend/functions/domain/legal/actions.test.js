// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { adminLegal, publicLegal, saveLegal } from './actions.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())
const text = (over = {}) => ({ summary: 'A personal site. It keeps almost nothing about you.', body: '# Privacy\n\n' + 'Plain text about what is kept. '.repeat(6), ...over })

describe('legal domain', () => {
  it('has nothing public until a version is saved', async () => {
    expect(await publicLegal(db, 'privacy')).toBeNull()
    expect((await adminLegal(db, 'privacy')).current).toBeNull()
  })

  it('numbers versions per document and shows the newest', async () => {
    expect(await saveLegal(db, 'privacy', text())).toEqual({ ok: true, version: 1, unchanged: false })
    expect(await saveLegal(db, 'privacy', text({ summary: 'A personal site. Almost nothing is kept.' }))).toEqual({ ok: true, version: 2, unchanged: false })
    expect(await saveLegal(db, 'terms', text())).toEqual({ ok: true, version: 1, unchanged: false })
    expect((await publicLegal(db, 'privacy')).version).toBe(2)
    expect((await publicLegal(db, 'terms')).version).toBe(1)
  })

  it('keeps old versions readable and lists them newest first', async () => {
    await saveLegal(db, 'privacy', text())
    await saveLegal(db, 'privacy', text({ summary: 'A changed summary for the second version.' }))
    const old = await adminLegal(db, 'privacy', 1)
    expect(old.current.summary).toBe('A personal site. It keeps almost nothing about you.')
    expect(old.versions.map((v) => v.version)).toEqual([2, 1])
    expect((await adminLegal(db, 'privacy', 9)).current).toBeNull()
  })

  it('adds no version when the text did not change', async () => {
    await saveLegal(db, 'terms', text())
    expect(await saveLegal(db, 'terms', text())).toEqual({ ok: true, version: 1, unchanged: true })
    expect((await adminLegal(db, 'terms')).versions).toHaveLength(1)
  })

  it('asks for a summary and a body, with a plain message each', async () => {
    expect(await saveLegal(db, 'terms', { summary: 'short', body: 'short' })).toEqual({
      ok: false, reason: 'invalid',
      errors: { summary: 'Write a plain-language summary of at least 20 characters.', body: 'Write at least 100 characters.' },
    })
    expect(await saveLegal(db, 'terms', null)).toMatchObject({ ok: false })
  })
})
