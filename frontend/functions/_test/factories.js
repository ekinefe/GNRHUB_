// Test data in one place. Each factory returns a valid form body / environment; pass only what the test is about:
//   makePost({ status: 'public' })   makeProject({ visible: false })   makeMessage({ email: 'nope' })
// The values are what the admin forms send (strings, not parsed), so they go through validation like real input.
import { hashPassword } from '../domain/admin/password.ts'

export const ADMIN_USERNAME = 'ekin'
export const ADMIN_PASSPHRASE = 'a long passphrase here'

export const makePost = (over = {}) => ({ title: 'First note', slug: '', summary: 'Short.', body: 'Body **text**', tags: 'notes', status: 'draft', ...over })

export const makeProject = (over = {}) => ({
  name: 'Alpha', slug: '', grp: 'project', kind: 'Web app', summary: 'The first.', tech: 'React, D1', points: 'One\nTwo', status: 'live',
  repo: '', url: '', image: '', imageAlt: '', caseStudy: '', learned: '', featured: false, inAbout: false, sort: 100, ...over,
})

export const makeMessage = (over = {}) => ({ name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'I would like to talk about an internship.', ...over })

/** The Worker's env for a test: the database plus the owner's sign-in secrets (a cheap hash, 2000 rounds). */
export async function adminEnv(db, extra = {}) {
  return {
    ASSETS: { fetch: async () => new Response('x') },
    DB: db,
    ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: await hashPassword(ADMIN_PASSPHRASE, 2000),
    SESSION_SECRET: 'k'.repeat(40),
    ...extra,
  }
}

export const loginBody = (over = {}) => ({ username: ADMIN_USERNAME, password: ADMIN_PASSPHRASE, ...over })

export const makeRedirect = (over = {}) => ({ slug: 'cv', target: 'https://example.com/cv.pdf', permanent: false, ...over })
