// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createTestD1 } from './testD1.js'

const dirWith = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'testd1-'))
  for (const [name, sql] of Object.entries(files)) writeFileSync(join(dir, name), sql)
  return dir
}

let db
afterEach(() => db?.close())

describe('testD1', () => {
  it('applies the real project migrations', async () => {
    db = createTestD1()
    expect(await db.prepare('SELECT 1 AS one').first('one')).toBe(1)
  })

  it('applies migrations in name order', async () => {
    db = createTestD1({
      migrationsDir: dirWith({
        '0001_b.sql': 'ALTER TABLE t ADD COLUMN note TEXT;',
        '0000_a.sql': 'CREATE TABLE t (id INTEGER PRIMARY KEY, owner TEXT NOT NULL);',
      }),
    })
    const info = await db.prepare('INSERT INTO t (owner, note) VALUES (?, ?)').bind('u1', 'hi').run()
    expect(info.meta.changes).toBe(1)
    expect(await db.prepare('SELECT note FROM t WHERE id = ?').bind(info.meta.last_row_id).first('note')).toBe('hi')
  })

  describe('with a table', () => {
    const setup = () =>
      createTestD1({ migrationsDir: dirWith({ '0000_t.sql': 'CREATE TABLE t (id INTEGER PRIMARY KEY, owner TEXT NOT NULL);' }) })

    it('treats bound values as data, so an injection string matches nothing', async () => {
      db = setup()
      await db.prepare('INSERT INTO t (owner) VALUES (?)').bind('alice').run()
      const { results } = await db.prepare('SELECT * FROM t WHERE owner = ?').bind("x' OR '1'='1").all()
      expect(results).toEqual([])
      expect((await db.prepare('SELECT COUNT(*) AS n FROM t').first()).n).toBe(1)
    })

    it('returns null for no row, and rows from all() and raw()', async () => {
      db = setup()
      expect(await db.prepare('SELECT * FROM t').first()).toBeNull()
      await db.prepare('INSERT INTO t (owner) VALUES (?)').bind('a').run()
      expect((await db.prepare('SELECT owner FROM t').all()).results).toEqual([{ owner: 'a' }])
      expect(await db.prepare('SELECT owner FROM t').raw()).toEqual([['a']])
    })

    it('rolls a batch back when one statement fails', async () => {
      db = setup()
      const ok = db.prepare('INSERT INTO t (owner) VALUES (?)').bind('a')
      const bad = db.prepare('INSERT INTO t (owner) VALUES (?)').bind(null)
      await expect(db.batch([ok, bad])).rejects.toThrow()
      expect((await db.prepare('SELECT COUNT(*) AS n FROM t').first()).n).toBe(0)
    })
  })
})
