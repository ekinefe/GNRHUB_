import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorScreen from './ErrorScreen'

vi.mock('@/shared/animations/FuzzyText', () => ({ default: ({ children }) => <div>{children}</div> }))

describe('ErrorScreen', () => {
    it('renders the code, heading, log lines and actions', () => {
        render(<ErrorScreen code="404" heading="Lost" log={['one', 'two']} actions={<button>Home</button>} />)
        expect(screen.getByText('404')).toBeInTheDocument()
        expect(screen.getByText('Lost')).toBeInTheDocument()
        expect(screen.getByText(/one/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()
    })

    it('counts down and retries', () => {
        vi.useFakeTimers()
        const onRetry = vi.fn()
        render(<ErrorScreen code="500" heading="x" autoRetry={{ seconds: 3, onRetry }} />)
        expect(screen.getByRole('status')).toHaveTextContent('3s')
        act(() => { vi.advanceTimersByTime(3100) })
        expect(onRetry).toHaveBeenCalledTimes(1)
        vi.useRealTimers()
    })

    it('cancels the auto-retry on interaction', () => {
        vi.useFakeTimers()
        const onRetry = vi.fn()
        render(<ErrorScreen code="500" heading="x" autoRetry={{ seconds: 3, onRetry }} />)
        act(() => { vi.advanceTimersByTime(1100) })
        fireEvent.keyDown(window, { key: 'a' })
        act(() => { vi.advanceTimersByTime(5000) })
        expect(onRetry).not.toHaveBeenCalled()
        expect(screen.queryByRole('status')).toBeNull()
        vi.useRealTimers()
    })
})
