// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getTableName, is } from 'drizzle-orm'
import { SQLiteTable } from 'drizzle-orm/sqlite-core'
import * as schema from '../../db/schema.ts'
import { createTestD1 } from '../_test/testD1.js'
import { getPreferences, setPreferences } from './userData.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

const addUser = (id, email) =>
  db.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)').bind(id, id, email).run()

describe('schema vs migrations', () => {
  it('a fresh database has every table declared in db/schema.ts', async () => {
    const declared = Object.values(schema).filter((t) => is(t, SQLiteTable)).map(getTableName).sort()
    const { results } = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all()
    const actual = results.map((r) => r.name).sort()
    expect(actual).toEqual(declared)
    expect(declared).toEqual(expect.arrayContaining(['users', 'sessions', 'accounts', 'verifications', 'admin_users', 'modules', 'module_access', 'rate_limit_hits', 'audit_log', 'user_preferences', 'consents']))
  })
})

describe('constraints', () => {
  it('rejects a duplicate email and a session for a missing user', async () => {
    await addUser('u1', 'a@x.test')
    await expect(addUser('u2', 'a@x.test')).rejects.toThrow()
    await expect(
      db.prepare("INSERT INTO sessions (id, user_id, token, expires_at) VALUES ('s', 'ghost', 't', 1)").run(),
    ).rejects.toThrow()
  })

  it('deleting a user removes their sessions, preferences and consents', async () => {
    await addUser('u1', 'a@x.test')
    await db.prepare("INSERT INTO sessions (id, user_id, token, expires_at) VALUES ('s', 'u1', 't', 1)").run()
    await setPreferences(db, 'u1', { theme: 'dark' })
    await db.prepare("INSERT INTO consents (user_id, kind, version, granted) VALUES ('u1', 'privacy', '1', 1)").run()
    await db.prepare("DELETE FROM users WHERE id = 'u1'").run()
    for (const t of ['sessions', 'user_preferences', 'consents']) {
      expect(await db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first('n')).toBe(0)
    }
  })

  it('admin rights live in admin_users only; users has no role column', async () => {
    const cols = (await db.prepare("SELECT name FROM pragma_table_info('users')").all()).results.map((c) => c.name)
    expect(cols).not.toContain('role')
    await expect(db.prepare("INSERT INTO admin_users (user_id) VALUES ('ghost')").run()).rejects.toThrow()
  })

  it('module grants are unique per user and module', async () => {
    await addUser('u1', 'a@x.test')
    await db.prepare("INSERT INTO modules (key) VALUES ('gym')").run()
    await db.prepare("INSERT INTO module_access (user_id, module_key) VALUES ('u1', 'gym')").run()
    await expect(db.prepare("INSERT INTO module_access (user_id, module_key) VALUES ('u1', 'gym')").run()).rejects.toThrow()
  })
})

describe('ownership (preferences)', () => {
  it("one user cannot read or overwrite another user's preferences", async () => {
    await addUser('alice', 'a@x.test')
    await addUser('bob', 'b@x.test')
    await setPreferences(db, 'alice', { theme: 'dark', data: { fx: true } })

    expect(await getPreferences(db, 'bob')).toBeNull()
    await setPreferences(db, 'bob', { theme: 'light' })

    expect(await getPreferences(db, 'alice')).toEqual({ theme: 'dark', language: null, data: { fx: true } })
    expect((await getPreferences(db, 'bob')).theme).toBe('light')
  })

  it('treats a hostile user id as data', async () => {
    await addUser('alice', 'a@x.test')
    await setPreferences(db, 'alice', { theme: 'dark' })
    expect(await getPreferences(db, "alice' OR '1'='1")).toBeNull()
  })
})
