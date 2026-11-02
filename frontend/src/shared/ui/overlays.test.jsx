import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal'
import Tabs from './Tabs'
import Tooltip from './Tooltip'
import { ToastProvider, useToast } from './Toast'

describe('Modal', () => {
    it('renders nothing when closed and a labelled dialog when open', () => {
        const { rerender } = render(<Modal open={false} onClose={() => {}} title="Confirm"><button>ok</button></Modal>)
        expect(screen.queryByRole('dialog')).toBeNull()
        rerender(<Modal open onClose={() => {}} title="Confirm"><button>ok</button></Modal>)
        expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('closes on Escape, moves focus inside and keeps Tab in the dialog', () => {
        const onClose = vi.fn()
        render(<Modal open onClose={onClose} title="T"><button>inner</button></Modal>)
        const close = screen.getByRole('button', { name: 'Close' })
        const inner = screen.getByRole('button', { name: 'inner' })
        expect(document.activeElement).toBe(close)
        inner.focus()
        fireEvent.keyDown(document, { key: 'Tab' })
        expect(document.activeElement).toBe(close) // wrapped from last back to first
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(onClose).toHaveBeenCalled()
    })
})

describe('Tabs', () => {
    const tabs = [{ key: 'a', label: 'A', content: <p>panel a</p> }, { key: 'b', label: 'B', content: <p>panel b</p> }]
    it('switches by click and by arrow keys', () => {
        render(<Tabs tabs={tabs} />)
        expect(screen.getByText('panel a')).toBeInTheDocument()
        fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
        expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText('panel b')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('tab', { name: 'A' }))
        expect(screen.getByText('panel a')).toBeInTheDocument()
    })
})

describe('Tooltip', () => {
    it('shows on focus and hides on Escape', () => {
        render(<Tooltip text="Hint"><button>target</button></Tooltip>)
        fireEvent.focus(screen.getByRole('button'))
        expect(screen.getByRole('tooltip')).toHaveTextContent('Hint')
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })
        expect(screen.queryByRole('tooltip')).toBeNull()
    })
})

describe('Toast', () => {
    function Trigger() {
        const toast = useToast()
        return <button onClick={() => toast({ message: 'Saved', tone: 'success' })}>go</button>
    }
    it('shows a message and removes it after the duration', () => {
        vi.useFakeTimers()
        render(<ToastProvider duration={1000}><Trigger /></ToastProvider>)
        fireEvent.click(screen.getByText('go'))
        expect(screen.getByText('Saved')).toBeInTheDocument()
        act(() => { vi.advanceTimersByTime(1100) })
        expect(screen.queryByText('Saved')).toBeNull()
        vi.useRealTimers()
    })
    it('throws a clear error outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => render(<Trigger />)).toThrow(/ToastProvider/)
        vi.restoreAllMocks()
    })
})
