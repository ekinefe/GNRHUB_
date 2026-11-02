import React, { useEffect, useState } from 'react';
import { useReducedEffects } from '@/shared/config/effects';
import { spinnerFrame } from './asciiLoading';

// Loading pattern 1: a one-character spinner (| / - \) for a short wait inside a line of text.
// It exists only while the thing it stands for is loading, so it shows real state. Decorative (aria-hidden): the words
// next to it say what is happening. Under reduced effects it is a still "...".
export default function AsciiSpinner({ className = '' }) {
    const reduced = useReducedEffects();
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (reduced) return undefined;
        const id = setInterval(() => setTick((t) => t + 1), 120);
        return () => clearInterval(id);
    }, [reduced]);
    return <span aria-hidden="true" data-testid="ascii-spinner" className={`inline-block w-3 text-center font-mono ${className}`}>{reduced ? '.' : spinnerFrame(tick)}</span>;
}
