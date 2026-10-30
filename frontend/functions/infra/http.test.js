import { describe, it, expect } from 'vitest'
import { idOf, readJson, sameOrigin, validId } from './http.ts'

const post = (body, headers = {}) => new Request('https://x.test/api/admin/posts/12', { method: 'POST', body, headers })

describe('readJson', () => {
  it('parses a small JSON body', async () => {
    expect(await readJson(post('{"a":1}'), 100)).toEqual({ a: 1 })
  })
  it('gives undefined for bad JSON', async () => {
    expect(await readJson(post('{nope'), 100)).toBeUndefined()
  })
  it('gives undefined when the body is too long', async () => {
    expect(await readJson(post('{"a":"' + 'x'.repeat(200) + '"}'), 100)).toBeUndefined()
  })
  it('trusts Content-Length before reading', async () => {
    expect(await readJson(post('{}', { 'Content-Length': '5000' }), 100)).toBeUndefined()
  })
})

describe('idOf and validId', () => {
  it('reads the last path segment', () => {
    expect(idOf(post('{}'))).toBe(12)
  })
  it('refuses zero, fractions and text', () => {
    expect([0, 1.5, NaN, -3].some(validId)).toBe(false)
    expect(validId(7)).toBe(true)
  })
})

describe('sameOrigin', () => {
  it('needs an Origin that matches the request', () => {
    expect(sameOrigin(post('{}', { Origin: 'https://x.test' }))).toBe(true)
    expect(sameOrigin(post('{}', { Origin: 'https://evil.test' }))).toBe(false)
    expect(sameOrigin(post('{}'))).toBe(false)
  })
})
