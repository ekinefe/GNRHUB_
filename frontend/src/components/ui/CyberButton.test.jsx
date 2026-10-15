import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CyberButton from './CyberButton'

describe('CyberButton', () => {
    it('calls onClick', () => {
        const onClick = vi.fn()
        render(<CyberButton onClick={onClick}>Go</CyberButton>)
        fireEvent.click(screen.getByRole('button', { name: 'Go' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('honors disabled: attribute set and click ignored', () => {
        const onClick = vi.fn()
        render(<CyberButton disabled onClick={onClick}>Go</CyberButton>)
        const button = screen.getByRole('button', { name: 'Go' })
        expect(button).toBeDisabled()
        fireEvent.click(button)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('merges className and lets it override the default padding', () => {
        render(<CyberButton className="w-full justify-center px-12">Go</CyberButton>)
        const button = screen.getByRole('button', { name: 'Go' })
        expect(button).toHaveClass('w-full', 'justify-center', 'px-12')
        expect(button).not.toHaveClass('px-6')
    })

    it('forwards type and extra props', () => {
        render(<CyberButton type="submit" aria-label="Send form" data-x="1">Go</CyberButton>)
        const button = screen.getByRole('button', { name: 'Send form' })
        expect(button).toHaveAttribute('type', 'submit')
        expect(button).toHaveAttribute('data-x', '1')
    })

    it('still submits a surrounding form when no type is given', () => {
        const onSubmit = vi.fn((e) => e.preventDefault())
        render(
            <form onSubmit={onSubmit}>
                <CyberButton>Submit</CyberButton>
            </form>
        )
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })
})
