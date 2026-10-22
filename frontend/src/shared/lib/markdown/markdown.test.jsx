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
        expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument()
    })
})
