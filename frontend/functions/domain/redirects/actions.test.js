// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { makeRedirect } from '../../_test/factories.js'
import { adminRedirect, adminRedirects, createRedirect, deleteRedirect, followRedirect, saveRedirect } from './actions.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

describe('redirects domain', () => {
  it('follows a link and counts the visit', async () => {
    const made = await createRedirect(db, makeRedirect())
    expect(await followRedirect(db, 'cv')).toEqual({ target: 'https://example.com/cv.pdf', permanent: false })
    await followRedirect(db, 'cv')
    expect((await adminRedirect(db, made.id)).clicks).toBe(2)
    expect(await followRedirect(db, 'nope')).toBeNull()
  })

  it('answers with a reason instead of throwing', async () => {
    expect(await createRedirect(db, makeRedirect({ target: 'http://x.test' }))).toMatchObject({ ok: false, reason: 'invalid' })
    await createRedirect(db, makeRedirect())
    expect(await createRedirect(db, makeRedirect())).toEqual({ ok: false, reason: 'slug-taken' })
    expect(await saveRedirect(db, 999, makeRedirect())).toEqual({ ok: false, reason: 'not-found' })
  })

  it('changes the target, lists by name and deletes', async () => {
    const a = await createRedirect(db, makeRedirect({ slug: 'b' }))
    await createRedirect(db, makeRedirect({ slug: 'a' }))
    expect(await saveRedirect(db, a.id, makeRedirect({ slug: 'b', target: '/about', permanent: true }))).toEqual({ ok: true })
    const list = await adminRedirects(db)
    expect(list.map((r) => r.slug)).toEqual(['a', 'b'])
    expect(list[1]).toMatchObject({ target: '/about', permanent: true })
    expect(await deleteRedirect(db, a.id)).toBe(true)
    expect(await deleteRedirect(db, a.id)).toBe(false)
  })
})
