import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AnimatedList, { DURATION, STAGGER, STAGGER_CAP } from './AnimatedList'
import { setReduceEffects } from '@/shared/config/effects'

const show = (items) => (
    <AnimatedList items={items} getKey={(x) => x} renderItem={(x) => <span>{x}</span>} />
)
beforeEach(() => setReduceEffects(false))

describe('AnimatedList', () => {
    it('renders a list item per entry', () => {
        render(show(['a', 'b']))
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('removes an item once its exit animation is done', async () => {
        const { rerender } = render(show(['a', 'b']))
        rerender(show(['a']))
        await waitFor(() => expect(screen.queryByText('b')).toBeNull())
        expect(screen.getByText('a')).toBeInTheDocument()
    })

    it('is a plain list with Reduce effects on: removed at once, no inline motion styles', () => {
        setReduceEffects(true)
        const { rerender } = render(show(['a', 'b']))
        expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('style')
        rerender(show(['a']))
        expect(screen.queryByText('b')).toBeNull()
    })

    it('stays inside the 400 ms budget', () => {
        expect((DURATION + STAGGER * STAGGER_CAP) * 1000).toBeLessThanOrEqual(400)
    })
})
