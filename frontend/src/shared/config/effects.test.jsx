import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { effectsReduced, setReduceEffects, useReducedEffects } from './effects'
import SceneBoundary from '@/shared/animations/SceneBoundary'

beforeEach(() => { setReduceEffects(false); delete window.matchMedia })

function Probe() {
    return <p>{useReducedEffects() ? 'reduced' : 'full'}</p>
}

describe('reduced effects', () => {
    it('is off by default and follows the visitor switch', () => {
        render(<Probe />)
        expect(screen.getByText('full')).toBeInTheDocument()
        act(() => setReduceEffects(true))
        expect(screen.getByText('reduced')).toBeInTheDocument()
        expect(document.documentElement.dataset.reduceEffects).toBe('true')
        expect(localStorage.getItem('reduce-effects')).toBe('1')
    })

    it('follows the OS prefers-reduced-motion setting', () => {
        window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
        expect(effectsReduced()).toBe(true)
    })
})

describe('SceneBoundary', () => {
    function Broken() { throw new Error('no webgl') }
    it('shows the fallback instead of crashing the page', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        render(<SceneBoundary fallback={<p>plain text</p>}><Broken /></SceneBoundary>)
        expect(screen.getByText('plain text')).toBeInTheDocument()
        spy.mockRestore(); warn.mockRestore()
    })
})
