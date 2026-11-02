// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { analyticsOverview, recordView } from './actions.ts'
import { cleanPath } from './validate.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())
const NOW = Date.UTC(2026, 10, 3, 12)
const DAY = 86_400_000

describe('cleanPath', () => {
  it('accepts plain pages and drops a trailing slash', () => {
    expect(cleanPath({ path: '/' })).toBe('/')
    expect(cleanPath({ path: '/blog/hello/' })).toBe('/blog/hello')
  })
  it('ignores the admin area, the API, short links and odd input', () => {
    for (const path of ['/admin', '/admin/posts', '/api/hit', '/r/cv', '//evil', '/a b', '/x?y=1', 'about', '', 5, null, '/' + 'a'.repeat(200)]) {
      expect(cleanPath({ path })).toBeNull()
    }
    expect(cleanPath(undefined)).toBeNull()
  })
  it('does not treat a page that only starts like a private one as private', () => {
    expect(cleanPath({ path: '/administrators' })).toBe('/administrators')
    expect(cleanPath({ path: '/random' })).toBe('/random')
  })
})

describe('analytics domain', () => {
  it('counts openings per page and day', async () => {
    expect(await recordView(db, { path: '/about' }, NOW, 0)).toBe('counted')
    await recordView(db, { path: '/about' }, NOW, 0)
    await recordView(db, { path: '/' }, NOW, 0)
    await recordView(db, { path: '/about' }, NOW - DAY, 0)
    const o = await analyticsOverview(db, NOW)
    expect(o.total).toBe(4)
    expect(o.days).toHaveLength(30)
    expect(o.days.at(-1)).toEqual({ day: '2026-11-03', views: 3 })
    expect(o.days.at(-2)).toEqual({ day: '2026-11-02', views: 1 })
    expect(o.days[0].views).toBe(0)
    expect(o.top).toEqual([{ path: '/about', views: 3 }, { path: '/', views: 1 }])
  })

  it('ignores what it should not count', async () => {
    expect(await recordView(db, { path: '/admin/posts' }, NOW, 0)).toBe('ignored')
    expect((await analyticsOverview(db, NOW)).total).toBe(0)
  })

  it('stops adding new pages when a day holds too many, but keeps counting known ones', async () => {
    for (let i = 0; i < 200; i++) await recordView(db, { path: `/p${i}` }, NOW, 0)
    expect(await recordView(db, { path: '/one-more' }, NOW, 0)).toBe('ignored')
    expect(await recordView(db, { path: '/p1' }, NOW, 0)).toBe('counted')
  })

  it('removes days older than 90 days when it prunes', async () => {
    await recordView(db, { path: '/old' }, NOW - 120 * DAY, 0)
    await recordView(db, { path: '/new' }, NOW, 1)
    const left = (await db.prepare('SELECT path FROM page_views').all()).results.map((r) => r.path)
    expect(left).toEqual(['/new'])
  })

  it('keeps no visitor data: the table has only day, path and views', async () => {
    const cols = (await db.prepare('PRAGMA table_info(page_views)').all()).results.map((c) => c.name)
    expect(cols).toEqual(['day', 'path', 'views'])
  })
})
