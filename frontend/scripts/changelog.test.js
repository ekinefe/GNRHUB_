import { describe, it, expect } from 'vitest'
import { parse, draft } from './changelog.mjs'

describe('changelog', () => {
  it('parses conventional subjects and ignores the rest', () => {
    expect(parse('feat(worker): add cron (GNR-151)')).toEqual({ type: 'feat', scope: 'worker', breaking: false, text: 'add cron (GNR-151)' })
    expect(parse('fix!: drop old api')).toMatchObject({ type: 'fix', breaking: true })
    expect(parse('Merge pull request #1 from x')).toBeNull()
  })

  it('groups by type and lists breaking changes first', () => {
    const out = draft('0.2.0', '2026-11-01', ['feat(ui): a', 'fix(api): b', 'docs: c', 'refactor!: d'])
    expect(out).toContain('## [0.2.0] - 2026-11-01')
    expect(out.indexOf('### Breaking')).toBeLessThan(out.indexOf('### Added'))
    expect(out).toContain('- **ui:** a')
    expect(out).toContain('### Fixed')
    expect(out).not.toContain('docs')
  })

  it('says so when only maintenance happened', () => {
    expect(draft('0.2.1', '2026-11-02', ['chore: x'])).toContain('Maintenance only.')
  })
})
