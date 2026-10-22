import React from 'react';

const WIDTHS = {
    '5xl': { max: 'max-w-5xl', pad: 'p-8' },
    '7xl': { max: 'max-w-7xl', pad: 'p-4 md:p-8' },
};

// The grid background plus the bordered centre column every page sits in.
// width: "5xl" for text pages, "7xl" for pages with a sidebar.
export default function PageShell({ width = '5xl', children }) {
    const { max, pad } = WIDTHS[width];
    return (
        <div className="min-h-screen bg-cyber-black bg-grid-pattern bg-grid text-cyber-text p-4 md:p-16 lg:p-24 flex justify-center">
            <div className={`${max} w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen ${pad} shadow-2xl relative`}>
                {children}
            </div>
        </div>
    );
}
