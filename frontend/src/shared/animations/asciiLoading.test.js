import { describe, it, expect } from 'vitest'
import { spinnerFrame, barFrame, staticBar, SPINNER_FRAMES } from './asciiLoading'

describe('asciiLoading', () => {
  it('cycles the four spinner frames, also for negative ticks', () => {
    expect([0, 1, 2, 3, 4].map(spinnerFrame)).toEqual(['|', '/', '-', '\\', '|'])
    expect(SPINNER_FRAMES).toHaveLength(4)
    expect(spinnerFrame(-1)).toBe('\\')
  })

  it('keeps the bar the same width in every frame so nothing around it shifts', () => {
    for (let t = 0; t < 80; t += 1) expect(barFrame(t)).toHaveLength(26)
    expect(barFrame(0, 10, 4)).toHaveLength(12)
    expect(staticBar()).toHaveLength(26)
  })

  it('slides the block to the right end and back', () => {
    expect(barFrame(0, 10, 4)).toBe('[====      ]')
    expect(barFrame(6, 10, 4)).toBe('[      ====]')
    expect(barFrame(9, 10, 4)).toBe('[   ====   ]')
    expect(barFrame(12, 10, 4)).toBe('[====      ]')
  })
})
