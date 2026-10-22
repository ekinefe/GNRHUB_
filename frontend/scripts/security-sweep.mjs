// Static security sweep over git-tracked files (GNR-142).
// Usage: npm run security:sweep [-- --report ../docs/security-sweep-report.md]
// Exits 1 when a finding is not suppressed. Suppress one line with a `sweep-ignore` comment.
// This is a tripwire for common mistakes, not a replacement for review or `npm audit` (CI runs that).
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const SECRET_FILE = /(^|\/)(\.env(\..+)?|\.dev\.vars|.*\.pem|.*\.key|AccountDetails\.md)$/
const EXAMPLE_FILE = /\.example$/

const SECRET_PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Resend key', /\bre_[A-Za-z0-9]{20,}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['Slack token', /\bxox[abp]-[A-Za-z0-9-]{10,}\b/],
  ['Stripe live key', /\b[sr]k_live_[A-Za-z0-9]{10,}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
]

const SINKS = [
  ['dangerouslySetInnerHTML', /dangerouslySetInnerHTML/],
  ['innerHTML assignment', /\.innerHTML\s*=/],
  ['eval', /\beval\s*\(/],
  ['new Function', /\bnew Function\s*\(/],
  ['document.write', /\bdocument\.write\s*\(/],
]

const isTest = (path) => /\.test\.[jt]sx?$/.test(path)

export function scanFile(path, text) {
  const findings = []
  const add = (rule, line, detail) => findings.push({ rule, path, line, detail })
  const lines = text.split('\n')
  const ignored = (i) => lines[i].includes('sweep-ignore')

  if (SECRET_FILE.test(path) && !EXAMPLE_FILE.test(path)) add('secret-file-tracked', 1, 'secret-looking file is tracked by git')
  if (isTest(path)) return findings

  lines.forEach((line, i) => {
    if (ignored(i)) return
    for (const [name, re] of SECRET_PATTERNS) if (re.test(line)) add('secret-pattern', i + 1, name)
    if (path.startsWith('frontend/src/') || path.startsWith('frontend/functions/')) {
      for (const [name, re] of SINKS) if (re.test(line)) add('dangerous-sink', i + 1, name)
    }
  })

  if (path.startsWith('frontend/functions/')) {
    for (const m of text.matchAll(/\.prepare\(\s*`[^`]*\$\{/g)) {
      const lineNo = text.slice(0, m.index).split('\n').length
      if (!ignored(lineNo - 1)) add('sql-interpolation', lineNo, 'SQL built with ${...}; use bind()')
    }
  }

  if (/\.(jsx|tsx)$/.test(path)) {
    for (const m of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)) {
      if (!/rel=["'][^"']*(noopener|noreferrer)/.test(m[0])) {
        const lineNo = text.slice(0, m.index).split('\n').length
        if (!ignored(lineNo - 1)) add('blank-target-no-noopener', lineNo, 'target="_blank" without rel="noopener" or "noreferrer"')
      }
    }
  }
  return findings
}

const SECRET_KEY = /(secret|token|password|api[_-]?key|private)/i

export function scanWrangler(text) {
  const stripped = text.replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '')
  const findings = []
  const walk = (obj, trail) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      if (v && typeof v === 'object') walk(v, [...trail, k])
      else if (SECRET_KEY.test(k) && typeof v === 'string' && v !== '') {
        findings.push({ rule: 'wrangler-secret', path: 'frontend/wrangler.jsonc', line: 1, detail: `${[...trail, k].join('.')} holds a value; use wrangler secret` })
      }
    }
  }
  walk(JSON.parse(stripped), [])
  return findings
}

export function scanGitignore(text) {
  const need = ['.env', '.dev.vars']
  return need
    .filter((n) => !text.split('\n').some((l) => l.trim() === n || l.trim() === `${n}*`))
    .map((n) => ({ rule: 'gitignore-missing', path: '.gitignore', line: 1, detail: `${n} is not ignored` }))
}

export function sweep(root, tracked) {
  const files = tracked ?? execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
  const findings = []
  for (const path of files) {
    if (/\.(png|jpe?g|gif|ico|woff2?|ttf|pdf|webp|svg)$/.test(path) || path.endsWith('package-lock.json')) {
      findings.push(...scanFile(path, ''))
      continue
    }
    let text
    try { text = readFileSync(`${root}/${path}`, 'utf8') } catch { continue }
    findings.push(...scanFile(path, text))
    if (path === 'frontend/wrangler.jsonc') findings.push(...scanWrangler(text))
    if (path === '.gitignore') findings.push(...scanGitignore(text))
  }
  return { files: files.length, findings }
}

export function renderReport({ files, findings }, date) {
  const rows = findings.map((f) => `| ${f.rule} | \`${f.path}:${f.line}\` | ${f.detail} |`).join('\n')
  return `# Security sweep report

Run on ${date} with \`npm run security:sweep\` over ${files} tracked files.

${findings.length === 0 ? '**No findings.**' : `**${findings.length} finding(s):**\n\n| Rule | Where | Detail |\n|---|---|---|\n${rows}`}

Checked: tracked secret files, secret patterns (private keys, cloud/mail/GitHub/Slack/Stripe keys, JWTs), \`.gitignore\` coverage for \`.env\` and \`.dev.vars\`, secrets in \`wrangler.jsonc\`, SQL built with string interpolation in \`functions/\`, dangerous DOM sinks, and \`target="_blank"\` links without \`rel="noopener"\`. Dependency audit runs separately in CI (\`npm audit\`). Injection and ownership behaviour is covered by the handler tests against the migrated test database (\`functions/_lib/schema.test.js\`, \`functions/_test/\`).
`
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL('../../', import.meta.url).pathname.replace(/\/$/, '')
  const result = sweep(root)
  const at = process.argv.indexOf('--report')
  if (at !== -1) {
    writeFileSync(process.argv[at + 1], renderReport(result, new Date().toISOString().slice(0, 10)))
    console.log(`Report written to ${process.argv[at + 1]}`)
  }
  for (const f of result.findings) console.error(`${f.rule}  ${f.path}:${f.line}  ${f.detail}`)
  console.log(`Swept ${result.files} files: ${result.findings.length} finding(s).`)
  process.exit(result.findings.length ? 1 : 0)
}
