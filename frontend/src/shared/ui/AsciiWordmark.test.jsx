import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AsciiWordmark from './AsciiWordmark'

describe('AsciiWordmark', () => {
    it('is decorative: hidden from assistive tech, four lines, nothing wider than the box', () => {
        render(<AsciiWordmark />)
        const pre = screen.getByTestId('ascii-wordmark')
        expect(pre).toHaveAttribute('aria-hidden', 'true')
        const lines = pre.textContent.split('\n')
        expect(lines).toHaveLength(4)
        expect(Math.max(...lines.map((l) => l.length))).toBeLessThanOrEqual(16)
    })
})
