// Small fuzzy matcher for the command palette (GNR-49). A query matches when its letters appear
// in order. Higher score is better: consecutive letters and word starts count extra.
export function fuzzyScore(query, text) {
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    const t = text.toLowerCase();
    let ti = 0;
    let score = 0;
    let streak = 0;
    for (const ch of q) {
        const found = t.indexOf(ch, ti);
        if (found === -1) return -1;
        streak = found === ti ? streak + 1 : 0;
        score += 1 + streak * 2 + (found === 0 || /[\s_\-/]/.test(t[found - 1]) ? 3 : 0);
        ti = found + 1;
    }
    return score - t.length * 0.01; // shorter text wins ties
}

export function fuzzyFilter(items, query, text = (i) => i.title) {
    return items
        .map((item) => ({ item, score: fuzzyScore(query, `${text(item)} ${item.keywords ?? ''}`) }))
        .filter((r) => r.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item);
}
