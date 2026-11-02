import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ScrollProgress from './ScrollProgress'

const scrollTo = async (y, room = 1000) => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: room + 500 })
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 500 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
    await act(() => new Promise((r) => requestAnimationFrame(() => r())))
}
const fill = () => screen.getByTestId('scroll-progress').firstChild.style.transform
afterEach(() => { Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 }) })

describe('ScrollProgress', () => {
    it('is hidden from screen readers and starts empty', () => {
        render(<ScrollProgress />)
        expect(screen.getByTestId('scroll-progress')).toHaveAttribute('aria-hidden', 'true')
        expect(fill()).toBe('scaleX(0)')
    })

    it('fills in proportion to how far the page is scrolled and never goes past full', async () => {
        render(<ScrollProgress />)
        await scrollTo(500)
        expect(fill()).toBe('scaleX(0.5)')
        await scrollTo(5000)
        expect(fill()).toBe('scaleX(1)')
    })

    it('stays empty on a page that does not scroll', async () => {
        render(<ScrollProgress />)
        await scrollTo(0, 0)
        expect(fill()).toBe('scaleX(0)')
    })
})
