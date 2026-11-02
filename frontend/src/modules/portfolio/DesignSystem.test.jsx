import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/shared/ui/Toast'
import DesignSystem from './DesignSystem'

globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const page = () => render(<MemoryRouter><ToastProvider><DesignSystem /></ToastProvider></MemoryRouter>)

describe('/design', () => {
    it('shows tokens, type scale, playground and motion', () => {
        page()
        expect(screen.getByText(/00 \/\/ TOKENS/)).toBeInTheDocument()
        expect(screen.getByText('text-5xl')).toBeInTheDocument()
        expect(screen.getByTestId('button-playground')).toBeInTheDocument()
        expect(screen.getByTestId('motion-catalogue')).toBeInTheDocument()
    })

    it('copies a token class name', async () => {
        const writeText = vi.fn(async () => {})
        Object.assign(navigator, { clipboard: { writeText } })
        page()
        fireEvent.click(screen.getByRole('button', { name: 'Copy bg-cyber-pink' }))
        await waitFor(() => expect(writeText).toHaveBeenCalledWith('bg-cyber-pink'))
    })

    it('the playground updates the button and the snippet', async () => {
        page()
        const box = within(screen.getByTestId('button-playground'))
        fireEvent.change(box.getByLabelText('Variant'), { target: { value: 'alert' } })
        fireEvent.click(box.getByLabelText('Disabled'))
        expect(box.getByRole('button', { name: /CyberButton variant="alert" disabled/ })).toBeInTheDocument()
    })
})
