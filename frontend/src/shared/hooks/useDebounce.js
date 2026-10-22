import { useEffect, useState } from 'react';

// Returns `value` after it has stopped changing for `delay` ms, plus whether a change is still pending.
export function useDebounce(value, delay = 250) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        // clearing a search should show everything again right away, not after the delay
        if (value === '') {
            setDebounced(value);
            return undefined;
        }
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return [debounced, debounced !== value];
}
