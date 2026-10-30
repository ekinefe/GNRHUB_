// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { safeEqual } from './safeEqual.ts'

describe('safeEqual', () => {
  it('is true for equal strings and false for any difference, including length and case', async () => {
    expect(await safeEqual('ekin', 'ekin')).toBe(true)
    expect(await safeEqual('ekin', 'Ekin')).toBe(false)
    expect(await safeEqual('ekin', 'ekin ')).toBe(false)
    expect(await safeEqual('', 'x')).toBe(false)
    expect(await safeEqual('', '')).toBe(true)
  })
})
