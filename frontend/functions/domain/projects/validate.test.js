// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { validateProject } from './validate.ts'
import { LIMITS } from './types.ts'

const good = { name: 'Planned Lost', slug: '', grp: 'project', kind: 'Web app', summary: 'A route planner.', tech: 'React, TypeScript, react', points: 'First point\n\n  Second   point ', status: 'live', repo: '', url: 'https://example.com/app', image: '/projects/planned-lost.png', imageAlt: 'The home page', caseStudy: '/colophon', learned: '', featured: true, inAbout: false, sort: '5' }

describe('validateProject', () => {
  it('cleans a good project: slug from the name, tidy lists, empty links become null', () => {
    const r = validateProject(good)
    expect(r.ok).toBe(true)
    expect(r.value).toMatchObject({ slug: 'planned-lost', tech: ['React', 'TypeScript', 'react'], points: ['First point', 'Second point'], repo: null, url: 'https://example.com/app', sort: 5, featured: true, inAbout: false })
  })

  it('gives a plain message for each bad field', () => {
    const r = validateProject({ ...good, name: '', summary: '', kind: '', status: 'dead', grp: 'x', sort: -1 })
    expect(r.ok).toBe(false)
    expect(Object.keys(r.errors).sort()).toEqual(['grp', 'kind', 'name', 'slug', 'sort', 'status', 'summary'].sort())
  })

  it('accepts only https links, never javascript:, data:, http: or a link with a password', () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'http://example.com', 'https://user:pw@example.com', 'example.com', '//evil.test']) {
      expect(validateProject({ ...good, url: bad }).errors?.url, bad).toBeTruthy()
      expect(validateProject({ ...good, repo: bad }).errors?.repo, bad).toBeTruthy()
    }
  })

  it('takes an image only from the site\'s own /projects/ folder, and needs a description for it', () => {
    for (const bad of ['https://evil.test/a.png', '/etc/passwd', '/projects/../x.png', '/projects/a.exe', '//evil/a.png']) expect(validateProject({ ...good, image: bad }).errors?.image, bad).toBeTruthy()
    expect(validateProject({ ...good, imageAlt: '' }).errors.imageAlt).toMatch(/Describe/)
    expect(validateProject({ ...good, image: '', imageAlt: '' }).ok).toBe(true)
  })

  it('limits lengths and counts, and rejects odd case-study routes', () => {
    expect(validateProject({ ...good, name: 'x'.repeat(LIMITS.name + 1) }).errors.name).toBeTruthy()
    expect(validateProject({ ...good, tech: Array.from({ length: LIMITS.tech + 1 }, (_, i) => `t${i}`).join(',') }).errors.tech).toBeTruthy()
    expect(validateProject({ ...good, points: Array.from({ length: LIMITS.points + 1 }, (_, i) => `p${i}`).join('\n') }).errors.points).toBeTruthy()
    for (const bad of ['colophon', '//x', 'https://x.test', '/a b']) expect(validateProject({ ...good, caseStudy: bad }).errors?.caseStudy, bad).toBeTruthy()
  })

  it('shows a project unless visible is exactly false', () => {
    expect(validateProject(good).value.visible).toBe(true)
    expect(validateProject({ ...good, visible: false }).value.visible).toBe(false)
    expect(validateProject({ ...good, visible: 'no' }).value.visible).toBe(true)
  })

  it('removes control characters and survives a non-object body', () => {
    expect(validateProject({ ...good, name: 'Pla\u0000nned' }).value.name).toBe('Planned')
    expect(validateProject(null).ok).toBe(false)
  })
})
