import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import AsciiSpinner from './AsciiSpinner'
import LoadingLine from './LoadingLine'
import RouteLoading, { SHOW_AFTER_MS } from './RouteLoading'
import { setReduceEffects } from '@/shared/config/effects'

beforeEach(() => { vi.useFakeTimers(); setReduceEffects(false) })
afterEach(() => { vi.useRealTimers(); setReduceEffects(false) })

describe('AsciiSpinner', () => {
  it('turns through | / - \\ and is hidden from screen readers', () => {
    render(<AsciiSpinner />)
    const el = screen.getByTestId('ascii-spinner')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.textContent).toBe('|')
    act(() => { vi.advanceTimersByTime(120) })
    expect(el.textContent).toBe('/')
    act(() => { vi.advanceTimersByTime(240) })
    expect(el.textContent).toBe('\\')
  })

  it('is a still dot with Reduce effects on', () => {
    setReduceEffects(true)
    render(<AsciiSpinner />)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByTestId('ascii-spinner').textContent).toBe('.')
  })

  it('stops its timer when it is removed (it only runs while loading)', () => {
    const { unmount } = render(<AsciiSpinner />)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('LoadingLine', () => {
  it('reads as one status message', () => {
    render(<LoadingLine>Loading posts...</LoadingLine>)
    expect(screen.getByRole('status')).toHaveTextContent('Loading posts...')
  })
})

describe('RouteLoading', () => {
  it('says "Loading page" to screen readers at once but shows nothing for the first 200 ms', () => {
    render(<RouteLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading page')
    expect(screen.queryByTestId('route-loading-bar')).toBeNull()
    act(() => { vi.advanceTimersByTime(SHOW_AFTER_MS) })
    expect(screen.getByTestId('route-loading-bar')).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not even start the 200 ms timer if the page is ready first', () => {
    const { unmount } = render(<RouteLoading />)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('moves the bar, and holds it still with Reduce effects on', () => {
    render(<RouteLoading />)
    act(() => { vi.advanceTimersByTime(SHOW_AFTER_MS) })
    const first = screen.getByTestId('route-loading-bar').textContent
    act(() => { vi.advanceTimersByTime(270) })
    expect(screen.getByTestId('route-loading-bar').textContent).not.toBe(first)
  })

  it('shows a still bar under Reduce effects', () => {
    setReduceEffects(true)
    render(<RouteLoading />)
    act(() => { vi.advanceTimersByTime(SHOW_AFTER_MS + 1000) })
    expect(screen.getByTestId('route-loading-bar').textContent).toMatch(/^\[\.+\]$/)
  })
})
