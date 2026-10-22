import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AsciiDonut from './AsciiDonut'
import { donutFrame } from './donutFrame'

describe('donutFrame', () => {
    it('draws a fixed-size block using only the brightness characters', () => {
        const lines = donutFrame(1, 0.6).split('\n')
        expect(lines).toHaveLength(26)
        for (const l of lines) expect(l).toHaveLength(58)
        expect(new Set(lines.join('').replace(/\n/g, ''))).toContain('@')
        expect(lines.join('')).toMatch(/^[ .,\-~:;=!*#$@]+$/)
    })

    it('changes as it turns and leaves empty space around it', () => {
        expect(donutFrame(1, 0.6)).not.toBe(donutFrame(1.5, 0.9))
        const chars = donutFrame(1, 0.6).replace(/\n/g, '')
        const ink = chars.replace(/ /g, '').length
        expect(ink).toBeGreaterThan(100)
        expect(ink).toBeLessThan(chars.length * 0.6)
    })
})

describe('AsciiDonut', () => {
    it('is decorative and renders one frame', () => {
        const { container } = render(<AsciiDonut />)
        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
        expect(screen.getByTestId('ascii-donut').textContent.length).toBeGreaterThan(100)
    })
})
