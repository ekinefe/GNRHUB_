// Verifies every external http(s) link found in src/ still resolves.
// Usage: npm run check:links   (needs network; exits 1 if any link is broken)
// LinkedIn and a few other sites answer bots with 999/403 even for valid pages; those are reported
// as "unverified" and do not fail the run.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SKIP = [/w3\.org/, /example\.com/, /localhost/, /127\.0\.0\.1/, /\$\{/]
const BOT_BLOCKED = new Set([401, 403, 429, 999])

function files(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) return files(path)
        return /\.(jsx?|css|html)$/.test(name) && !/\.test\./.test(name) ? [path] : []
    })
}

const found = new Map() // url -> files
for (const file of files('src')) {
    for (const [url] of readFileSync(file, 'utf8').matchAll(/https?:\/\/[^\s"'`<>)}\\]+/g)) {
        const clean = url.replace(/[.,;]+$/, '')
        if (SKIP.some((re) => re.test(clean))) continue
        found.set(clean, [...(found.get(clean) ?? []), file])
    }
}

async function check(url) {
    const opts = { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } }
    try {
        let res = await fetch(url, { ...opts, method: 'HEAD' })
        if (res.status === 405 || res.status === 404) res = await fetch(url, { ...opts, method: 'GET' })
        return res.status
    } catch (err) {
        return `error: ${err.cause?.code ?? err.name}`
    }
}

let broken = 0
for (const [url, where] of found) {
    const status = await check(url)
    const ok = typeof status === 'number' && status < 400
    const blocked = typeof status === 'number' && BOT_BLOCKED.has(status)
    if (!ok && !blocked) broken++
    console.log(`${ok ? 'ok        ' : blocked ? 'unverified' : 'BROKEN    '} ${status}  ${url}${ok ? '' : `  (${[...new Set(where)].join(', ')})`}`)
}
console.log(`\n${found.size} links checked, ${broken} broken`)
process.exit(broken ? 1 : 0)
