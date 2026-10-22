import React from 'react';

const WIDTHS = {
    '5xl': { max: 'max-w-6xl', pad: 'px-4 md:px-10 py-8' },
    '7xl': { max: 'max-w-screen-2xl', pad: 'px-4 md:px-10 py-8' },
};

// The page container: centred, wide, no box or border. The graph paper from <body> runs behind the whole page.
// A soft side fade (no hard edge) keeps text readable over the grid lines without a column around the content.
// width: "5xl" for text pages (about 1150px), "7xl" for Home and anything that uses the full width (about 1536px).
export default function PageShell({ width = '5xl', children }) {
    const { max, pad } = WIDTHS[width];
    return (
        <div className="min-h-screen text-cyber-text flex justify-center">
            <div className={`${max} w-full min-h-screen ${pad} relative [background:linear-gradient(90deg,transparent,rgb(var(--cyber-black)/0.9)_8%,rgb(var(--cyber-black)/0.9)_92%,transparent)]`}>
                {children}
            </div>
        </div>
    );
}
