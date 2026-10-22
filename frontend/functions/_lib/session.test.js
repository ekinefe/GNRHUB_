// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { signSession, verifySession, sessionCookie, clearSessionCookie, readSessionCookie, COOKIE_NAME, SESSION_SECONDS } from './session.ts'

const SECRET = 'a'.repeat(40)
const now = 1_800_000_000_000

describe('session', () => {
  it('signs and verifies, carrying who and when', async () => {
    const token = await signSession(SECRET, 'owner', now)
    const s = await verifySession(SECRET, token, now + 1000)
    expect(s).toEqual({ sub: 'owner', iat: now / 1000, exp: now / 1000 + SESSION_SECONDS })
  })

  it('expires', async () => {
    const token = await signSession(SECRET, 'owner', now, 60)
    expect(await verifySession(SECRET, token, now + 59_000)).not.toBeNull()
    expect(await verifySession(SECRET, token, now + 60_000)).toBeNull()
  })

  it('rejects a wrong secret, a changed payload, a changed signature and junk', async () => {
    const token = await signSession(SECRET, 'owner', now)
    const [payload, sig] = token.split('.')
    expect(await verifySession('b'.repeat(40), token, now)).toBeNull()
    const forged = btoa(JSON.stringify({ sub: 'owner', iat: 0, exp: 9_999_999_999 })).replace(/=+$/, '')
    expect(await verifySession(SECRET, `${forged}.${sig}`, now)).toBeNull()
    expect(await verifySession(SECRET, `${payload}.${sig.slice(0, -2)}AA`, now)).toBeNull()
    for (const junk of [undefined, '', 'x', 'a.b.c', '.', 'a.']) expect(await verifySession(SECRET, junk, now)).toBeNull()
  })

  it('refuses a short or missing secret', async () => {
    await expect(signSession('short', 'owner')).rejects.toThrow()
    expect(await verifySession(undefined, 'a.b', now)).toBeNull()
    expect(await verifySession('short', 'a.b', now)).toBeNull()
  })

  it('builds a hardened cookie and reads it back', () => {
    const c = sessionCookie('tok')
    expect(c).toContain(`${COOKIE_NAME}=tok`)
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', `Max-Age=${SESSION_SECONDS}`]) expect(c).toContain(flag)
    expect(clearSessionCookie()).toContain('Max-Age=0')
    const req = new Request('https://x.test', { headers: { Cookie: `other=1; ${COOKIE_NAME}=abc.def; more=2` } })
    expect(readSessionCookie(req)).toBe('abc.def')
    expect(readSessionCookie(new Request('https://x.test'))).toBeUndefined()
  })
})
