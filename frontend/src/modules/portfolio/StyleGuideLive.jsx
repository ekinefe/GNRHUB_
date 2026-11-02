import React, { useState } from 'react';
import CyberButton from '@/shared/ui/CyberButton';
import Select from '@/shared/ui/Select';
import Checkbox from '@/shared/ui/Checkbox';
import Input from '@/shared/ui/Input';
import Badge from '@/shared/ui/Badge';

// Live parts of /design (GNR-42): copyable class names, a button playground and the motion catalogue.

export const CopyClass = ({ value, children }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); }
    };
    return (
        <button type="button" onClick={copy} aria-label={`Copy ${value}`} className="font-mono text-xs text-cyber-muted hover:text-cyber-pink text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
            {children ?? value}{copied ? ' (copied)' : ''}
        </button>
    );
};

const VARIANTS = ['primary', 'cyan', 'secondary', 'alert', 'ghost'];

export const ButtonPlayground = () => {
    const [variant, setVariant] = useState('primary');
    const [disabled, setDisabled] = useState(false);
    const [label, setLabel] = useState('Initialize');
    const snippet = `<CyberButton variant="${variant}"${disabled ? ' disabled' : ''}>${label}</CyberButton>`;
    return (
        <div className="grid gap-4 md:grid-cols-2 p-6 bg-cyber-panel border border-cyber-border" data-testid="button-playground">
            <div className="space-y-4">
                <Select label="Variant" value={variant} onChange={(e) => setVariant(e.target.value)} options={VARIANTS} />
                <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
                <Checkbox label="Disabled" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            </div>
            <div className="space-y-4">
                <div className="min-h-16 flex items-center"><CyberButton variant={variant} disabled={disabled}>{label}</CyberButton></div>
                <CopyClass value={snippet}>{snippet}</CopyClass>
            </div>
        </div>
    );
};

const MOTION = [
    { token: 'duration-fast', ms: 150, use: 'Hover and focus feedback' },
    { token: 'duration-base', ms: 300, use: 'Panels, menus, most transitions' },
    { token: 'duration-slow', ms: 600, use: 'Page-level reveals' },
];

export const MotionCatalogue = () => {
    const [on, setOn] = useState(false);
    return (
        <div className="space-y-4 p-6 bg-cyber-panel border border-cyber-border" data-testid="motion-catalogue">
            <p className="font-mono text-xs text-cyber-muted">
                Press the button to compare the duration tokens. Motion stops under "Reduce effects" (footer) or the system setting.
            </p>
            <CyberButton variant="secondary" aria-pressed={on} onClick={() => setOn((v) => !v)}>Toggle</CyberButton>
            <ul className="space-y-3">
                {MOTION.map(({ token, ms, use }) => (
                    <li key={token}>
                        <div className="h-2 bg-cyber-border">
                            <div className={`h-2 bg-cyber-pink transition-all ${token} ${on ? 'w-full' : 'w-0'}`} />
                        </div>
                        <p className="font-mono text-xs text-cyber-muted mt-1"><CopyClass value={token} /> · {ms}ms · {use}</p>
                    </li>
                ))}
            </ul>
            <div className="flex flex-wrap gap-3 font-mono text-xs text-cyber-muted">
                <Badge tone="success">animate-pulse</Badge>
                <span>Status dots. Other effects: Decrypt, TextType, FuzzyText (see Forms and feedback, and the Home page).</span>
            </div>
        </div>
    );
};
