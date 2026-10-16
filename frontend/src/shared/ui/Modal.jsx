import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Controlled dialog: Escape and the backdrop close it, Tab stays inside, focus returns to the opener.
export default function Modal({ open, onClose, title, children }) {
    const titleId = useId();
    const panel = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const opener = document.activeElement;
        panel.current?.querySelector(FOCUSABLE)?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') return onClose();
            if (e.key !== 'Tab') return;
            const items = [...panel.current.querySelectorAll(FOCUSABLE)];
            if (!items.length) return e.preventDefault();
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            opener?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md bg-cyber-black border border-cyber-border shadow-2xl">
                <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
                    <h2 id={titleId} className="font-mono text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
                    <button onClick={onClose} aria-label="Close" className="text-cyber-muted hover:text-cyber-pink focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 font-mono text-sm text-cyber-text">{children}</div>
            </div>
        </div>
    );
}
