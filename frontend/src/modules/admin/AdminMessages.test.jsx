import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminMessages from './AdminMessages'

const reply = (status, body = {}) => new Response(JSON.stringify(body), { status })
afterEach(() => vi.restoreAllMocks())

const m1 = { id: 2, name: 'Bo', email: 'bo@example.com', subject: 'Hello', message: 'Line one\n<b>not bold</b>', createdAt: 1_800_000_000, read: false }
const m2 = { id: 1, name: 'Ada', email: 'ada@example.com', subject: '', message: 'Older message here.', createdAt: 1_799_000_000, read: true }

describe('AdminMessages', () => {
  it('lists messages with the unread count and an empty-subject label', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(200, { messages: [m1, m2], unread: 1 }))
    render(<AdminMessages />)
    expect(await screen.findByText('(1 unread)')).toBeInTheDocument()
    expect(screen.getByText('Bo')).toBeInTheDocument()
    expect(screen.getByText('(no subject)')).toBeInTheDocument()
  })

  it('opening an unread message shows it as plain text, links the sender and marks it read', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(reply(200, { messages: [m1], unread: 1 }))
      .mockResolvedValueOnce(reply(200, { ok: true }))
      .mockResolvedValueOnce(reply(200, { messages: [{ ...m1, read: true }], unread: 0 }))
    const { container } = render(<AdminMessages />)
    fireEvent.click(await screen.findByRole('button', { name: /Bo/ }))
    expect(screen.getByText(/<b>not bold<\/b>/)).toBeInTheDocument()
    expect(container.querySelector('b')).toBeNull()
    expect(screen.getByRole('link', { name: 'bo@example.com' })).toHaveAttribute('href', 'mailto:bo@example.com')
    await waitFor(() => expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/messages/2'))
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ action: 'read' })
  })

  it('asks before deleting, then deletes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(reply(200, { messages: [m2], unread: 0 }))
      .mockResolvedValueOnce(reply(200, { ok: true }))
      .mockResolvedValueOnce(reply(200, { messages: [], unread: 0 }))
    render(<AdminMessages />)
    fireEvent.click(await screen.findByRole('button', { name: /Ada/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }))
    expect(screen.getByText('Delete this message?')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1) // nothing deleted yet
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
    expect(await screen.findByText(/No messages yet/)).toBeInTheDocument()
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ action: 'delete' })
  })

  it('says so when the messages cannot be loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(503, { error: 'x' }))
    render(<AdminMessages />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the messages')
  })
})
