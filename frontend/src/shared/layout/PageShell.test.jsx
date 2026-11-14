import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageShell from './PageShell'

describe('PageShell', () => {
    it('renders children in a centred container as wide as the header', () => {
        const { container, getByText } = render(<PageShell><p>hi</p></PageShell>)
        expect(getByText('hi')).toBeInTheDocument()
        expect(container.querySelector('.max-w-screen-2xl')).not.toBeNull()
    })
})
