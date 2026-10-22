// "Did you mean ...?" for the 404 page: the live route whose name is closest to what was typed.
// Close means a prefix of the name, or a small edit distance (a typo such as /projetcs).
export function editDistance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i += 1) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j += 1) {
            const tmp = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return row[b.length];
}

export function suggestRoute(pathname, routes) {
    const typed = decodeURIComponentSafe(pathname).toLowerCase().split('/').filter(Boolean).pop() ?? '';
    if (typed.length < 2) return null;
    let best = null;
    let bestDistance = Infinity;
    for (const route of routes) {
        const name = route.replace(/^\//, '').toLowerCase();
        if (!name) continue;
        const distance = name.startsWith(typed) || typed.startsWith(name) ? 0 : editDistance(typed, name);
        const allowed = Math.max(1, Math.floor(name.length / 3));
        if (distance <= allowed && distance < bestDistance) { best = route; bestDistance = distance; }
    }
    return best;
}

function decodeURIComponentSafe(s) {
    try { return decodeURIComponent(s); } catch { return s; }
}
