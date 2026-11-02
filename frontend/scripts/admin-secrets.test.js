// @vitest-environment node
/* global process */
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { newSessionSecret } from './admin-secrets.mjs'
import { verifyPassword } from '../functions/domain/admin/password.ts'

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

  it('totp: prints a new secret and the address for an authenticator app', () => {
    const r = run(['totp'])
    expect(r.status).toBe(0)
    const secret = /ADMIN_TOTP_SECRET=([A-Z2-7]{32})/.exec(r.stdout)?.[1]
    expect(secret).toBeTruthy()
    expect(r.stdout).toContain(`otpauth://totp/GNRdigital:admin?secret=${secret}&issuer=GNRdigital&algorithm=SHA1&digits=6&period=30`)
    expect(run(['totp']).stdout).not.toContain(secret) // a different secret every time
  })

  it('session: prints a secret; an unknown command prints usage', () => {
    expect(run(['session']).stdout.trim().length).toBeGreaterThanOrEqual(40)
    expect(run(['nope']).status).toBe(1)
  })
})
