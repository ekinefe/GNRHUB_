// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { adminPost, adminPosts, createPost, deletePost, postOverview, publicPost, publicPosts, savePost } from './actions.ts'

const input = (over = {}) => ({ title: 'First note', slug: '', summary: 'Short.', body: 'Text', tags: 'Linux, cron', status: 'public', ...over })
let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

describe('posts domain', () => {
  it('shows visitors only public posts', async () => {
    await createPost(db, input({ title: 'Open', status: 'public' }))
    await createPost(db, input({ title: 'Hidden', status: 'draft' }))
    await createPost(db, input({ title: 'Mine', status: 'private' }))
    expect((await publicPosts(db)).map((p) => p.title)).toEqual(['Open'])
    expect(await publicPost(db, 'hidden')).toBeNull()
    expect(await publicPost(db, 'mine')).toBeNull()
    expect((await adminPosts(db)).length).toBe(3)
  })

  it('filters by tag and sends tags as an array', async () => {
    await createPost(db, input({ title: 'A', tags: 'linux' }))
    await createPost(db, input({ title: 'B', tags: 'react' }))
    expect((await publicPosts(db, 'LINUX')).map((p) => p.title)).toEqual(['A'])
    expect((await publicPosts(db))[0].tags).toBeInstanceOf(Array)
  })

  it('keeps the first publish date when a post goes back to draft and is published again', async () => {
    const made = await createPost(db, input())
    const first = (await adminPost(db, made.id)).publishedAt
    expect(first).toBeTruthy()
    await savePost(db, made.id, input({ status: 'draft', slug: 'first-note' }))
    await savePost(db, made.id, input({ status: 'public', slug: 'first-note' }))
    expect((await adminPost(db, made.id)).publishedAt).toBe(first)
    const draft = await createPost(db, input({ title: 'Later', status: 'draft' }))
    expect((await adminPost(db, draft.id)).publishedAt).toBeNull()
  })

  it('answers with a reason instead of throwing', async () => {
    expect(await createPost(db, input({ title: '' }))).toMatchObject({ ok: false, reason: 'invalid' })
    await createPost(db, input())
    expect(await createPost(db, input())).toEqual({ ok: false, reason: 'slug-taken' })
    expect(await savePost(db, 999, input())).toEqual({ ok: false, reason: 'not-found' })
  })

  it('counts by status for the overview and deletes', async () => {
    const a = await createPost(db, input({ title: 'A' }))
    await createPost(db, input({ title: 'B', status: 'draft' }))
    expect((await postOverview(db)).counts).toEqual({ draft: 1, private: 0, public: 1 })
    expect(await deletePost(db, a.id)).toBe(true)
    expect(await deletePost(db, a.id)).toBe(false)
  })
})
