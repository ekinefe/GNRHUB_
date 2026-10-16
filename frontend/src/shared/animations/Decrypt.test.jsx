import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Decrypt from './Decrypt'

const mounts = vi.fn()
vi.mock('./DecryptedText', async () => {
    const { useEffect } = await import('react')
    function FakeDecrypted({ text }) {
        useEffect(() => { mounts() }, [])
        return <span>{text}</span>
    }
    return { default: FakeDecrypted }
})

afterEach(() => { vi.restoreAllMocks(); mounts.mockClear(); delete window.matchMedia })

describe('Decrypt', () => {
    it('gives screen readers the plain text and hides the scramble', () => {
        const { container } = render(<Decrypt text="Found 3 results" />)
        expect(container.querySelector('.sr-only').textContent).toBe('Found 3 results')
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    })

    it('replays only when replayKey changes', () => {
        const { rerender } = render(<Decrypt text="Found 3 results" replayKey={3} />)
        expect(mounts).toHaveBeenCalledTimes(1)
        rerender(<Decrypt text="Found 3 results" replayKey={3} />)
        expect(mounts).toHaveBeenCalledTimes(1)
        rerender(<Decrypt text="Found 4 results" replayKey={4} />)
        expect(mounts).toHaveBeenCalledTimes(2)
    })

    it('shows plain text with no animation under prefers-reduced-motion', () => {
        window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
        render(<Decrypt text="Saved" />)
        expect(screen.getByText('Saved')).toBeInTheDocument()
        expect(mounts).not.toHaveBeenCalled()
    })
})
