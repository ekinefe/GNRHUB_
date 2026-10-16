import React from 'react';

const ART = {
    empty: ['┌─────────────┐', '│   0 FOUND   │', '└─────────────┘'],
    error: ['┌─────────────┐', '│  ! FAULT !  │', '└─────────────┘'],
};

// Themed empty / error panel with a little ASCII box. Children go below the message (actions, suggestions).
export default function EmptyState({ variant = 'empty', title, hint, children }) {
    return (
        <div className="border border-dashed border-cyber-border p-12 text-center">
            <pre aria-hidden="true" className={`inline-block mb-4 font-mono text-xs leading-tight ${variant === 'error' ? 'text-cyber-offline' : 'text-cyber-pink'}`}>
                {ART[variant].join('\n')}
            </pre>
            <p className="font-mono text-cyber-muted mb-2">{title}</p>
            {hint && <p className="font-mono text-xs text-cyber-muted mb-4">{hint}</p>}
            {children}
        </div>
    );
}
