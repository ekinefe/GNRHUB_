import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Tells the server which page was opened (GNR-82), so the owner can see how many visits there are.
// Only the path is sent: no cookie, no identifier, nothing about the visitor. The server also ignores browsers that send
// Do Not Track or Global Privacy Control. A failed request is ignored; a counter must never disturb a page.
const PageViews = () => {
    const { pathname } = useLocation();
    const last = useRef(null);
    useEffect(() => {
        if (last.current === pathname || pathname.startsWith('/admin')) return;
        last.current = pathname;
        try {
            fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: pathname }),
                keepalive: true,
            }).catch(() => {});
        } catch { /* no fetch, nothing to count */ }
    }, [pathname]);
    return null;
};

export default PageViews;
