import React, { useEffect, useState } from 'react';
import LoadingLine from '@/shared/animations/LoadingLine';
import { adminFetch } from './api';

const short = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// Page views (GNR-82): the last 30 days and the most opened pages. Counts only; nothing about visitors is stored.
const AdminVisits = () => {
    const [state, setState] = useState({ status: 'loading', data: null });
    useEffect(() => {
        let live = true;
        adminFetch('/api/admin/analytics').then((res) => {
            if (live) setState(res.ok && Array.isArray(res.data?.days) ? { status: 'ready', data: res.data } : { status: 'error', data: null });
        });
        return () => { live = false; };
    }, []);

    if (state.status === 'loading') return <LoadingLine>Loading visits...</LoadingLine>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the visits. The database may not be set up yet (docs/database.md).</p>;

    const { days, total, top } = state.data;
    const peak = Math.max(1, ...days.map((d) => d.views));
    return (
        <section aria-labelledby="visits-title" className="space-y-6">
            <h2 id="visits-title" className="font-mono text-xl text-white">Visits</h2>
            <p className="font-mono text-sm text-cyber-muted max-w-3xl">How many times each page was opened. Only the page and the day are counted: no address, no cookie, nothing about the visitor. Browsers that send Do Not Track are not counted, so the real number is a little higher.</p>
            <p className="font-mono"><span className="text-3xl text-white">{total}</span> <span className="text-sm text-cyber-muted">{total === 1 ? 'view' : 'views'} in the last 30 days</span></p>
            {total === 0 ? (
                <p className="font-mono text-sm text-cyber-muted">No visits yet. They appear here once someone opens a page of the live site.</p>
            ) : (
                <>
                    <ol aria-label="Views per day" className="flex items-end gap-1 h-32 border-b border-cyber-border">
                        {days.map((d) => (
                            <li key={d.day} className="flex-1 flex flex-col justify-end h-full" title={`${short(d.day)}: ${d.views}`}>
                                <span className="block bg-cyber-cyan" style={{ height: `${(d.views / peak) * 100}%` }} />
                                <span className="sr-only">{short(d.day)}: {d.views}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="max-w-3xl">
                        <h3 className="font-mono text-sm text-cyber-cyan mb-2">Most opened pages</h3>
                        <ul className="divide-y divide-cyber-border/60 border border-cyber-border">
                            {top.map((p) => (
                                <li key={p.path} className="flex items-baseline justify-between gap-4 px-4 py-2 font-mono text-sm">
                                    <span className="text-cyber-text truncate">{p.path}</span>
                                    <span className="text-white">{p.views}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </section>
    );
};

export default AdminVisits;
