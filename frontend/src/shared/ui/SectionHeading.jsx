import React from 'react';

// One heading style for the sections inside a page: "// TITLE", an optional path-like line under it,
// and an optional action (a link or button) on the right. Write the title in plain words; it is shown uppercase.
//
//   id      put the same id in the section's aria-labelledby
//   path    optional muted line, e.g. "/projects/featured"
//   action  optional element shown on the right from md up
export default function SectionHeading({ id, title, path, action, className = 'mb-8' }) {
    return (
        <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${className}`}>
            <div className="min-w-0">
                <h2 id={id} className="text-2xl font-mono font-bold text-white uppercase tracking-wider flex items-center gap-3 [overflow-wrap:anywhere]">
                    <span aria-hidden="true" className="text-cyber-pink">//</span>
                    <span>{title}</span>
                </h2>
                {path && <p className="mt-2 font-mono text-cyber-muted text-sm">{path}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
