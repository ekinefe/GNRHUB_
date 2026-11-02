import { useEffect } from 'react';

// Adds a <script type="application/ld+json"> block for this page and removes it when the page unmounts.
export function useJsonLd(id, data) {
    useEffect(() => {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.id = `ld-${id}`;
        el.textContent = JSON.stringify(data);
        document.head.appendChild(el);
        return () => el.remove();
    }, [id, data]);
}
