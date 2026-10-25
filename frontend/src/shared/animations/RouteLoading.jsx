import React, { useEffect, useState } from 'react';
import { useReducedEffects } from '@/shared/config/effects';
import { barFrame, staticBar } from './asciiLoading';

export const SHOW_AFTER_MS = 200;

// Loading pattern 2: the Suspense fallback while a page's code is downloading. React mounts it only while the download is
// pending and removes it the moment the page is ready, so it reflects real state, not a timer. It stays invisible for the
// first 200 ms so fast loads do not flash it. Under reduced effects the bar is still.
export default function RouteLoading() {
    const reduced = useReducedEffects();
    const [visible, setVisible] = useState(false);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const show = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
        return () => clearTimeout(show);
    }, []);
    useEffect(() => {
        if (reduced || !visible) return undefined;
        const id = setInterval(() => setTick((t) => t + 1), 90);
        return () => clearInterval(id);
    }, [reduced, visible]);

    return (
        <div role="status" aria-busy="true" className="min-h-screen bg-cyber-black px-4 md:px-10 pt-40 font-mono text-sm text-cyber-muted">
            {visible && (
                <>
                    <pre aria-hidden="true" data-testid="route-loading-bar" className="text-cyber-pink whitespace-pre">{reduced ? staticBar() : barFrame(tick)}</pre>
                    <p className="mt-3">Loading page</p>
                </>
            )}
            <span className="sr-only">Loading page</span>
        </div>
    );
}
