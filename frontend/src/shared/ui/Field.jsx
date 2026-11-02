import React from 'react';

// Label + hint + error wrapper shared by Input, Textarea and Select.
// `id` ties the label to the control; the hint/error ids go into aria-describedby on the control.
export default function Field({ id, label, hint, error, required, children }) {
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="font-mono text-xs text-cyber-muted uppercase tracking-wider flex items-center gap-2">
                    {label}
                    {required && <span className="text-cyber-pink" aria-hidden="true">*</span>}
                </label>
            )}
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="font-mono text-xs text-cyber-offline">{error}</p>
            ) : hint ? (
                <p id={`${id}-hint`} className="font-mono text-xs text-cyber-muted">{hint}</p>
            ) : null}
        </div>
    );
}
