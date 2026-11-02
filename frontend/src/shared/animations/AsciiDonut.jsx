import React, { useEffect, useRef } from 'react';
import { useInView } from '@/shared/hooks/useInView';
import { effectsReduced, useReducedEffects } from '@/shared/config/effects';
import { donutFrame } from './donutFrame';

// The spinning ASCII donut (a torus lit from one side, drawn with characters of rising brightness).
// The one moving thing on Home. Decorative: hidden from assistive tech, still under reduced effects
// (one frame), paused while off screen or in a hidden tab.
const AsciiDonut = ({ className = '' }) => {
    const pre = useRef(null);
    const [wrap, inView] = useInView();
    const reduced = useReducedEffects();

    useEffect(() => {
        const el = pre.current;
        if (!el) return undefined;
        el.textContent = donutFrame(1, 0.6);
        if (reduced || effectsReduced() || !inView) return undefined;

        let A = 1, B = 0.6, raf = 0, last = 0;
        const tick = (now) => {
            raf = requestAnimationFrame(tick);
            if (document.hidden || now - last < 40) return; // about 25 frames a second
            last = now;
            A += 0.035;
            B += 0.02;
            el.textContent = donutFrame(A, B);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [reduced, inView]);

    return (
        <div ref={wrap} aria-hidden="true" className={className}>
            <pre ref={pre} data-testid="ascii-donut" className="font-mono text-cyber-pink text-[11px] leading-[1.05] select-none whitespace-pre text-center" />
        </div>
    );
};

export default AsciiDonut;
