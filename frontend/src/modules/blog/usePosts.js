import { useEffect, useState } from 'react';

// Loads JSON from the public blog API. status: loading | ready | missing (404) | error.
export function useApi(path) {
    const [state, setState] = useState({ status: 'loading', data: null });
    useEffect(() => {
        let alive = true;
        setState({ status: 'loading', data: null });
        fetch(path)
            .then(async (res) => {
                if (!alive) return;
                if (res.status === 404) return setState({ status: 'missing', data: null });
                const data = res.ok ? await res.json().catch(() => null) : null;
                setState(data ? { status: 'ready', data } : { status: 'error', data: null });
            })
            .catch(() => alive && setState({ status: 'error', data: null }));
        return () => { alive = false; };
    }, [path]);
    return state;
}

export const formatDate = (seconds) => new Date(seconds * 1000).toLocaleDateString('en-GB', { dateStyle: 'long' });
