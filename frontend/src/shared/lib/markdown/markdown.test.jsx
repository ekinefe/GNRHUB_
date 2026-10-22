import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { parseMarkdown, parseInline, safeUrl } from './parse'
import Markdown from './Markdown'

describe('safeUrl', () => {
    it('allows http, https, mailto, site paths and fragments', () => {
        for (const u of ['https://a.test/x', 'http://a.test', 'mailto:me@a.test', '/blog/x', '#top', 'HTTPS://A.TEST']) expect(safeUrl(u), u).toBe(u)
    })
    it('drops everything else', () => {
        for (const u of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<b>', 'vbscript:x', '//evil.test', 'jav&#x61;script:alert(1)', 'blob:x', 'file:///etc/passwd', '', null, 'ftp://a.test', 'x y']) expect(safeUrl(u), String(u)).toBeNull()
    })
})

describe('parseInline', () => {
    it('handles code, bold, italic and links, nested', () => {
        const nodes = parseInline('a `c` **b *i*** [t](https://x.test) _u_')
        expect(nodes.map((n) => n.type)).toEqual(['text', 'code', 'text', 'bold', 'text', 'link', 'text', 'italic'])
    })
    it('keeps the text of a link with an unsafe address and drops the link', () => {
        const nodes = parseInline('[click](javascript:alert(1))')
        expect(nodes.every((n) => n.type === 'text')).toBe(true)
        expect(nodes[0].value).toBe('click')
    })
    it('does not treat snake_case or a lone asterisk as emphasis', () => {
        expect(parseInline('snake_case_word and 2 * 3')).toEqual([{ type: 'text', value: 'snake_case_word and 2 * 3' }])
    })
})

describe('parseMarkdown', () => {
    it('reads headings, lists, quotes, rules and fenced code', () => {
        const blocks = parseMarkdown('# T\n\npara one\nstill one\n\n- a\n- b\n\n1. x\n2. y\n\n> quoted\n\n---\n\n```js\nconst a = 1\n```')
        expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'list', 'list', 'quote', 'rule', 'code'])
        expect(blocks[1].children).toEqual([{ type: 'text', value: 'para one still one' }])
        expect(blocks[3].ordered).toBe(true)
        expect(blocks[6]).toMatchObject({ lang: 'js', value: 'const a = 1' })
    })
    it('survives an unclosed fence and empty input', () => {
        expect(parseMarkdown('```\nnever closed')[0]).toMatchObject({ type: 'code', value: 'never closed' })
        expect(parseMarkdown('')).toEqual([])
        expect(parseMarkdown(undefined)).toEqual([])
    })
})

describe('<Markdown>', () => {
    it('renders raw HTML as text, never as elements', () => {
        const { container } = render(<Markdown source={'<script>window.hacked = 1</script> <img src=x onerror=alert(1)>'} />)
        expect(container.querySelector('script')).toBeNull()
        expect(container.querySelector('img')).toBeNull()
        expect(container.textContent).toContain('<script>window.hacked = 1</script>')
        expect(window.hacked).toBeUndefined()
    })
    it('renders a javascript: link as plain text', () => {
        render(<Markdown source="[go](javascript:alert(1))" />)
        expect(screen.queryByRole('link')).toBeNull()
        expect(screen.getByText(/^go/)).toBeInTheDocument()
    })
    it('opens external links safely in a new tab and keeps site links in place', () => {
        render(<Markdown source="[out](https://a.test) and [in](/about)" />)
        expect(screen.getByRole('link', { name: 'out' })).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByRole('link', { name: 'in' })).not.toHaveAttribute('target')
    })
    it('starts headings at h2 because the page title is the h1', () => {
        render(<Markdown source="# Title" />)
        expect(screen.getByRole('heading', { level: 2, name: /^Title/ })).toBeInTheDocument()
    })
})

describe('headings, contents and reading time', () => {
    it('gives each heading a unique id and lists them for a table of contents', async () => {
        const { parseMarkdown, headingsOf } = await import('./parse')
        const md = '# Why Cron\n\n## Notes\n\ntext\n\n## Notes\n\n### Şifreleme ve Güvenlik\n\n#### deep'
        expect(parseMarkdown(md).filter((b) => b.type === 'heading').map((b) => b.id)).toEqual(['why-cron', 'notes', 'notes-2', 'sifreleme-ve-guvenlik', 'deep'])
        expect(headingsOf(md)).toEqual([
            { id: 'why-cron', level: 1, text: 'Why Cron' },
            { id: 'notes', level: 2, text: 'Notes' },
            { id: 'notes-2', level: 2, text: 'Notes' },
            { id: 'sifreleme-ve-guvenlik', level: 3, text: 'Şifreleme ve Güvenlik' },
        ])
    })

    it('takes the id from the text only, not from markup, and falls back for symbols', async () => {
        const { parseMarkdown } = await import('./parse')
        const ids = parseMarkdown('## **Bold** and `code`\n\n## !!!\n\n## <script>').filter((b) => b.type === 'heading').map((b) => b.id)
        expect(ids).toEqual(['bold-and-code', 'section', 'script'])
    })

    it('puts the id and a link to it on the rendered heading', () => {
        render(<Markdown source="## Notes" />)
        const h = screen.getByRole('heading', { level: 3, name: /Notes/ })
        expect(h).toHaveAttribute('id', 'notes')
        expect(screen.getByRole('link', { name: 'Link to this section' })).toHaveAttribute('href', '#notes')
    })

    it('estimates reading time at 200 words a minute, at least a minute, skipping code', async () => {
        const { readingMinutes } = await import('./parse')
        expect(readingMinutes('')).toBe(1)
        expect(readingMinutes('word '.repeat(450))).toBe(2)
        expect(readingMinutes('word '.repeat(100) + '```\n' + 'code '.repeat(5000) + '\n```')).toBe(1)
    })
})
