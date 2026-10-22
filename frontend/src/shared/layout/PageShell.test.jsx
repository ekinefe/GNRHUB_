import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageShell from './PageShell'

describe('PageShell', () => {
    it('renders children in a centred container', () => {
        const { container, getByText } = render(<PageShell><p>hi</p></PageShell>)
        expect(getByText('hi')).toBeInTheDocument()
        expect(container.querySelector('.max-w-6xl')).not.toBeNull()
    })

    it('widens for the 7xl variant', () => {
        const { container } = render(<PageShell width="7xl"><p>hi</p></PageShell>)
        expect(container.querySelector('.max-w-7xl')).not.toBeNull()
    })
})
