// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { open, seal } from './secretBox.ts'

const SECRET = 'a-long-server-secret-for-tests'

describe('secretBox', () => {
  it('round-trips a value', async () => {
    const sealed = await seal(SECRET, 'mail', 'mail.key', 're_abc123')
    expect(sealed).not.toContain('re_abc123')
    expect(await open(SECRET, 'mail', 'mail.key', sealed)).toBe('re_abc123')
  })
  it('uses a fresh IV every time', async () => {
    expect(await seal(SECRET, 'mail', 'k', 'x')).not.toBe(await seal(SECRET, 'mail', 'k', 'x'))
  })
  it('returns null after the secret is rotated', async () => {
    const sealed = await seal(SECRET, 'mail', 'k', 'x')
    expect(await open('another-secret', 'mail', 'k', sealed)).toBeNull()
  })
  it('returns null for another purpose or context', async () => {
    const sealed = await seal(SECRET, 'mail', 'mail.key', 'x')
    expect(await open(SECRET, 'ai', 'mail.key', sealed)).toBeNull()
    expect(await open(SECRET, 'mail', 'ai.key', sealed)).toBeNull()
  })
  it('returns null for tampered or malformed values, never throws', async () => {
    const sealed = await seal(SECRET, 'mail', 'k', 'x')
    const [v, iv, data] = sealed.split('.')
    const flipped = (data[0] === 'A' ? 'B' : 'A') + data.slice(1)
    expect(await open(SECRET, 'mail', 'k', `${v}.${iv}.${flipped}`)).toBeNull()
    for (const bad of ['', 'nope', 'v1..', 'v9.a.b', '%%%.%%%.%%%']) {
      expect(await open(SECRET, 'mail', 'k', bad)).toBeNull()
    }
  })
})
