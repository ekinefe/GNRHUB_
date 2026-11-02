import { describe, it, expect } from 'vitest'
import { validateContact } from './validate.ts'
import { LIMITS } from './types.ts'

const good = { name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'I would like to talk about an internship.' }

describe('validateContact', () => {
  it('accepts a good message and trims it', () => {
    const r = validateContact({ ...good, name: '  Ada  ', subject: '  Hello   there ' })
    expect(r).toEqual({ ok: true, value: { ...good, subject: 'Hello there' } })
  })

  it('subject is optional', () => {
    expect(validateContact({ ...good, subject: undefined }).ok).toBe(true)
  })

  it('gives one plain message per bad field', () => {
    const r = validateContact({ name: '', email: 'nope', subject: 'x'.repeat(200), message: 'short' })
    expect(r.ok).toBe(false)
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  it('rejects emails that are not addresses', () => {
    for (const email of ['a@b', 'a b@c.com', '@c.com', 'a@@c.com', 'a@c.com, b@d.com', '<a@c.com>', 'a@c.com\nBcc: x@y.com', '']) {
      expect(validateContact({ ...good, email }).ok, email).toBe(false)
    }
    for (const email of ['a@c.io', 'first.last+tag@sub.example.co.uk']) expect(validateContact({ ...good, email }).ok, email).toBe(true)
  })

  it('enforces the length limits', () => {
    expect(validateContact({ ...good, message: 'x'.repeat(LIMITS.message + 1) }).ok).toBe(false)
    expect(validateContact({ ...good, message: 'x'.repeat(LIMITS.message) }).ok).toBe(true)
    expect(validateContact({ ...good, name: 'n'.repeat(LIMITS.name + 1) }).ok).toBe(false)
  })

  it('strips control characters and ignores non-string fields and junk bodies', () => {
    expect(validateContact({ ...good, name: 'A\u0000d\u0007a' }).value.name).toBe('Ada')
    expect(validateContact({ ...good, name: 5, email: {}, message: ['x'] }).ok).toBe(false)
    for (const junk of [null, undefined, 'text', 42, []]) expect(validateContact(junk).ok).toBe(false)
  })

  it('keeps line breaks in the message', () => {
    expect(validateContact({ ...good, message: 'line one is here\nline two is here' }).value.message).toContain('\n')
  })
})
