import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Colophon from './Colophon'

describe('Colophon', () => {
    it('shows the stack and the build', () => {
        render(<Colophon />)
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByTestId('colophon-build')).toHaveTextContent(/commit \S+/)
    })
    it('has a text alternative for the diagram', () => {
        render(<Colophon />)
        expect(screen.getByLabelText(/Architecture diagram/)).toBeInTheDocument()
    })
})
