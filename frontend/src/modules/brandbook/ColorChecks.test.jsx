import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColorChecks from './ColorChecks'

const colors = { primary: '#FF318C', secondary: '#00E5FF', background: '#FFFFFF', text: '#111111', secondaryText: '#666666' }

describe('ColorChecks', () => {
    it('shows pass and fail with the ratio and a suggested fix', () => {
        render(<ColorChecks colors={colors} />)
        expect(screen.getByText('Text on background').parentElement).toHaveTextContent('PASS')
        const secondary = screen.getByText('Secondary on background').parentElement
        expect(secondary).toHaveTextContent('FAIL')
        expect(secondary).toHaveTextContent(/try #[0-9A-F]{6}/)
    })

    it('copies a value on click', async () => {
        const writeText = vi.fn(async () => {})
        Object.assign(navigator, { clipboard: { writeText } })
        render(<ColorChecks colors={colors} />)
        fireEvent.click(screen.getByRole('button', { name: /HEX #FF318C/ }))
        await waitFor(() => expect(writeText).toHaveBeenCalledWith('#FF318C'))
    })

    it('does not crash on an invalid hex while typing', () => {
        render(<ColorChecks colors={{ ...colors, background: '#12' }} />)
        expect(screen.getAllByText(/enter a valid hex colour/).length).toBeGreaterThan(0)
    })

    it('previews colour-vision types', () => {
        render(<ColorChecks colors={colors} />)
        for (const t of ['protanopia', 'deuteranopia', 'tritanopia']) expect(screen.getByText(t)).toBeInTheDocument()
    })
})
