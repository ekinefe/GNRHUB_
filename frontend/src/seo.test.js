import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// Every routed page sets its own title and description (directly, or through the shared CatalogPage / LegalLayout / ErrorScreen).
const app = readFileSync('src/app/App.jsx', 'utf8')
const pages = [...app.matchAll(/from '@\/([^']+)'|import\('@\/([^']+)'\)/g)].map((m) => m[1] ?? m[2]).filter((p) => /^modules\/.+|^shared\/errors\//.test(p) && !/AccountMenu|ErrorBoundary/.test(p)) // components, not pages

describe('document meta', () => {
    it.each(pages)('%s sets its meta', (page) => {
        const file = ['.jsx', '.js'].map((e) => `src/${page}${e}`).find((f) => { try { readFileSync(f); return true } catch { return false } })
        const text = readFileSync(file, 'utf8')
        expect(/useDocumentMeta|CatalogPage|LegalLayout|ErrorScreen/.test(text)).toBe(true)
    })
})
