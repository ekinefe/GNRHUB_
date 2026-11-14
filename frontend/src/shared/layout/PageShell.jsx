import React from 'react';

// The page container: centred, with no box or border around the content.
// Every page uses the same width as the header and footer (1536px) so the content lines up with the logo.
// Long text keeps its own line length inside (max-w-2xl / max-w-3xl), left-aligned.
export default function PageShell({ children }) {
    return (
        <div className="min-h-screen text-cyber-text flex justify-center">
            <div className="max-w-screen-2xl w-full min-h-screen px-4 md:px-10 py-8 relative">
                {children}
            </div>
        </div>
    );
}
