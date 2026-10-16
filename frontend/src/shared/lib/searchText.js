// Small forgiving search used by the catalog pages (no dependencies).
//   "brnd" finds "brandbook": a token of 3+ letters also matches a word that contains its
//   letters in order, starting with the same first letter.

export const normalize = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const tokensOf = (query) => normalize(query).split(/\s+/).filter(Boolean);
const wordsOf = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);

function isSubsequence(token, word) {
    if (token[0] !== word[0]) return false;
    let i = 0;
    for (const ch of word) if (ch === token[i]) i++;
    return i === token.length;
}

function tokenMatchesField(token, field) {
    if (normalize(field).includes(token)) return true;
    return token.length >= 3 && wordsOf(field).some((w) => isSubsequence(token, w));
}

/** every word you typed must match at least one of the fields */
export function matchesQuery(query, fields) {
    const tokens = tokensOf(query);
    return tokens.every((t) => fields.some((f) => tokenMatchesField(t, f)));
}

/** splits text into [{ text, match }] so exact matches can be highlighted */
export function highlightParts(text, query) {
    const tokens = tokensOf(query);
    const source = String(text ?? '');
    if (!tokens.length) return [{ text: source, match: false }];
    const flat = normalize(source);
    // normalize() can change length for odd characters; fall back to no highlight then
    if (flat.length !== source.length) return [{ text: source, match: false }];
    const marked = new Array(source.length).fill(false);
    for (const t of tokens) {
        let from = 0;
        for (let at = flat.indexOf(t, from); at !== -1; at = flat.indexOf(t, from)) {
            for (let i = at; i < at + t.length; i++) marked[i] = true;
            from = at + t.length;
        }
    }
    const parts = [];
    for (let i = 0; i < source.length; i++) {
        const last = parts[parts.length - 1];
        if (last && last.match === marked[i]) last.text += source[i];
        else parts.push({ text: source[i], match: marked[i] });
    }
    return parts;
}

function editDistance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return row[b.length];
}

/** tags closest to what was typed, best first (used when a search finds nothing) */
export function closestTags(query, tags, limit = 5) {
    const q = normalize(query).trim();
    if (!q) return [];
    return tags
        .map((tag) => {
            const t = normalize(tag);
            let score = Infinity;
            if (t.includes(q) || q.includes(t)) score = 0;
            else if (q.length >= 2 && isSubsequence(q, t)) score = 1;
            else score = editDistance(q, t.slice(0, q.length + 1)) / Math.max(q.length, 1) <= 0.5 ? 2 : Infinity;
            return { tag, score };
        })
        .filter((x) => x.score !== Infinity)
        .sort((a, b) => a.score - b.score || a.tag.localeCompare(b.tag))
        .slice(0, limit)
        .map((x) => x.tag);
}
