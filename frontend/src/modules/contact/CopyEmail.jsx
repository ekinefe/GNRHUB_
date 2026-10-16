import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';

// Copies `email` to the clipboard and says so (visibly and to screen readers).
export default function CopyEmail({ email }) {
    const [state, setState] = useState('idle'); // idle | copied | failed
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setState('copied');
        } catch {
            setState('failed');
        }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState('idle'), 2500);
    };

    return (
        <>
            <CyberButton type="button" variant="secondary" icon={state === 'copied' ? Check : Copy} onClick={copy}>
                {state === 'copied' ? 'Copied' : 'Copy email'}
            </CyberButton>
            <span role="status" className="sr-only">
                {state === 'copied' ? 'Email address copied to clipboard' : state === 'failed' ? 'Could not copy, select the address and copy it by hand' : ''}
            </span>
            {state === 'failed' && <span className="font-mono text-xs text-cyber-offline">Could not copy - select the address above.</span>}
        </>
    );
}
