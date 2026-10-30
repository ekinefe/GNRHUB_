// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { adminMessages, changeMessage, messageOverview, receiveMessage } from './actions.ts'
import { PER_CLIENT_LIMIT } from './limit.ts'

const form = (over = {}) => ({ name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'I would like to talk about an internship.', ...over })
const client = (key = 'a') => async () => key
let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())

describe('messages domain', () => {
  it('stores a valid message and lists it as unread', async () => {
    expect(await receiveMessage(db, form(), client())).toEqual({ ok: true })
    const { messages, unread } = await adminMessages(db)
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ name: 'Ada', read: false })
    expect(unread).toBe(1)
  })

  it('answers a bot as if it worked but stores nothing', async () => {
    expect(await receiveMessage(db, form({ website: 'http://spam.test' }), client())).toEqual({ ok: true })
    expect((await adminMessages(db)).messages).toHaveLength(0)
  })

  it('reports bad input and the rate limit as results', async () => {
    expect(await receiveMessage(db, form({ email: 'nope' }), client())).toMatchObject({ ok: false, reason: 'invalid' })
    for (let i = 0; i < PER_CLIENT_LIMIT; i++) expect((await receiveMessage(db, form(), client('b'))).ok).toBe(true)
    expect(await receiveMessage(db, form(), client('b'))).toMatchObject({ ok: false, reason: 'limited' })
    expect((await receiveMessage(db, form(), client('c'))).ok).toBe(true)
  })

  it('marks read and unread, deletes, and refuses unknown actions', async () => {
    await receiveMessage(db, form(), client())
    const { messages } = await adminMessages(db)
    const id = messages[0].id
    expect(await changeMessage(db, id, 'read')).toBe('ok')
    expect((await messageOverview(db)).unread).toBe(0)
    expect(await changeMessage(db, id, 'unread')).toBe('ok')
    expect(await changeMessage(db, id, 'burn')).toBe('unknown-action')
    expect(await changeMessage(db, id, 'delete')).toBe('ok')
    expect(await changeMessage(db, id, 'delete')).toBe('not-found')
  })

  it('gives the overview a preview without the email address', async () => {
    await receiveMessage(db, form({ message: 'x'.repeat(300) }), client())
    const { recent } = await messageOverview(db)
    expect(recent[0].preview).toHaveLength(90)
    expect(recent[0]).not.toHaveProperty('email')
  })
})
