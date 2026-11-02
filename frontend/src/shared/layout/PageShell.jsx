import React from 'react';

const WIDTHS = {
    '5xl': { max: 'max-w-6xl', pad: 'px-4 md:px-10 py-8' },
    '7xl': { max: 'max-w-screen-2xl', pad: 'px-4 md:px-10 py-8' },
};

// The page container: centred and wide, with no box or border around the content.
// width: "5xl" for text pages (about 1150px), "7xl" for Home and anything that uses the full width (about 1536px).
export default function PageShell({ width = '5xl', children }) {
    const { max, pad } = WIDTHS[width];
    return (
        <div className="min-h-screen text-cyber-text flex justify-center">
            <div className={`${max} w-full min-h-screen ${pad} relative`}>
                {children}
            </div>
        </div>
    );
}
