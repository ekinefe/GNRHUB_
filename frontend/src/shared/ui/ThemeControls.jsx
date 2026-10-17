import React from 'react';
import { ACCENT_SWATCH as SWATCH } from '@/shared/config/tokens';
import { ACCENTS, setAccent, setScanlines, useAccent, useScanlines } from '@/shared/config/theme';


const ThemeControls = () => {
    const accent = useAccent();
    const scanlines = useScanlines();
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Accent colour" className="flex items-center gap-2">
                <span aria-hidden="true">Accent:</span>
                {ACCENTS.map((name) => (
                    <button
                        key={name}
                        type="button"
                        aria-label={name}
                        aria-pressed={accent === name}
                        onClick={() => setAccent(name)}
                        style={{ backgroundColor: SWATCH[name] }}
                        className={`h-4 w-4 border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${accent === name ? 'border-white' : 'border-cyber-border'}`}
                    />
                ))}
            </div>
            <button type="button" aria-pressed={scanlines} onClick={() => setScanlines(!scanlines)} className="hover:text-cyber-pink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                Scanlines: {scanlines ? 'on' : 'off'}
            </button>
        </div>
    );
};

export default ThemeControls;
