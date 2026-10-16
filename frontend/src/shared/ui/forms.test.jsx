import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from './Input'
import Select from './Select'
import Textarea from './Textarea'
import Checkbox from './Checkbox'

describe('form controls', () => {
    it('ties the label to the input', () => {
        render(<Input label="Email" />)
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('shows an error, marks the field invalid and links the message', () => {
        render(<Input label="Email" error="Bad email" />)
        const input = screen.getByLabelText('Email')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByRole('alert')).toHaveTextContent('Bad email')
        expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
    })

    it('shows a hint when there is no error', () => {
        render(<Input label="Email" hint="We never share it." />)
        expect(screen.getByText('We never share it.')).toBeInTheDocument()
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('forwards props and keeps working as a controlled input', () => {
        const onChange = vi.fn()
        render(<Input label="Name" value="x" onChange={onChange} type="text" />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'xy' } })
        expect(onChange).toHaveBeenCalled()
    })

    it('renders select options and textarea', () => {
        render(<><Select label="Kind" options={['A', { value: 'b', label: 'Bee' }]} /><Textarea label="Notes" /></>)
        expect(screen.getByRole('option', { name: 'Bee' })).toHaveValue('b')
        expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA')
    })

    it('toggles a checkbox through its label', () => {
        const onChange = vi.fn()
        render(<Checkbox label="Agree" onChange={onChange} />)
        fireEvent.click(screen.getByLabelText('Agree'))
        expect(onChange).toHaveBeenCalled()
    })
})
