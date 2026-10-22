import { describe, it, expect, vi } from 'vitest'
import { humanGate } from './turnstile.ts'

const reply = (success) => vi.fn(async () => new Response(JSON.stringify({ success })))

describe('humanGate', () => {
  it('is skipped (ok) while no secret is configured', async () => {
    expect(await humanGate(undefined, {})).toEqual({ ok: true, skipped: true })
  })

  it('rejects a missing token when configured, without calling Cloudflare', async () => {
    const f = reply(true)
    expect(await humanGate('', { TURNSTILE_SECRET: 's' }, undefined, f)).toEqual({ ok: false })
    expect(f).not.toHaveBeenCalled()
  })

  it('accepts a verified token and sends secret, token and IP', async () => {
    const f = reply(true)
    const request = new Request('https://x.test', { headers: { 'CF-Connecting-IP': '203.0.113.7' } })
    expect(await humanGate('tok', { TURNSTILE_SECRET: 's' }, request, f)).toEqual({ ok: true })
    const body = f.mock.calls[0][1].body
    expect(body.get('secret')).toBe('s')
    expect(body.get('response')).toBe('tok')
    expect(body.get('remoteip')).toBe('203.0.113.7')
  })

  it('rejects a token Cloudflare refuses, and a failed lookup', async () => {
    expect(await humanGate('bad', { TURNSTILE_SECRET: 's' }, undefined, reply(false))).toEqual({ ok: false })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const boom = vi.fn(async () => { throw new Error('net') })
    expect(await humanGate('tok', { TURNSTILE_SECRET: 's' }, undefined, boom)).toEqual({ ok: false })
    spy.mockRestore()
  })
})
