import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactForm from './ContactForm'

const reply = (status, body = {}, headers = {}) => new Response(JSON.stringify(body), { status, headers })
afterEach(() => vi.restoreAllMocks())

const fill = () => {
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'I would like to talk about an internship.' } })
}
const send = () => fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

describe('ContactForm', () => {
  it('sends the fields (with an empty trap field) and then says it was sent', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(201, { ok: true }))
    render(<ContactForm />)
    fill(); send()
    expect(await screen.findByText('Your message was sent.')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ name: 'Ada', email: 'ada@example.com', subject: '', message: 'I would like to talk about an internship.', website: '' })
    fireEvent.click(screen.getByRole('button', { name: 'Send another message' }))
    expect(screen.getByLabelText(/^Name/)).toHaveValue('')
  })

  it('shows the server\'s message under each bad field and keeps what was typed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(400, { error: 'Check the form.', errors: { email: 'Enter a valid email address.', message: 'Write at least 10 characters.' } }))
    render(<ContactForm />)
    fill(); send()
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Write at least 10 characters.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Ada')
  })

  it('says what to do when limited, unavailable, or offline', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    render(<ContactForm />)
    fill()
    fetchMock.mockResolvedValueOnce(reply(429, {}, { 'Retry-After': '1800' })); send()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('30 minutes'))
    fetchMock.mockResolvedValueOnce(reply(503)); send()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('email me instead'))
    fetchMock.mockRejectedValueOnce(new Error('offline')); send()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not send'))
  })

  it('hides the trap field from people and from screen readers', () => {
    render(<ContactForm />)
    const trap = document.querySelector('input[name="website"]')
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(trap).toHaveAttribute('tabindex', '-1')
  })
})
