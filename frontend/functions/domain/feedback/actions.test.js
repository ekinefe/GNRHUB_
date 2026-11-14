// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestD1 } from '../../_test/testD1.js'
import { adminFeedback, changeFeedback, receiveFeedback } from './actions.ts'
import { validateFeedback } from './validate.ts'

let db
beforeEach(() => { db = createTestD1() })
afterEach(() => db.close())
const make = (over = {}) => ({ kind: 'problem', page: '/projects', message: 'The Projects page does not scroll on my phone.', email: '', ...over })
const who = (name = 'a') => async () => name

describe('validateFeedback', () => {
  it('defaults the kind and keeps the email optional', () => {
    expect(validateFeedback({ message: 'This is a long enough message.' })).toMatchObject({ ok: true, value: { kind: 'problem', email: '', page: '' } })
  })
  it('gives a plain message per bad field', () => {
    expect(validateFeedback(make({ kind: 'spam', email: 'nope', message: 'short' }))).toEqual({
      ok: false,
      errors: { kind: 'Choose what this is about.', email: 'Enter a valid email address, or leave it empty.', message: 'Write at least 10 characters.' },
    })
  })
  it('drops an odd page instead of refusing the report', () => {
    expect(validateFeedback(make({ page: 'https://evil.test/<script>' }))).toMatchObject({ ok: true, value: { page: '' } })
  })
})

describe('feedback domain', () => {
  it('stores a report and lists it newest first with the unread count', async () => {
    expect(await receiveFeedback(db, make(), who())).toEqual({ ok: true })
    await receiveFeedback(db, make({ kind: 'idea', message: 'A dark and light switch please.' }), who('b'))
    const { feedback, unread } = await adminFeedback(db)
    expect(unread).toBe(2)
    expect(feedback.map((f) => f.kind)).toEqual(['idea', 'problem'])
    expect(feedback[1]).toMatchObject({ page: '/projects', read: false })
  })
  it('answers a bot as if it worked and stores nothing', async () => {
    expect(await receiveFeedback(db, make({ website: 'http://spam.test' }), who())).toEqual({ ok: true })
    expect((await adminFeedback(db)).feedback).toHaveLength(0)
  })
  it('limits one client to 3 an hour', async () => {
    for (let i = 0; i < 3; i++) expect(await receiveFeedback(db, make(), who())).toEqual({ ok: true })
    expect(await receiveFeedback(db, make(), who())).toMatchObject({ ok: false, reason: 'limited' })
    expect(await receiveFeedback(db, make(), who('other'))).toEqual({ ok: true })
  })
  it('returns the errors for an invalid report', async () => {
    expect(await receiveFeedback(db, make({ message: '' }), who())).toMatchObject({ ok: false, reason: 'invalid' })
  })
  it('marks read, unread and deletes', async () => {
    await receiveFeedback(db, make(), who())
    const [{ id }] = (await adminFeedback(db)).feedback
    expect(await changeFeedback(db, id, 'read')).toBe('ok')
    expect((await adminFeedback(db)).unread).toBe(0)
    expect(await changeFeedback(db, id, 'unread')).toBe('ok')
    expect(await changeFeedback(db, id, 'nope')).toBe('unknown-action')
    expect(await changeFeedback(db, id, 'delete')).toBe('ok')
    expect(await changeFeedback(db, id, 'delete')).toBe('not-found')
  })
})
