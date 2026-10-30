import { describe, it, expect } from 'vitest'
import { validateRedirect } from './validate.ts'
import { makeRedirect } from '../../_test/factories.js'

describe('validateRedirect', () => {
  it('accepts a https address and a page of this site', () => {
    expect(validateRedirect(makeRedirect()).ok).toBe(true)
    expect(validateRedirect(makeRedirect({ target: '/about#skills' })).value).toMatchObject({ target: '/about#skills', permanent: false })
  })

  it('refuses other schemes, other sites by slashes, and credentials', () => {
    for (const target of ['http://example.com', 'javascript:alert(1)', 'data:text/html,x', '//evil.test', 'https://user:pw@example.com', 'about', '/has space']) {
      expect(validateRedirect(makeRedirect({ target })).errors?.target, target).toBeTruthy()
    }
  })

  it('needs a clean short name', () => {
    for (const slug of ['', 'Has Caps', 'a/b', '-x', 'x'.repeat(61)]) {
      expect(validateRedirect(makeRedirect({ slug })).errors?.slug, slug).toBeTruthy()
    }
  })

  it('is permanent only when asked, and tolerates a body that is not an object', () => {
    expect(validateRedirect(makeRedirect({ permanent: 'yes' })).value.permanent).toBe(false)
    expect(validateRedirect(makeRedirect({ permanent: true })).value.permanent).toBe(true)
    expect(validateRedirect(null).ok).toBe(false)
  })
})
