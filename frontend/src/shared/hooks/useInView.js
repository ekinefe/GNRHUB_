import { useEffect, useRef, useState } from 'react';

// Is the element on screen? Heavy effects use this to stop when scrolled out of view.
// Without IntersectionObserver (old browsers, tests) it reports true.
export function useInView(options) {
    const ref = useRef(null);
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
        observer.observe(el);
        return () => observer.disconnect();
    }, [options]);
    return [ref, inView];
}
