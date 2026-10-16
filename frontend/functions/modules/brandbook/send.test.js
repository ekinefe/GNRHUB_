import { describe, it, expect, vi, afterEach } from 'vitest'
import { onRequestPost } from './send.js'

const call = (env) => onRequestPost({ env, request: new Request('https://x.test/api/send-brandbook', { method: 'POST', body: '{}' }) })

describe('send-brandbook', () => {
    afterEach(() => vi.unstubAllGlobals())

    it.each([[{}], [undefined], [{ MAIL_ENABLED: 'false' }], [{ MAIL_ENABLED: 'true ' }]])('returns 501 and never calls Resend when disabled (%j)', async (env) => {
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        const res = await call(env)
        expect(res.status).toBe(501)
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
