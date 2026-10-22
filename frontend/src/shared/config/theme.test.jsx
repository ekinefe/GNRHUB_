import React from 'react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ACCENTS, ACCENT_KEY, SCANLINES_KEY, setAccent, setScanlines, getAccent, getScanlines, initTheme } from './theme'
import ThemeControls from '@/shared/ui/ThemeControls'

const root = document.documentElement

beforeEach(() => {
    localStorage.clear()
    setAccent('pink')
    setScanlines(false)
})

describe('theme', () => {
    it('sets and clears data-accent and persists the choice', () => {
        setAccent('amber')
        expect(root.dataset.accent).toBe('amber')
        expect(localStorage.getItem(ACCENT_KEY)).toBe('amber')
        setAccent('pink')
        expect(root.dataset.accent).toBeUndefined()
    })

    it('ignores an unknown accent', () => {
        setAccent('hotdog')
        expect(getAccent()).toBe('pink')
    })

    it('toggles scanlines and persists', () => {
        setScanlines(true)
        expect(root.dataset.scanlines).toBe('on')
        expect(localStorage.getItem(SCANLINES_KEY)).toBe('1')
        expect(getScanlines()).toBe(true)
        setScanlines(false)
        expect(root.dataset.scanlines).toBeUndefined()
    })

    it('initTheme re-applies the current state to <html>', () => {
        setAccent('green')
        delete root.dataset.accent
        initTheme()
        expect(root.dataset.accent).toBe('green')
    })

    it('still works when storage throws', () => {
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
        expect(() => setAccent('cyan')).not.toThrow()
        expect(root.dataset.accent).toBe('cyan')
        spy.mockRestore()
    })
})

describe('no flash on load (public/theme-init.js)', () => {
    const run = () => new Function(readFileSync('public/theme-init.js', 'utf8'))()
    beforeEach(() => { delete root.dataset.accent; delete root.dataset.scanlines })

    it('applies the saved accent and scanlines before React', () => {
        localStorage.setItem(ACCENT_KEY, 'cyan')
        localStorage.setItem(SCANLINES_KEY, '1')
        run()
        expect(root.dataset.accent).toBe('cyan')
        expect(root.dataset.scanlines).toBe('on')
    })

    it('ignores junk values', () => {
        localStorage.setItem(ACCENT_KEY, '<script>')
        run()
        expect(root.dataset.accent).toBeUndefined()
    })

    it('uses the same storage keys and accent names as theme.js', () => {
        const code = readFileSync('public/theme-init.js', 'utf8')
        expect(code).toContain(ACCENT_KEY)
        expect(code).toContain(SCANLINES_KEY)
        for (const name of ACCENTS) expect(code).toContain(name)
    })

    it('index.html loads it as a plain external script', () => {
        expect(readFileSync('index.html', 'utf8')).toContain('<script src="/theme-init.js"></script>')
    })
})

describe('ThemeControls', () => {
    it('switches accent and scanlines with accessible state', () => {
        render(<ThemeControls />)
        fireEvent.click(screen.getByRole('button', { name: 'amber' }))
        expect(screen.getByRole('button', { name: 'amber' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'pink' })).toHaveAttribute('aria-pressed', 'false')
        fireEvent.click(screen.getByRole('button', { name: /scanlines: off/i }))
        expect(screen.getByRole('button', { name: /scanlines: on/i })).toHaveAttribute('aria-pressed', 'true')
    })
})
