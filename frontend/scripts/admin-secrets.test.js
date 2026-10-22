// @vitest-environment node
/* global process */
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { newSessionSecret } from './admin-secrets.mjs'
import { verifyPassword } from '../functions/_lib/password.ts'

const run = (args, input) => spawnSync(process.execPath, ['scripts/admin-secrets.mjs', ...args], { input, encoding: 'utf8' })

describe('admin-secrets', () => {
  it('makes a long random session secret each time', () => {
    const a = newSessionSecret()
    expect(a.length).toBeGreaterThanOrEqual(40)
    expect(a).not.toBe(newSessionSecret())
  })

  it('hash: reads a password from a pipe and prints a hash that verifies', async () => {
    const r = run(['hash'], 'a long passphrase here\n')
    expect(r.status).toBe(0)
    const hash = r.stdout.trim()
    expect(hash).toMatch(/^pbkdf2\$100000\$/)
    expect(await verifyPassword('a long passphrase here', hash)).toBe(true)
    expect(r.stdout).not.toContain('passphrase')
  })

  it('hash: refuses a short password', () => {
    const r = run(['hash'], 'short\n')
    expect(r.status).toBe(1)
    expect(r.stdout).toBe('')
  })

  it('session: prints a secret; an unknown command prints usage', () => {
    expect(run(['session']).stdout.trim().length).toBeGreaterThanOrEqual(40)
    expect(run(['nope']).status).toBe(1)
  })
})
