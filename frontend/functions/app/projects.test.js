// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import worker from '../worker.ts'
import { hashPassword } from '../domain/admin/password.ts'

const ORIGIN = 'https://site.test'
let db, env
beforeEach(async () => {
  db = createTestD1()
  env = { ASSETS: { fetch: async () => new Response('x') }, DB: db, ADMIN_USERNAME: 'ekin', ADMIN_PASSWORD_HASH: await hashPassword('a long passphrase here', 2000), SESSION_SECRET: 'k'.repeat(40) }
})
afterEach(() => db.close())

const call = (path, { method = 'GET', body, origin = ORIGIN, cookie, withEnv = env } = {}) =>
  worker.fetch(new Request(`${ORIGIN}${path}`, {
    method,
    headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), withEnv)
const signIn = async () => (await call('/api/admin/login', { method: 'POST', body: { username: 'ekin', password: 'a long passphrase here' } })).headers.get('Set-Cookie').split(';')[0]
const project = (over = {}) => ({ name: 'Alpha', slug: '', grp: 'project', kind: 'Web app', summary: 'The first.', tech: 'React, D1', points: 'One\nTwo', status: 'live', repo: 'https://github.com/x/alpha', url: '', image: '', imageAlt: '', caseStudy: '', learned: '', featured: false, inAbout: false, sort: 100, ...over })
const create = (cookie, over) => call('/api/admin/projects', { method: 'POST', cookie, body: project(over) })

describe('public projects', () => {
  it('is empty before anything is added, also without a database', async () => {
    expect(await (await call('/api/projects', { origin: null })).json()).toEqual({ projects: [], managed: false })
    expect(await (await call('/api/projects', { origin: null, withEnv: { ASSETS: env.ASSETS } })).json()).toEqual({ projects: [], managed: false })
  })

  it('lists projects in the shape the pages use, ordered by sort then id, with a short cache', async () => {
    const cookie = await signIn()
    await create(cookie, { name: 'Second', sort: 20 })
    await create(cookie, { name: 'First', sort: 10, featured: true, inAbout: true, image: '/projects/first.png', imageAlt: 'Shot', learned: 'Lots', caseStudy: '/colophon' })
    await create(cookie, { name: 'A tool', grp: 'tool', status: 'soon', repo: '' })
    const res = await call('/api/projects', { origin: null })
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=30')
    const { projects } = await res.json()
    expect(projects.map((p) => p.id)).toEqual(['first', 'second', 'a-tool'])
    expect(projects[0]).toEqual({ id: 'first', group: 'project', name: 'First', kind: 'Web app', summary: 'The first.', tech: ['React', 'D1'], points: ['One', 'Two'], status: 'live', repo: 'https://github.com/x/alpha', url: null, image: '/projects/first.png', imageAlt: 'Shot', caseStudy: '/colophon', learned: 'Lots', featured: true, inAbout: true })
    expect(projects[1]).not.toHaveProperty('image')
    expect(projects[2].group).toBe('tool')
  })
})

describe('hiding a project (GNR-159)', () => {
  it('keeps a hidden project out of the public list but in the admin list, and shows it again when switched back', async () => {
    const cookie = await signIn()
    await create(cookie, { name: 'Shown' })
    const { id } = await (await create(cookie, { name: 'Secret', visible: false })).json()
    expect((await (await call('/api/projects', { origin: null })).json()).projects.map((p) => p.id)).toEqual(['shown'])
    const admin = await (await call('/api/admin/projects', { cookie, origin: null })).json()
    expect(admin.projects.map((p) => [p.id, p.visible]).sort()).toEqual([['secret', false], ['shown', true]])
    await call(`/api/admin/projects/${id}`, { method: 'POST', cookie, body: { ...project({ name: 'Secret', visible: true }), action: 'save', slug: 'secret' } })
    expect((await (await call('/api/projects', { origin: null })).json()).projects.map((p) => p.id).sort()).toEqual(['secret', 'shown'])
  })

  it('says "managed" once any project exists, even if all are hidden, so the pages do not fall back to the built-in list', async () => {
    const cookie = await signIn()
    await create(cookie, { name: 'Only', visible: false })
    expect(await (await call('/api/projects', { origin: null })).json()).toEqual({ projects: [], managed: true })
  })

  it('treats a missing visible field as visible', async () => {
    const cookie = await signIn()
    const body = project({ name: 'Plain' }); delete body.visible
    await call('/api/admin/projects', { method: 'POST', cookie, body })
    expect((await (await call('/api/projects', { origin: null })).json()).projects).toHaveLength(1)
  })
})

describe('admin projects', () => {
  it('needs a session for every route, and the same origin for changes', async () => {
    expect((await call('/api/admin/projects', { origin: null })).status).toBe(401)
    expect((await call('/api/admin/projects/1', { origin: null })).status).toBe(401)
    expect((await call('/api/admin/projects', { method: 'POST', body: project() })).status).toBe(401)
    const cookie = await signIn()
    expect((await call('/api/admin/projects', { method: 'POST', cookie, body: project(), origin: 'https://evil.test' })).status).toBe(403)
  })

  it('creates, reads, edits and deletes a project', async () => {
    const cookie = await signIn()
    const made = await create(cookie)
    expect(made.status).toBe(201)
    const { id } = await made.json()
    const one = await (await call(`/api/admin/projects/${id}`, { cookie, origin: null })).json()
    expect(one.project).toMatchObject({ dbId: id, id: 'alpha', name: 'Alpha', sort: 100 })
    expect((await call(`/api/admin/projects/${id}`, { method: 'POST', cookie, body: { ...project({ name: 'Alpha 2', sort: 7 }), action: 'save', slug: 'alpha' } })).status).toBe(200)
    const list = await (await call('/api/admin/projects', { cookie, origin: null })).json()
    expect(list.projects).toHaveLength(1)
    expect(list.projects[0]).toMatchObject({ name: 'Alpha 2', sort: 7 })
    expect((await call(`/api/admin/projects/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(200)
    expect((await call(`/api/admin/projects/${id}`, { cookie, origin: null })).status).toBe(404)
    expect((await call(`/api/admin/projects/${id}`, { method: 'POST', cookie, body: { action: 'delete' } })).status).toBe(404)
  })

  it('rejects bad input with a message per field, and a repeated address with 409', async () => {
    const cookie = await signIn()
    const bad = await create(cookie, { name: '', url: 'javascript:alert(1)' })
    expect(bad.status).toBe(400)
    expect(Object.keys((await bad.json()).errors)).toEqual(expect.arrayContaining(['name', 'url']))
    await create(cookie)
    const again = await create(cookie)
    expect(again.status).toBe(409)
    expect((await again.json()).errors.slug).toMatch(/already used/)
  })

  it('answers 404 for a bad id, 400 for an unknown action, 503 without a database', async () => {
    const cookie = await signIn()
    expect((await call('/api/admin/projects/abc', { cookie, origin: null })).status).toBe(404)
    expect((await call('/api/admin/projects/1', { method: 'POST', cookie, body: { action: 'explode' } })).status).toBe(400)
    const noDb = { ...env, DB: undefined }
    expect((await call('/api/admin/projects', { cookie, origin: null, withEnv: noDb })).status).toBe(503)
  })

  it('stores hostile text as plain text: it comes back unchanged and never as markup the server interprets', async () => {
    const cookie = await signIn()
    await create(cookie, { name: "Robert'); DROP TABLE projects;--", summary: '<img src=x onerror=alert(1)>' })
    const { projects } = await (await call('/api/projects', { origin: null })).json()
    expect(projects[0].name).toBe("Robert'); DROP TABLE projects;--")
    expect(projects[0].summary).toBe('<img src=x onerror=alert(1)>')
  })
})
