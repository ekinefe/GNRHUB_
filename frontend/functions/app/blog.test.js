// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import worker from '../worker.ts'
import { hashPassword } from '../domain/admin/password.ts'

const ORIGIN = 'https://site.test'
let db, env

beforeEach(async () => {
  db = createTestD1()
  env = {
    ASSETS: { fetch: async () => new Response('x') },
    DB: db,
    ADMIN_USERNAME: 'ekin',
    ADMIN_PASSWORD_HASH: await hashPassword('a long passphrase here', 2000),
    SESSION_SECRET: 'k'.repeat(40),
  }
})
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), env)

const signIn = async () => (await call('/api/admin/login', { method: 'POST', body: { username: 'ekin', password: 'a long passphrase here' } })).headers.get('Set-Cookie').split(';')[0]
const post = (over = {}) => ({ title: 'First note', slug: '', summary: 'Sum', body: 'Body **text**', tags: 'notes', status: 'draft', ...over })
const create = async (cookie, over) => (await call('/api/admin/posts', { method: 'POST', cookie, body: post(over) }))

describe('public posts', () => {
  it('lists and returns only public posts; draft and private look like they do not exist', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'Public one', status: 'public', tags: 'linux,cron' })
    await create(cookie, { title: 'Draft one', status: 'draft' })
    await create(cookie, { title: 'Private one', status: 'private' })

    const list = await (await call('/api/posts', { origin: null })).json()
    expect(list.posts.map((p) => p.slug)).toEqual(['public-one'])
    expect(list.posts[0]).not.toHaveProperty('body')
    expect(list.posts[0].tags).toEqual(['linux', 'cron'])

    expect((await call('/api/posts/public-one', { origin: null })).status).toBe(200)
    expect((await call('/api/posts/draft-one', { origin: null })).status).toBe(404)
    expect((await call('/api/posts/private-one', { origin: null })).status).toBe(404)
    expect((await call('/api/posts/nope', { origin: null })).status).toBe(404)
    expect((await call('/api/posts/%E0%A4%A', { origin: null })).status).toBe(404)
    expect((await call('/api/posts/..%2Fsecret', { origin: null })).status).toBe(404)
  })

  it('filters by tag, newest first, and gives the body only on the single post', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'A', status: 'public', tags: 'x' })
    await create(cookie, { title: 'B', status: 'public', tags: 'y' })
    const all = await (await call('/api/posts', { origin: null })).json()
    expect(all.posts.map((p) => p.slug)).toEqual(['b', 'a'])
    const onlyX = await (await call('/api/posts?tag=x', { origin: null })).json()
    expect(onlyX.posts.map((p) => p.slug)).toEqual(['a'])
    const one = await (await call('/api/posts/a', { origin: null })).json()
    expect(one.post.body).toBe('Body **text**')
  })

  it('says it is unavailable without a database', async () => {
    delete env.DB
    expect((await call('/api/posts', { origin: null })).status).toBe(503)
    expect((await call('/api/posts/x', { origin: null })).status).toBe(503)
  })
})

describe('neighbouring posts', () => {
  it('gives the older and newer public post, skipping drafts and private ones', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'One', status: 'public' })
    await create(cookie, { title: 'Hidden draft', status: 'draft' })
    await create(cookie, { title: 'Two', status: 'public' })
    await create(cookie, { title: 'Hidden private', status: 'private' })
    await create(cookie, { title: 'Three', status: 'public' })
    const get = async (slug) => (await (await call(`/api/posts/${slug}`, { origin: null })).json()).post
    const two = await get('two')
    expect(two.older).toEqual({ slug: 'one', title: 'One' })
    expect(two.newer).toEqual({ slug: 'three', title: 'Three' })
    expect((await get('one')).older).toBeNull()
    expect((await get('three')).newer).toBeNull()
    expect(two).not.toHaveProperty('id')
  })
})

