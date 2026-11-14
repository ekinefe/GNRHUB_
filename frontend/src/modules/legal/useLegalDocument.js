import { useEffect, useState } from 'react';

// The newest Privacy or Terms text saved in the admin panel (GNR-161), or null: while it loads, when none was saved,
// or when the server cannot be reached. The page then shows the text that ships with the site, so it is never empty.
export function useLegalDocument(doc) {
    const [saved, setSaved] = useState(null);
    useEffect(() => {
        let alive = true;
        try {
            fetch(`/api/legal/${doc}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => { if (alive && data?.document?.body) setSaved(data.document); })
                .catch(() => {});
        } catch { /* no fetch: keep the built-in text */ }
        return () => { alive = false; };
    }, [doc]);
    return saved;
}
