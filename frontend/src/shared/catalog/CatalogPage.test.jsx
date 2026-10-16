import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CatalogPage from './CatalogPage'

vi.mock('@/shared/animations/TextType', () => ({ default: ({ text }) => <span>{text[0]}</span> }))
vi.mock('@/shared/animations/DecryptedText', () => ({ default: ({ text }) => <span>{text}</span> }))

const items = [
    { id: '1', title: 'Brandbook Maker', excerpt: 'make a brand book', category: 'Design', tags: ['pdf'] },
    { id: '2', title: 'Log Analyzer', excerpt: 'parse logs', category: 'Security', tags: ['cli'] },
]
const renderItem = (i) => <article key={i.id}>{i.title}</article>

function setup(props = {}) {
    return render(<CatalogPage items={items} heroTitle="/T" heroText="x" searchPlaceholder="Search..." renderItem={renderItem} debounceMs={10} {...props} />)
}

describe('CatalogPage', () => {
    it('lists every item at first', () => {
        setup()
        expect(screen.getByText('Brandbook Maker')).toBeInTheDocument()
        expect(screen.getByText('Log Analyzer')).toBeInTheDocument()
    })

    it('filters by category', () => {
        setup()
        fireEvent.click(screen.getByRole('button', { name: /Security/ }))
        expect(screen.queryByText('Brandbook Maker')).toBeNull()
        expect(screen.getByText('Log Analyzer')).toBeInTheDocument()
    })

    it('searches after the debounce and shows the empty state with a way out', async () => {
        vi.useFakeTimers()
        setup()
        fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzz' } })
        await act(async () => { vi.advanceTimersByTime(50) })
        expect(screen.getByText(/No results found/)).toBeInTheDocument()
        fireEvent.click(screen.getByText(/CLEAR_FILTERS/))
        await act(async () => { vi.advanceTimersByTime(50) })
        expect(screen.getByText('Brandbook Maker')).toBeInTheDocument()
        vi.useRealTimers()
    })
})
