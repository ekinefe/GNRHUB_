// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../_test/testD1.js'
import { base32Encode, base32Decode, newTotpSecret, totpCode, verifyTotp, stepAt, otpauthUri, acceptStep } from './totp.ts'

// RFC 6238, appendix B: secret "12345678901234567890", SHA-1. The RFC lists 8 digits; the last 6 are the 6-digit code.
const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'
const VECTORS = [[59, '287082'], [1111111109, '081804'], [1111111111, '050471'], [1234567890, '005924'], [2000000000, '279037'], [20000000000, '353130']]

describe('base32', () => {
  it('round-trips and matches the known encoding of the RFC secret', () => {
    expect(base32Encode(new TextEncoder().encode('12345678901234567890'))).toBe(RFC_SECRET)
    expect(new TextDecoder().decode(base32Decode(RFC_SECRET))).toBe('12345678901234567890')
    for (const n of [1, 5, 9, 20, 33]) { const b = crypto.getRandomValues(new Uint8Array(n)); expect([...base32Decode(base32Encode(b))]).toEqual([...b]) }
  })
  it('accepts lower case, spaces, hyphens and padding, and refuses other characters', () => {
    expect(base32Decode('gezd gnbv-GY3TQOJQ====').length).toBe(10)
    expect(() => base32Decode('abc1')).toThrow()
  })
})

describe('totp', () => {
  it.each(VECTORS)('matches the RFC 6238 vector at %i', async (seconds, expected) => {
    expect(await totpCode(RFC_SECRET, stepAt(seconds * 1000))).toBe(expected)
  })

  it('accepts the current step and one either side, nothing further', async () => {
    const now = 1_800_000_000_000
    const step = stepAt(now)
    for (const s of [step - 1, step, step + 1]) expect(await verifyTotp(RFC_SECRET, await totpCode(RFC_SECRET, s), now)).toBe(s)
    for (const s of [step - 2, step + 2]) expect(await verifyTotp(RFC_SECRET, await totpCode(RFC_SECRET, s), now)).toBeNull()
  })

  it('rejects anything that is not six digits, and a wrong code', async () => {
    const now = 1_800_000_000_000
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 34', null, undefined, '000000x']) expect(await verifyTotp(RFC_SECRET, bad, now)).toBeNull()
    const right = await totpCode(RFC_SECRET, stepAt(now))
    const wrong = right === '000000' ? '000001' : '000000'
    expect(await verifyTotp(RFC_SECRET, wrong, now)).toBeNull()
    expect(await verifyTotp(RFC_SECRET, `${right.slice(0, 3)} ${right.slice(3)}`, now)).toBe(stepAt(now)) // a space in the middle is fine
  })

  it('makes a fresh 32-character secret and an otpauth address an authenticator app understands', () => {
    const a = newTotpSecret()
    expect(a).toMatch(/^[A-Z2-7]{32}$/)
    expect(a).not.toBe(newTotpSecret())
    const uri = otpauthUri(RFC_SECRET, 'admin', 'GNRdigital')
    expect(uri).toBe(`otpauth://totp/GNRdigital:admin?secret=${RFC_SECRET}&issuer=GNRdigital&algorithm=SHA1&digits=6&period=30`)
  })
})

describe('acceptStep (no reuse)', () => {
  let db
  beforeEach(() => { db = createTestD1() })
  afterEach(() => db.close())
  it('accepts a step once, refuses it and older ones afterwards, accepts a newer one', async () => {
    expect(await acceptStep(db, 100)).toBe(true)
    expect(await acceptStep(db, 100)).toBe(false)
    expect(await acceptStep(db, 99)).toBe(false)
    expect(await acceptStep(db, 101)).toBe(true)
    expect(await db.prepare('SELECT last_step FROM admin_totp').first('last_step')).toBe(101)
  })
})
