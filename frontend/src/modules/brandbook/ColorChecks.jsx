import React, { useState } from 'react';
import { parseHex, contrastRatio, passes, formatRatio, suggestAccessible, paletteFrom, simulateCvd, toHex, rgbToHsl, rgbToCmyk, CVD_TYPES } from '@/shared/lib/color';

// Text-on-background pairs that matter in a brand book, with WCAG AA results (GNR-90).
const PAIRS = [
    { id: 'text', label: 'Text on background', fg: 'text', bg: 'background', large: false },
    { id: 'secondaryText', label: 'Secondary text on background', fg: 'secondaryText', bg: 'background', large: false },
    { id: 'primary', label: 'Primary on background', fg: 'primary', bg: 'background', large: true },
    { id: 'secondary', label: 'Secondary on background', fg: 'secondary', bg: 'background', large: true },
];

const ColorChecks = ({ colors }) => {
    const [copied, setCopied] = useState('');
    const copy = async (value) => {
        try { await navigator.clipboard.writeText(value); setCopied(value); } catch { setCopied(''); }
    };
    const bg = parseHex(colors.background);
    const primary = parseHex(colors.primary);

    return (
        <div className="space-y-4 font-mono text-xs" data-testid="color-checks">
            <ul className="space-y-2">
                {PAIRS.map((p) => {
                    const fg = parseHex(colors[p.fg]);
                    if (!fg || !bg) return <li key={p.id} className="text-cyber-muted">{p.label}: enter a valid hex colour</li>;
                    const ratio = contrastRatio(fg, bg);
                    const ok = passes(ratio, 'AA', p.large);
                    const fix = ok ? null : suggestAccessible(fg, bg, p.large ? 3 : 4.5);
                    return (
                        <li key={p.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={ok ? 'text-cyber-success' : 'text-cyber-offline'}>{ok ? 'PASS' : 'FAIL'}</span>
                            <span className="text-cyber-text">{p.label}</span>
                            <span className="text-cyber-muted">{formatRatio(ratio)} (AA {p.large ? 'large 3' : '4.5'})</span>
                            {fix && (
                                <button type="button" onClick={() => copy(fix)} className="text-cyber-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                    try {fix}{copied === fix ? ' (copied)' : ''}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            {primary && (
                <div>
                    <p className="text-cyber-muted mb-1">Primary values (click to copy)</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            ['HEX', toHex(primary)],
                            ['RGB', `rgb(${primary.join(', ')})`],
                            ['HSL', `hsl(${Math.round(rgbToHsl(primary)[0])}, ${Math.round(rgbToHsl(primary)[1] * 100)}%, ${Math.round(rgbToHsl(primary)[2] * 100)}%)`],
                            ['CMYK', `cmyk(${rgbToCmyk(primary).join(', ')})`],
                        ].map(([label, value]) => (
                            <button key={label} type="button" onClick={() => copy(value)} className="border border-cyber-border px-2 py-1 text-cyber-text hover:border-cyber-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                {label} {value}{copied === value ? ' (copied)' : ''}
                            </button>
                        ))}
                    </div>
                    <div className="flex mt-2" aria-label="Shades of the primary colour">
                        {paletteFrom(primary).map((hex) => <span key={hex} title={hex} style={{ backgroundColor: hex }} className="h-6 flex-1" />)}
                    </div>
                </div>
            )}

            {primary && bg && (
                <div>
                    <p className="text-cyber-muted mb-1">Colour-vision preview (primary on background)</p>
                    <div className="grid grid-cols-2 gap-2">
                        {CVD_TYPES.map((type) => (
                            <div key={type} className="flex items-center gap-2">
                                <span className="h-6 w-10 border border-cyber-border" style={{ backgroundColor: toHex(simulateCvd(primary, type)) }} />
                                <span className="text-cyber-text">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorChecks;
