import React, { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Badge from '@/shared/ui/Badge';
import LoadingLine from '@/shared/animations/LoadingLine';
import { adminFetch } from './api';

const when = (seconds) => new Date(seconds * 1000).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const KIND = { problem: 'Problem', idea: 'Idea', other: 'Other' };

// Reports from the "Report a problem" page (GNR-148). Shown as plain text; the address is optional.
const AdminFeedback = () => {
    const [state, setState] = useState({ status: 'loading', feedback: [], unread: 0 });
    const [open, setOpen] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [problem, setProblem] = useState('');

    const load = useCallback(async () => {
        const res = await adminFetch('/api/admin/feedback');
        setState(res.ok && Array.isArray(res.data?.feedback) ? { status: 'ready', feedback: res.data.feedback, unread: res.data.unread } : { status: 'error', feedback: [], unread: 0 });
    }, []);
    useEffect(() => { load(); }, [load]);

    const act = async (id, action) => {
        setProblem('');
        const res = await adminFetch(`/api/admin/feedback/${id}`, { method: 'POST', body: { action } });
        if (!res.ok) setProblem(res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'That did not work. Try again.');
        setConfirming(null);
        if (action === 'delete' && open === id) setOpen(null);
        await load();
    };
    const toggle = (f) => {
        setOpen(open === f.id ? null : f.id);
        if (!f.read && open !== f.id) act(f.id, 'read');
    };

    if (state.status === 'loading') return <LoadingLine>Loading feedback...</LoadingLine>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the feedback. The database may not be set up yet (docs/database.md).</p>;

    return (
        <section aria-labelledby="feedback-title" className="space-y-4">
            <h2 id="feedback-title" className="font-mono text-xl text-white">Feedback <span className="text-cyber-muted text-sm">({state.unread} unread)</span></h2>
            {problem && <p role="alert" className="font-mono text-sm text-cyber-offline">{problem}</p>}
            {state.feedback.length === 0 && <p className="font-mono text-cyber-muted">No feedback yet. Reports from the "Report a problem" link in the footer appear here.</p>}
            <ul className="divide-y divide-cyber-border border border-cyber-border">
                {state.feedback.map((f) => (
                    <li key={f.id} className={f.read ? '' : 'bg-cyber-panel'}>
                        <button type="button" onClick={() => toggle(f)} aria-expanded={open === f.id} className="w-full text-left px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                            <Badge>{KIND[f.kind] ?? f.kind}</Badge>
                            <span className={`font-mono text-sm flex-1 min-w-0 truncate ${f.read ? 'text-cyber-muted' : 'text-white font-bold'}`}>{f.message}</span>
                            {f.page && <span className="font-mono text-xs text-cyber-muted">{f.page}</span>}
                            <span className="font-mono text-xs text-cyber-muted">{when(f.createdAt)}</span>
                            {!f.read && <span className="font-mono text-xs text-cyber-pink">new</span>}
                        </button>
                        {open === f.id && (
                            <div className="px-4 pb-4 space-y-4">
                                <p className="font-mono text-xs text-cyber-muted">{f.email ? <>From <a href={`mailto:${f.email}`} className="text-cyber-cyan hover:underline">{f.email}</a></> : 'Anonymous'}</p>
                                <p className="font-mono text-sm text-cyber-text whitespace-pre-wrap break-words max-w-3xl">{f.message}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {f.email && <a href={`mailto:${f.email}?subject=${encodeURIComponent('Your report on the site')}`}><CyberButton variant="secondary" icon={Mail}>Reply</CyberButton></a>}
                                    <CyberButton variant="ghost" icon={MailOpen} onClick={() => act(f.id, 'unread')}>Mark unread</CyberButton>
                                    {confirming === f.id ? (
                                        <span className="flex items-center gap-3 font-mono text-sm text-cyber-muted">
                                            Delete this report?
                                            <CyberButton variant="alert" onClick={() => act(f.id, 'delete')}>Yes, delete</CyberButton>
                                            <CyberButton variant="ghost" onClick={() => setConfirming(null)}>Keep</CyberButton>
                                        </span>
                                    ) : (
                                        <CyberButton variant="ghost" icon={Trash2} onClick={() => setConfirming(f.id)}>Delete</CyberButton>
                                    )}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AdminFeedback;
