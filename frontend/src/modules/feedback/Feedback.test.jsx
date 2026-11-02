import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Feedback from './Feedback'

const reply = (status, body = {}, headers = {}) => new Response(JSON.stringify(body), { status, headers })
afterEach(() => vi.restoreAllMocks())
const at = (url = '/feedback?page=/projects') => render(<MemoryRouter initialEntries={[url]}><Feedback /></MemoryRouter>)
const type = (text = 'The Projects page does not scroll.') => fireEvent.change(screen.getByLabelText(/^What happened/), { target: { value: text } })
const send = () => fireEvent.click(screen.getByRole('button', { name: 'Send report' }))

describe('Feedback page', () => {
  it('sends the report with the page it came from, and says thank you', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(201, { ok: true }))
    at()
    expect(screen.getByText('/projects')).toBeInTheDocument()
    type(); send()
    expect(await screen.findByText(/the report was sent/)).toBeInTheDocument()
    const [url, init] = f.mock.calls[0]
    expect(url).toBe('/api/feedback')
    expect(JSON.parse(init.body)).toEqual({ kind: 'problem', message: 'The Projects page does not scroll.', email: '', website: '', page: '/projects' })
  })
  it('shows the server message under the field and keeps what was typed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(400, { errors: { message: 'Write at least 10 characters.' } }))
    at('/feedback')
    type('short'); send()
    expect(await screen.findByText('Write at least 10 characters.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^What happened/)).toHaveValue('short')
  })
  it('explains a limit and a network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply(429, {}, { 'Retry-After': '1800' })).mockRejectedValueOnce(new Error('offline'))
    at('/feedback')
    type(); send()
    expect(await screen.findByRole('alert')).toHaveTextContent(/30 minutes/)
    send()
    expect(await screen.findByText(/Check your connection/)).toBeInTheDocument()
  })
})
