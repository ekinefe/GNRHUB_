import React, { useId, useState } from 'react';

// Shows on hover and keyboard focus; Escape hides it. Wrap one focusable child.
export default function Tooltip({ text, children }) {
    const id = useId();
    const [open, setOpen] = useState(false);
    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        >
            {React.cloneElement(children, { 'aria-describedby': id })}
            {open && (
                <span id={id} role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-cyber-panel border border-cyber-border px-2 py-1 font-mono text-xs text-cyber-text shadow-lg z-50">
                    {text}
                </span>
            )}
        </span>
    );
}