describe('admin posts', () => {
  it('needs a signed-in admin for every route', async () => {
    expect((await call('/api/admin/posts', { origin: null })).status).toBe(401)
    expect((await call('/api/admin/posts/1', { origin: null })).status).toBe(401)
    expect((await call('/api/admin/posts', { method: 'POST', body: post() })).status).toBe(401)
    expect((await call('/api/admin/posts/1', { method: 'POST', body: { action: 'delete' } })).status).toBe(401)
  })

  it('creates, reads, saves and deletes; publishing sets the date once', async () => {
    const cookie = await signIn()
    const created = await create(cookie)
    expect(created.status).toBe(201)
    const { id } = await created.json()

    let one = (await (await call(`/api/admin/posts/${id}`, { cookie, origin: null })).json()).post
    expect(one).toMatchObject({ title: 'First note', status: 'draft', publishedAt: null, tags: ['notes'], body: 'Body **text**' })

    expect((await call(`/api/admin/posts/${id}`, { method: 'POST', cookie, body: { action: 'save', ...post({ status: 'public', title: 'First note v2', slug: 'first-note' }) } })).status).toBe(200)
    one = (await (await call(`/api/admin/posts/${id}`, { cookie, origin: null })).json()).post
    expect(one.status).toBe('public')
    expect(one.publishedAt).not.toBeNull()
    const firstDate = one.publishedAt

    await call(`/api/admin/posts/${id}`, { method: 'POST', cookie, body: { action: 'save', ...post({ status: 'private', slug: 'first-note' }) } })
    await call(`/api/admin/posts/${id}`, { method: 'POST', cookie, body: { action: 'save', ...post({ status: 'public', slug: 'first-note' }) } })
    one = (await (await call(`/api/admin/posts/${id}`, { cookie, origin: null })).json()).post
    expect(one.publishedAt).toBe(firstDate)

    const list = await (await call('/api/admin/posts', { cookie, origin: null })).json()
    expect(list.posts).toHaveLength(1)
    expect(list.posts[0]).not.toHaveProperty('body')

    expect((await call(`/api/admin/posts/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(200)
    expect((await call(`/api/admin/posts/${id}`, { cookie, origin: null })).status).toBe(404)
  })

  it('refuses a duplicate address with 409, and bad fields with 400', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'Same title' })
    const dup = await create(cookie, { title: 'Same title' })
    expect(dup.status).toBe(409)
    expect((await dup.json()).errors.slug).toMatch(/already used/)
    const bad = await create(cookie, { title: '', status: 'nope' })
    expect(bad.status).toBe(400)
    expect(Object.keys((await bad.json()).errors).sort()).toEqual(['slug', 'status', 'title'])
  })

  it('needs the same origin for changes; 404 for a missing or non-numeric id; 400 for an unknown action', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/posts', { method: 'POST', cookie, origin: 'https://evil.test', body: post() })).status).toBe(403)
    expect((await call('/api/admin/posts/999', { cookie, origin: null })).status).toBe(404)
    expect((await call('/api/admin/posts/abc', { cookie, origin: null })).status).toBe(404)
    expect((await call('/api/admin/posts/999', { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(404)
    expect((await call('/api/admin/posts/1', { method: 'POST', cookie, body: { action: 'explode' } })).status).toBe(400)
  })

  it('stores hostile text as text, bound as values', async () => {
    const cookie = await signIn()
    const res = await create(cookie, { title: "x'); DROP TABLE posts;--", body: '<script>alert(1)</script>' })
    expect(res.status).toBe(201)
    const { id } = await res.json()
    const one = (await (await call(`/api/admin/posts/${id}`, { cookie, origin: null })).json()).post
    expect(one.title).toBe("x'); DROP TABLE posts;--")
    expect(one.body).toBe('<script>alert(1)</script>')
  })
})

describe('sitemap.xml', () => {
  it('lists the fixed pages and public posts only, as XML', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'Public one', status: 'public' })
    await create(cookie, { title: 'Draft one', status: 'draft' })
    await create(cookie, { title: 'Private one', status: 'private' })
    const res = await call('/sitemap.xml', { origin: null })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/xml')
    const xml = await res.text()
    expect(xml).toContain('<loc>https://site.test/</loc>')
    expect(xml).toContain('<loc>https://site.test/blog</loc>')
    expect(xml).toContain('<loc>https://site.test/blog/public-one</loc>')
    expect(xml).not.toContain('draft-one')
    expect(xml).not.toContain('private-one')
    expect(xml).not.toContain('/admin')
  })

  it('still serves the fixed pages when there is no database', async () => {
    delete env.DB
    const xml = await (await call('/sitemap.xml', { origin: null })).text()
    expect(xml).toContain('<loc>https://site.test/about</loc>')
  })
})

describe('RSS feed', () => {
  it('lists public posts only, newest first, as RSS 2.0 with escaped text and a self link', async () => {
    const cookie = await signIn()
    await create(cookie, { title: 'Old & first <post>', summary: 'Tom & "Jerry"', status: 'public', tags: 'linux,cron' })
    await create(cookie, { title: 'Second', status: 'public', tags: '' })
    await create(cookie, { title: 'Draft one', status: 'draft' })
    await create(cookie, { title: 'Private one', status: 'private' })
    const res = await call('/blog/feed.xml', { origin: null })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/rss+xml')
    const xml = await res.text()
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<atom:link href="https://site.test/blog/feed.xml" rel="self"')
    expect(xml).toContain('<title>Old &amp; first &lt;post&gt;</title>')
    expect(xml).toContain('<description>Tom &amp; &quot;Jerry&quot;</description>')
    expect(xml).toContain('<link>https://site.test/blog/old-first-post</link>')
    expect(xml).toContain('<category>cron</category>')
    expect(xml.indexOf('Second')).toBeLessThan(xml.indexOf('Old &amp;'))
    expect(xml).not.toContain('Draft one')
    expect(xml).not.toContain('Private one')
  })

  it('answers 503 without a database, never an empty feed', async () => {
    delete env.DB
    expect((await call('/blog/feed.xml', { origin: null })).status).toBe(503)
  })
})
