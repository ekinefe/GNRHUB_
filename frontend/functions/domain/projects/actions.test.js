// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { makeProject } from '../../_test/factories.js'
import { adminProject, adminProjects, createProject, deleteProject, publicProjects, saveProject } from './actions.ts'

// No Request, no Response, no worker: the domain is used the way app/ uses it.
const input = makeProject
let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

describe('projects domain', () => {
  it('is unmanaged and empty without a database or rows', async () => {
    expect(await publicProjects(null)).toEqual({ projects: [], managed: false })
    expect(await publicProjects(db)).toEqual({ projects: [], managed: false })
  })

  it('creates, reads and changes a project', async () => {
    const made = await createProject(db, input())
    expect(made.ok).toBe(true)
    const one = await adminProject(db, made.id)
    expect(one).toMatchObject({ id: 'alpha', name: 'Alpha', tech: ['React', 'D1'], visible: true, dbId: made.id })
    expect(await saveProject(db, made.id, input({ name: 'Alpha 2', slug: 'alpha' }))).toEqual({ ok: true })
    expect((await adminProjects(db))[0].name).toBe('Alpha 2')
  })

  it('answers with a reason instead of throwing', async () => {
    expect(await createProject(db, input({ name: '' }))).toMatchObject({ ok: false, reason: 'invalid' })
    await createProject(db, input())
    expect(await createProject(db, input())).toEqual({ ok: false, reason: 'slug-taken' })
    expect(await saveProject(db, 999, input())).toEqual({ ok: false, reason: 'not-found' })
  })

  it('hides a project from the public list but keeps it managed', async () => {
    const made = await createProject(db, input({ visible: false }))
    expect(await publicProjects(db)).toEqual({ projects: [], managed: true })
    expect(await deleteProject(db, made.id)).toBe(true)
    expect(await deleteProject(db, made.id)).toBe(false)
  })
})
