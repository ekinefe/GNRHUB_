import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'

const run = (cmd) => spawnSync('node', ['scripts/db.mjs', cmd], { input: '', encoding: 'utf8' })

describe('db helper', () => {
  it.each(['migrate-remote', 'migrate-preview'])('%s refuses to run without a terminal', (cmd) => {
    const r = run(cmd)
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/Refusing a remote change/)
  })

  it('has a first migration', () => {
    expect(readdirSync('db/migrations').filter((f) => f.endsWith('.sql'))[0]).toBe('0000_init.sql')
  })

  it('preview environment binds the dev database, never prod, and holds no secrets', () => {
    const text = readFileSync('wrangler.jsonc', 'utf8')
    const cfg = JSON.parse(text.replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, ''))
    expect(cfg.d1_databases[0].database_name).toBe('gnrdigital-prod')
    const preview = cfg.env.preview
    expect(preview.d1_databases[0].database_name).toBe('gnrdigital-dev')
    expect(preview.d1_databases[0].database_id).not.toBe(cfg.d1_databases[0].database_id)
    expect(preview.assets.binding).toBe('ASSETS')
    expect(JSON.stringify(cfg)).not.toMatch(/secret|api[_-]?key|token|password/i)
  })
})
