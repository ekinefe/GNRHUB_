// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password.ts'

describe('password', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse battery staple')
    expect(stored).toMatch(/^pbkdf2\$100000\$[\w-]+\$[\w-]+$/)
    expect(await verifyPassword('correct horse battery staple', stored)).toBe(true)
    expect(await verifyPassword('correct horse battery stapl', stored)).toBe(false)
    expect(await verifyPassword('', stored)).toBe(false)
  })

  it('uses a fresh salt every time', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'))
  })

  it('keeps the iteration count in the hash', async () => {
    const stored = await hashPassword('pw', 5000)
    expect(stored.split('$')[1]).toBe('5000')
    expect(await verifyPassword('pw', stored)).toBe(true)
  })

  it('refuses iteration counts outside what the platform allows', async () => {
    await expect(hashPassword('pw', 100)).rejects.toThrow()
    await expect(hashPassword('pw', 600000)).rejects.toThrow()
    const stored = await hashPassword('pw', 5000)
    const tampered = stored.replace('$5000$', '$600000$')
    expect(await verifyPassword('pw', tampered)).toBe(false)
  })

  it('returns false for a malformed or missing stored value, never throws', async () => {
    for (const bad of [undefined, '', 'pw', 'pbkdf2$x$y$z', 'pbkdf2$5000$$', 'bcrypt$5000$a$b', 'pbkdf2$5000$a', 'pbkdf2$5000$!!$??']) {
      expect(await verifyPassword('pw', bad)).toBe(false)
    }
  })

  it('handles non-ASCII passwords', async () => {
    const stored = await hashPassword('şifre-ğüöçı-密码', 2000)
    expect(await verifyPassword('şifre-ğüöçı-密码', stored)).toBe(true)
    expect(await verifyPassword('sifre-guoci-密码', stored)).toBe(false)
  })
})
