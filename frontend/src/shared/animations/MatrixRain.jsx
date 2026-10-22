import React, { useEffect, useRef } from 'react';
import { tokenColor } from '@/shared/config/tokens';

// The Konami-code easter egg (GNR-58): falling characters over the page for a few seconds. Decorative and harmless:
// aria-hidden, it never blocks clicks or typing, Esc or any click ends it, and the caller does not mount it under
// "Reduce effects". Drawn on a canvas; if there is no canvas (tests, odd browsers) it simply does nothing.
const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ01{}[]<>/=+*#$GNR'.split('');
const SECONDS = 5;

const MatrixRain = ({ onDone }) => {
    const canvas = useRef(null);

    useEffect(() => {
        const el = canvas.current;
        const ctx = el?.getContext?.('2d');
        const finish = () => onDone?.();
        const stop = (e) => { if (e.type !== 'keydown' || e.key === 'Escape') finish(); };
        window.addEventListener('keydown', stop);
        window.addEventListener('pointerdown', stop);
        if (!ctx) {
            const t = setTimeout(finish, SECONDS * 1000);
            return () => { clearTimeout(t); window.removeEventListener('keydown', stop); window.removeEventListener('pointerdown', stop); };
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => { el.width = window.innerWidth * dpr; el.height = window.innerHeight * dpr; };
        resize();
        window.addEventListener('resize', resize);
        const size = 16 * dpr;
        const color = tokenColor('pink');
        const drops = Array.from({ length: Math.ceil(el.width / size) }, () => Math.random() * -50);
        const started = performance.now();
        let raf = 0, last = 0;

        const draw = (now) => {
            raf = requestAnimationFrame(draw);
            if (document.hidden || now - last < 50) return;
            last = now;
            const elapsed = (now - started) / 1000;
            if (elapsed > SECONDS) { finish(); return; }
            ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
            ctx.fillRect(0, 0, el.width, el.height);
            ctx.fillStyle = color;
            ctx.font = `${size}px monospace`;
            drops.forEach((y, i) => {
                ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * size, y * size);
                drops[i] = y * size > el.height && Math.random() > 0.975 ? 0 : y + 1;
            });
        };
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', stop);
            window.removeEventListener('pointerdown', stop);
            window.removeEventListener('resize', resize);
        };
    }, [onDone]);

    return <canvas ref={canvas} aria-hidden="true" data-testid="matrix-rain" className="fixed inset-0 z-[90] w-full h-full pointer-events-none bg-cyber-black/40" />;
};

export default MatrixRain;
