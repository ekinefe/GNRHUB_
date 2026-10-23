// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { DATABASE, backupPath } from './db.mjs'

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, ''))

describe('wrangler.jsonc', () => {
  it('binds one D1 database as DB, with migrations in db/migrations', () => {
    expect(config.d1_databases).toHaveLength(1)
    const [db] = config.d1_databases
    expect(db.binding).toBe('DB')
    expect(db.database_name).toBe(DATABASE)
    expect(db.migrations_dir).toBe('db/migrations')
  })

  it('sends only the API, the sitemap and the feed through the Worker first', () => {
    expect(config.assets.run_worker_first).toEqual(['/api/*', '/sitemap.xml', '/blog/feed.xml'])
  })

  it('holds no secret-looking values', () => {
    const bad = []
    const walk = (o, trail = '') => {
      for (const [k, v] of Object.entries(o)) {
        if (v && typeof v === 'object') walk(v, `${trail}${k}.`)
        else if (/(secret|token|password|api[_-]?key)/i.test(k) && v) bad.push(trail + k)
      }
    }
    walk(config)
    expect(bad).toEqual([])
  })
})

describe('migrations', () => {
  it('are numbered files in order with no gaps', () => {
    const files = readdirSync('db/migrations').filter((f) => f.endsWith('.sql')).sort()
    files.forEach((f, i) => expect(f.startsWith(String(i).padStart(4, '0') + '_'), f).toBe(true))
  })
})

describe('exports', () => {
  it('go to the git-ignored backups folder with the database, source and date in the name', () => {
    expect(backupPath('remote', new Date('2026-10-23T08:00:00Z'))).toBe('backups/gnrdigital-remote-2026-10-23.sql')
    expect(readFileSync('../.gitignore', 'utf8')).toMatch(/^backups\/$/m)
  })

  it('are reachable from npm scripts', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    expect(scripts['db:export:remote']).toBe('node scripts/db.mjs export-remote')
    expect(scripts['db:export:local']).toBe('node scripts/db.mjs export-local')
  })
})
