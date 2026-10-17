import { describe, it, expect, vi } from 'vitest'

describe('supabase client', () => {
  it('does not throw when the env vars are empty', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mod = await import('./supabase')
    expect(mod.supabaseConfigured).toBe(false)
    expect(mod.supabase.auth).toBeDefined()
    expect(warn).toHaveBeenCalled()
    vi.unstubAllEnvs()
    warn.mockRestore()
  })
})
