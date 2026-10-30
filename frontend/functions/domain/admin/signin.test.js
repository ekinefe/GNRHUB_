// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { checkSignIn } from './signin.ts'
import { hashPassword } from './password.ts'
import { PER_CLIENT_LIMIT } from './loginLimit.ts'
import { newTotpSecret, totpCode, stepAt } from './totp.ts'

let db, secrets
beforeEach(async () => {
  db = createTestD1()
  secrets = { username: 'ekin', passwordHash: await hashPassword('a long passphrase here', 2000) }
})
afterEach(() => db.close())

const creds = (over = {}) => ({ username: 'ekin', password: 'a long passphrase here', code: '', ...over })

describe('checkSignIn', () => {
  it('accepts the right username and password', async () => {
    expect(await checkSignIn(db, secrets, creds(), 'c1')).toEqual({ ok: true })
  })

  it('gives one answer for a wrong username, a wrong password and no credentials', async () => {
    for (const c of [creds({ username: 'x' }), creds({ password: 'nope' }), null]) {
      expect(await checkSignIn(db, secrets, c, 'c2')).toEqual({ ok: false, reason: 'wrong' })
    }
  })

  it('locks a client after too many wrong attempts, but not another client', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT; i++) await checkSignIn(db, secrets, creds({ password: 'bad' }), 'c3')
    expect(await checkSignIn(db, secrets, creds(), 'c3')).toMatchObject({ ok: false, reason: 'locked' })
    expect(await checkSignIn(db, secrets, creds(), 'c4')).toEqual({ ok: true })
  })

  it('needs a code when a TOTP secret is set, and a code works once', async () => {
    const totpSecret = newTotpSecret()
    const withTotp = { ...secrets, totpSecret }
    expect(await checkSignIn(db, withTotp, creds(), 'c5')).toEqual({ ok: false, reason: 'wrong' })
    const code = await totpCode(totpSecret, stepAt(Date.now()))
    expect(await checkSignIn(db, withTotp, creds({ code }), 'c6')).toEqual({ ok: true })
    expect(await checkSignIn(db, withTotp, creds({ code }), 'c7')).toEqual({ ok: false, reason: 'wrong' })
  })
})
