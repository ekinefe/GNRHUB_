import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const read = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;

export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(read);
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return undefined;
        const mq = window.matchMedia(QUERY);
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);
    return reduced;
}
