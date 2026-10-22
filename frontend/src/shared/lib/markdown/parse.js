// A small Markdown parser for blog posts (ADR 0009). It turns text into a plain tree; rendering it to React elements
// (never HTML strings) is what makes a post unable to inject script. Supported: headings (# to ####), paragraphs,
// bold, italic, inline code, fenced code blocks, links, bullet and numbered lists, block quotes, rules.
// Not supported on purpose: raw HTML (shown as text), images, tables.

const SCHEMES = /^(https?:\/\/|mailto:)/i;

/** Only http, https, mailto, a path on this site ("/x", not "//x") or a "#fragment". Anything else is dropped. */
export function safeUrl(raw) {
    const url = String(raw ?? '').trim();
    // eslint-disable-next-line no-control-regex
    if (!url || /[\u0000-\u001f\u007f\s]/.test(url)) return null;
    if (SCHEMES.test(url)) return url;
    if (url.startsWith('/') && !url.startsWith('//')) return url;
    if (url.startsWith('#')) return url;
    return null;
}

const INLINE = [
    { type: 'code', re: /`([^`]+)`/ },
    { type: 'link', re: /\[([^\]]+)\]\(([^)\s]+)\)/ },
    { type: 'bold', re: /\*\*(.+?)\*\*/ },
    { type: 'italic', re: /(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])|(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])/ },
];

export function parseInline(text) {
    const out = [];
    let rest = text;
    while (rest) {
        let best = null;
        for (const rule of INLINE) {
            const m = rule.re.exec(rest);
            if (m && (!best || m.index < best.m.index)) best = { rule, m };
        }
        if (!best) { out.push({ type: 'text', value: rest }); break; }
        const { rule, m } = best;
        if (m.index > 0) out.push({ type: 'text', value: rest.slice(0, m.index) });
        if (rule.type === 'code') out.push({ type: 'code', value: m[1] });
        else if (rule.type === 'link') {
            const href = safeUrl(m[2]);
            if (href) out.push({ type: 'link', href, children: parseInline(m[1]) });
            else out.push({ type: 'text', value: m[1] });
        } else if (rule.type === 'bold') out.push({ type: 'bold', children: parseInline(m[1]) });
        else out.push({ type: 'italic', children: parseInline(m[1] ?? m[2]) });
        rest = rest.slice(m.index + m[0].length);
    }
    return out;
}

function parseBlocks(source) {
    const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let i = 0;
    const isBlank = (l) => l.trim() === '';
    const isStart = (l) => /^(#{1,4})\s/.test(l) || /^```/.test(l) || /^>\s?/.test(l) || /^\s*([-*]|\d+\.)\s+/.test(l) || /^(-{3,}|\*{3,})\s*$/.test(l);

    while (i < lines.length) {
        const line = lines[i];
        if (isBlank(line)) { i += 1; continue; }

        const fence = /^```(\w*)\s*$/.exec(line);
        if (fence) {
            const code = [];
            i += 1;
            while (i < lines.length && !/^```\s*$/.test(lines[i])) { code.push(lines[i]); i += 1; }
            i += 1; // the closing fence (or the end of the text)
            blocks.push({ type: 'code', lang: fence[1], value: code.join('\n') });
            continue;
        }
        const heading = /^(#{1,4})\s+(.*)$/.exec(line);
        if (heading) { blocks.push({ type: 'heading', level: heading[1].length, children: parseInline(heading[2].trim()) }); i += 1; continue; }
        if (/^(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ type: 'rule' }); i += 1; continue; }
        if (/^>\s?/.test(line)) {
            const quote = [];
            while (i < lines.length && /^>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, '')); i += 1; }
            blocks.push({ type: 'quote', children: parseBlocks(quote.join('\n')) });
            continue;
        }
        const item = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(line);
        if (item) {
            const ordered = /\d/.test(item[1]);
            const items = [];
            while (i < lines.length) {
                const m = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
                if (!m || /\d/.test(m[1]) !== ordered) break;
                items.push(parseInline(m[2]));
                i += 1;
            }
            blocks.push({ type: 'list', ordered, items });
            continue;
        }
        const para = [];
        while (i < lines.length && !isBlank(lines[i]) && (para.length === 0 || !isStart(lines[i]))) { para.push(lines[i].trim()); i += 1; }
        blocks.push({ type: 'paragraph', children: parseInline(para.join(' ')) });
    }
    return blocks;
}

/** The visible text of inline nodes (used for heading ids and the table of contents). */
export function plainText(nodes) {
    return nodes.map((n) => (n.type === 'text' || n.type === 'code' ? n.value : plainText(n.children ?? []))).join('');
}

/** A URL-safe id for a heading: lower case, letters and digits joined by hyphens (accents and Turkish letters folded). */
export function headingSlug(text) {
    return String(text)
        .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ß/g, 'ss').replace(/ł/g, 'l').replace(/Ł/g, 'l')
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '') || 'section';
}

/** Parses a post; every top-level heading gets a unique `id` (the second "Notes" becomes notes-2). */
export function parseMarkdown(source) {
    const blocks = parseBlocks(source);
    const used = new Map();
    for (const b of blocks) {
        if (b.type !== 'heading') continue;
        const base = headingSlug(plainText(b.children));
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        b.id = n === 1 ? base : `${base}-${n}`;
    }
    return blocks;
}

/** The headings to list in a table of contents: [{ id, level, text }]. */
export function headingsOf(source, maxLevel = 3) {
    return parseMarkdown(source).filter((b) => b.type === 'heading' && b.level <= maxLevel).map((b) => ({ id: b.id, level: b.level, text: plainText(b.children) }));
}

/** Minutes to read at about 200 words a minute, never less than 1. Code blocks are skipped. */
export function readingMinutes(source) {
    const words = String(source ?? '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
