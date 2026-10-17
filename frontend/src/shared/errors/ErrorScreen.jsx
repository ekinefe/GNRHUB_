import React, { useEffect, useState } from 'react';
import FuzzyText from '@/shared/animations/FuzzyText';
import { tokenColor } from '@/shared/config/tokens';

const TONES = {
    alert: { color: 'alert', border: 'border-cyber-offline', bg: 'bg-cyber-offline/5', glow: 'text-cyber-offline' },
    pink: { color: 'alert', border: 'border-cyber-pink', bg: 'bg-cyber-pink/5', glow: 'text-cyber-pink' },
};

// One layout for the error pages (404, 500, later 403).
//   code           big glitching heading ("404", "500 ERROR")
//   heading        short bold line under it
//   log            terminal-style lines shown as the diagnostic report
//   actions        buttons/links shown at the bottom
//   autoRetry      { seconds, onRetry } -> counts down and calls onRetry; any key press, click or
//                  touch cancels it so it never fires while you are reading or interacting
export default function ErrorScreen({ code, heading, log = [], actions, tone = 'pink', icon, autoRetry }) {
    const t = TONES[tone];
    const [left, setLeft] = useState(autoRetry ? autoRetry.seconds : null);

    useEffect(() => {
        if (!autoRetry) return undefined;
        let cancelled = false;
        const cancel = () => { cancelled = true; setLeft(null); };
        const events = ['keydown', 'pointerdown', 'touchstart'];
        events.forEach((e) => window.addEventListener(e, cancel, { once: true }));
        const tick = setInterval(() => {
            if (cancelled) return clearInterval(tick);
            setLeft((n) => {
                if (n === null) return null;
                if (n <= 1) {
                    clearInterval(tick);
                    autoRetry.onRetry();
                    return null;
                }
                return n - 1;
            });
        }, 1000);
        return () => {
            clearInterval(tick);
            events.forEach((e) => window.removeEventListener(e, cancel));
        };
    }, [autoRetry]);

    return (
        <main id="main" className="min-h-screen bg-cyber-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(rgb(var(--cyber-border)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 text-center space-y-8 max-w-2xl">
                {icon && <div className="flex justify-center">{icon}</div>}

                <div>
                    <FuzzyText fontSize="clamp(4rem, 12vw, 9rem)" fontWeight={900} color={tokenColor(t.color)} baseIntensity={0.2} hoverIntensity={0.5} enableHover={true}>
                        {code}
                    </FuzzyText>
                </div>

                <div className={`space-y-3 border-l-2 ${t.border} pl-6 text-left ${t.bg} p-4 rounded-r-lg`}>
                    <h2 className={`text-xl font-sans ${t.glow} tracking-widest uppercase`}>{heading}</h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed">
                        {log.map((line, i) => (<React.Fragment key={i}>&gt; {line}<br /></React.Fragment>))}
                    </p>
                    {left !== null && (
                        <p role="status" className="text-zinc-500 font-mono text-xs">
                            &gt; Auto-retry in {left}s - press any key to cancel
                        </p>
                    )}
                </div>

                <div className="pt-4 flex flex-wrap gap-4 justify-center">{actions}</div>
            </div>
        </main>
    );
}
