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

export function parseMarkdown(source) {
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
            blocks.push({ type: 'quote', children: parseMarkdown(quote.join('\n')) });
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
