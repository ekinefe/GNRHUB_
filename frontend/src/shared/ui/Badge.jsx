import React from 'react';
import { twMerge } from 'tailwind-merge';

const tones = {
    neutral: 'border-cyber-border text-cyber-muted',
    pink: 'border-cyber-pink/40 text-cyber-pink bg-cyber-pink/10',
    cyan: 'border-cyber-cyan/40 text-cyber-cyan bg-cyber-cyan/10',
    success: 'border-cyber-success/40 text-cyber-success bg-cyber-success/10',
    beta: 'border-cyber-beta/40 text-cyber-beta bg-cyber-beta/10',
    offline: 'border-cyber-offline/40 text-cyber-offline bg-cyber-offline/10',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
    return (
        <span className={twMerge('inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-xs uppercase tracking-wider', tones[tone], className)}>
            {children}
        </span>
    );
}
