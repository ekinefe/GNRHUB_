// A minimal D1 look-alike over Node's built-in node:sqlite (GNR-24). It applies the
// project's real migrations (db/migrations/*.sql, in name order), so tests prove what
// the database does for injection and ownership rules instead of mocking the query layer.
// Covers the D1 calls the Worker uses: prepare().bind().first/all/run/raw, batch, exec.
// Use it in a test file starting with `// @vitest-environment node`.
import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MIGRATIONS = 'db/migrations' // tests run from frontend/

const normalise = (params) => params.map((p) => (p === undefined ? null : p))

class Statement {
  constructor(db, sql, params = []) {
    this.db = db
    this.sql = sql
    this.params = params
  }
  bind(...params) {
    return new Statement(this.db, this.sql, normalise(params))
  }
  async first(column) {
    const row = this.db.prepare(this.sql).get(...this.params)
    if (row === undefined) return null
    return column ? row[column] ?? null : { ...row }
  }
  async all() {
    const rows = this.db.prepare(this.sql).all(...this.params).map((r) => ({ ...r }))
    return { results: rows, success: true, meta: { changes: 0, rows_read: rows.length } }
  }
  async raw() {
    return this.db.prepare(this.sql).all(...this.params).map((r) => Object.values(r))
  }
  async run() {
    const info = this.db.prepare(this.sql).run(...this.params)
    return { results: [], success: true, meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } }
  }
}

export function createTestD1({ migrationsDir = MIGRATIONS } = {}) {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) db.exec(readFileSync(join(migrationsDir, file), 'utf8'))

  return {
    prepare: (sql) => new Statement(db, sql),
    async batch(statements) {
      const out = []
      db.exec('BEGIN')
      try {
        for (const s of statements) out.push(await s.run())
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
      return out
    },
    async exec(sql) {
      db.exec(sql)
      return { count: 1, duration: 0 }
    },
    close: () => db.close(),
  }
}
