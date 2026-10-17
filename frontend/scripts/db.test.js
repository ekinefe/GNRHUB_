import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

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
})
