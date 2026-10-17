import { describe, it, expect } from 'vitest'
import { authClient } from './authClient'

describe('authClient (no backend yet)', () => {
    it('has no session', async () => {
        expect(await authClient.getSession()).toBeNull()
    })
    it('reports sign-in and sign-up as unavailable instead of throwing', async () => {
        const a = await authClient.signIn({ identifier: 'a', password: 'b' })
        const b = await authClient.signUp({ email: 'a@b.c', password: 'x' })
        expect(a.error.message).toMatch(/not available/i)
        expect(b.error.message).toMatch(/not available/i)
    })
})
