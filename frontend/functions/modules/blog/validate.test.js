import { describe, it, expect } from 'vitest'
import { validatePost, LIMITS } from './validate.ts'

const good = { title: 'What I learned about cron', slug: '', summary: 'A short note.', body: '# Heading\n\ntext', tags: 'Linux, cron,linux', status: 'draft' }

describe('validatePost', () => {
  it('accepts a good post, makes the slug from the title, and tidies tags', () => {
    const r = validatePost(good)
    expect(r.ok).toBe(true)
    expect(r.value.slug).toBe('what-i-learned-about-cron')
    expect(r.value.tags).toBe('linux,cron')
  })

  it('keeps a slug that was given, and refuses a bad one', () => {
    expect(validatePost({ ...good, slug: 'my-post' }).value.slug).toBe('my-post')
    for (const slug of ['My Post', 'a--b', '-a', 'a-', 'a/b', '../x', 'x'.repeat(100), 'ünï']) expect(validatePost({ ...good, slug }).errors?.slug, slug).toBeTruthy()
  })

  it('needs a title, and a title that gives a slug', () => {
    expect(validatePost({ ...good, title: '' }).errors.title).toBeTruthy()
    expect(validatePost({ ...good, title: '密码' }).errors.slug).toBeTruthy()
  })

  it('checks status, lengths and tags', () => {
    expect(validatePost({ ...good, status: 'published' }).errors.status).toBeTruthy()
    expect(validatePost({ ...good, summary: 's'.repeat(LIMITS.summary + 1) }).errors.summary).toBeTruthy()
    expect(validatePost({ ...good, body: 'b'.repeat(LIMITS.body + 1) }).errors.body).toBeTruthy()
    expect(validatePost({ ...good, tags: 'a,b,c,d,e,f,g,h,i' }).errors.tags).toBeTruthy()
    expect(validatePost({ ...good, tags: 'Bad Tag' }).errors.tags).toBeTruthy()
    expect(validatePost({ ...good, tags: '' }).value.tags).toBe('')
  })

  it('keeps line breaks and markdown, strips control characters, ignores junk', () => {
    expect(validatePost({ ...good, body: 'a\r\nb\u0000c' }).value.body).toBe('a\nbc')
    for (const junk of [null, undefined, 'x', 3, []]) expect(validatePost(junk).ok).toBe(false)
  })
})
