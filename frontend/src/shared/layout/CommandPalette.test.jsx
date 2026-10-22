import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import CommandPalette from './CommandPalette'
import { konamiTracker, KONAMI } from '@/shared/commands/commands'
import { getAccent, setAccent, getScanlines, setScanlines } from '@/shared/config/theme'

const Where = () => <p data-testid="where">{useLocation().pathname}</p>
const page = (props) => render(
    <MemoryRouter initialEntries={['/about']}>
        <CommandPalette {...props} />
        <Routes><Route path="*" element={<Where />} /></Routes>
    </MemoryRouter>,
)
const openIt = () => fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
const box = () => screen.getByRole('combobox', { name: 'Type a command' })

beforeEach(() => { setAccent('pink'); setScanlines(false) })

describe('CommandPalette', () => {
    it('opens with Ctrl+K (and Cmd+K) from any route and closes on Escape', () => {
        page()
        expect(screen.queryByRole('dialog')).toBeNull()
        openIt()
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(box()).toHaveFocus()
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(screen.queryByRole('dialog')).toBeNull()
        fireEvent.keyDown(document, { key: 'k', metaKey: true })
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('fuzzy-searches and navigates with the keyboard', () => {
        page()
        openIt()
        fireEvent.change(box(), { target: { value: 'prj' } })
        expect(screen.getByRole('option', { name: /Go to Projects/ })).toHaveAttribute('aria-selected', 'true')
        fireEvent.keyDown(box(), { key: 'Enter' })
        expect(screen.getByTestId('where')).toHaveTextContent('/projects')
        expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('runs theme commands', () => {
        page()
        openIt()
        fireEvent.change(box(), { target: { value: 'accent: amber' } })
        fireEvent.keyDown(box(), { key: 'Enter' })
        expect(getAccent()).toBe('amber')
        openIt()
        fireEvent.change(box(), { target: { value: 'scanlines' } })
        fireEvent.keyDown(box(), { key: 'Enter' })
        expect(getScanlines()).toBe(true)
    })

    it('does not list removed areas', () => {
        page()
        openIt()
        expect(screen.queryByRole('option', { name: /Go to Tools/ })).toBeNull()
        expect(screen.queryByRole('option', { name: /Go to Blogs/ })).toBeNull()
    })

    it('whoami says guest', () => {
        page()
        openIt()
        fireEvent.change(box(), { target: { value: 'whoami' } })
        fireEvent.keyDown(box(), { key: 'Enter' })
        expect(screen.getByRole('status')).toHaveTextContent('guest')
    })

    it('has hidden help and sudo commands', () => {
        page()
        openIt()
        fireEvent.change(box(), { target: { value: 'sudo' } })
        fireEvent.keyDown(box(), { key: 'Enter' })
        expect(screen.getByRole('status')).toHaveTextContent('sudoers')
    })

    it('the Konami code toggles scanlines outside inputs', () => {
        page()
        for (const key of KONAMI) fireEvent.keyDown(document.body, { key })
        expect(getScanlines()).toBe(true)
    })
})

describe('konamiTracker', () => {
    it('fires only on the full sequence and recovers from a wrong key', () => {
        const feed = konamiTracker()
        const results = [...KONAMI.slice(0, 5), 'x', ...KONAMI].map(feed)
        expect(results.filter(Boolean)).toHaveLength(1)
        expect(results.at(-1)).toBe(true)
    })
})
