// Drafts a CHANGELOG section from conventional commits (GNR-129).
// Usage: npm run changelog -- 0.2.0 [since-tag]   (prints markdown; paste it into CHANGELOG.md)
// Without since-tag it uses the latest tag, or the whole history if there is none.
import { execFileSync } from 'node:child_process'

const SECTIONS = [
  ['feat', 'Added'],
  ['fix', 'Fixed'],
  ['perf', 'Performance'],
  ['refactor', 'Changed'],
  ['security', 'Security'],
]

export function parse(subject) {
  const m = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(subject)
  if (!m) return null
  return { type: m[1], scope: m[2] ?? '', breaking: Boolean(m[3]), text: m[4] }
}

export function draft(version, date, subjects) {
  const commits = subjects.map(parse).filter(Boolean).filter((c) => !/^Merge /.test(c.text))
  const lines = [`## [${version}] - ${date}`, '']
  const entry = (c) => `- ${c.scope ? `**${c.scope}:** ` : ''}${c.text}`
  const breaking = commits.filter((c) => c.breaking)
  if (breaking.length) lines.push('### Breaking', ...breaking.map(entry), '')
  for (const [type, title] of SECTIONS) {
    const group = commits.filter((c) => c.type === type && !c.breaking)
    if (group.length) lines.push(`### ${title}`, ...group.map(entry), '')
  }
  if (lines.length === 2) lines.push('Maintenance only.', '')
  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [version, since] = process.argv.slice(2)
  if (!version) {
    console.error('Usage: npm run changelog -- <version> [since-tag]')
    process.exit(1)
  }
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
  let from = since
  if (!from) { try { from = git('describe', '--tags', '--abbrev=0') } catch { from = '' } }
  const subjects = git('log', '--no-merges', '--pretty=%s', from ? `${from}..HEAD` : 'HEAD').split('\n').filter(Boolean)
  console.log(draft(version, new Date().toISOString().slice(0, 10), subjects))
}
