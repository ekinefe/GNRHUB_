import { describe, it, expect, vi } from 'vitest'
import { failure, isAdminPath } from './failure.ts'

const req = (path) => new Request(`https://example.com${path}`, { method: 'POST' })

describe('failure', () => {
  it('logs and returns a generic JSON 500 on public routes without leaking internals', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = failure(new Error('secret db password in stack'), req('/api/send-brandbook'))
    expect(res.status).toBe(500)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ error: 'Internal error.' })
    expect(text).not.toContain('secret')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('gives admin routes the real cause', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = failure(new Error('no such table: users'), req('/api/admin/users'))
    expect(await res.json()).toEqual({ error: 'Server error: no such table: users' })
    spy.mockRestore()
  })

  it('handles non-Error throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = failure('oops', req('/api/admin/x'))
    expect((await res.json()).error).toBe('Server error: oops')
    spy.mockRestore()
  })

  it('only treats /api/admin paths as admin', () => {
    expect(isAdminPath('/api/admin')).toBe(true)
    expect(isAdminPath('/api/admin/users')).toBe(true)
    expect(isAdminPath('/api/administrator')).toBe(false)
    expect(isAdminPath('/api/send-brandbook')).toBe(false)
  })
})
