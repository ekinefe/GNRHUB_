import React, { useEffect, useRef } from 'react';

// A thin accent line along the bottom edge of the header that fills as you read down the page (GNR-56).
// It writes the width straight to the element from a requestAnimationFrame-throttled passive scroll listener, so a scroll
// never causes a React render. It is information, not decoration, so it also shows with reduced effects, but without a transition.
const ScrollProgress = () => {
    const bar = useRef(null);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const el = document.documentElement;
            const room = el.scrollHeight - el.clientHeight;
            const done = room > 0 ? Math.min(1, Math.max(0, window.scrollY / room)) : 0;
            if (bar.current) bar.current.style.transform = `scaleX(${done})`;
        };
        const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        return () => {
            window.removeEventListener('scroll', queue);
            window.removeEventListener('resize', queue);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div aria-hidden="true" data-testid="scroll-progress" className="absolute left-0 bottom-[-1px] h-[2px] w-full pointer-events-none">
            <div ref={bar} className="h-full w-full origin-left bg-cyber-pink will-change-transform" style={{ transform: 'scaleX(0)' }} />
        </div>
    );
};

export default ScrollProgress;
