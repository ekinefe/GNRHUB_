import React, { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import { adminFetch } from './api';

const when = (seconds) => new Date(seconds * 1000).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

// Contact messages (ADR 0009). Everything shown is plain text; the address becomes a mailto link only because the
// server already checked that it looks like an address.
const AdminMessages = () => {
    const [state, setState] = useState({ status: 'loading', messages: [], unread: 0 });
    const [open, setOpen] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [problem, setProblem] = useState('');

    const load = useCallback(async () => {
        const res = await adminFetch('/api/admin/messages');
        if (res.ok && Array.isArray(res.data?.messages)) setState({ status: 'ready', messages: res.data.messages, unread: res.data.unread });
        else setState({ status: 'error', messages: [], unread: 0 });
    }, []);
    useEffect(() => { load(); }, [load]);

    const act = async (id, action) => {
        setProblem('');
        const res = await adminFetch(`/api/admin/messages/${id}`, { method: 'POST', body: { action } });
        if (!res.ok) setProblem(res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'That did not work. Try again.');
        setConfirming(null);
        if (action === 'delete' && open === id) setOpen(null);
        await load();
    };

    const toggle = (m) => {
        setOpen(open === m.id ? null : m.id);
        if (!m.read && open !== m.id) act(m.id, 'read');
    };

    if (state.status === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading messages...</p>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the messages. The database may not be set up yet (docs/database.md).</p>;

    return (
        <section aria-labelledby="messages-title" className="space-y-4">
            <h2 id="messages-title" className="font-mono text-xl text-white">Messages <span className="text-cyber-muted text-sm">({state.unread} unread)</span></h2>
            {problem && <p role="alert" className="font-mono text-sm text-cyber-offline">{problem}</p>}
            {state.messages.length === 0 && <p className="font-mono text-cyber-muted">No messages yet. They appear here when someone uses the contact form.</p>}
            <ul className="divide-y divide-cyber-border border border-cyber-border">
                {state.messages.map((m) => (
                    <li key={m.id} className={m.read ? '' : 'bg-cyber-panel'}>
                        <button type="button" onClick={() => toggle(m)} aria-expanded={open === m.id} className="w-full text-left px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                            <span className={`font-mono text-sm ${m.read ? 'text-cyber-muted' : 'text-white font-bold'}`}>{m.name}</span>
                            <span className="font-mono text-sm text-cyber-text flex-1 min-w-0 truncate">{m.subject || '(no subject)'}</span>
                            <span className="font-mono text-xs text-cyber-muted">{when(m.createdAt)}</span>
                            {!m.read && <span className="font-mono text-xs text-cyber-pink">new</span>}
                        </button>
                        {open === m.id && (
                            <div className="px-4 pb-4 space-y-4">
                                <p className="font-mono text-xs text-cyber-muted">From <a href={`mailto:${m.email}`} className="text-cyber-cyan hover:underline">{m.email}</a></p>
                                <p className="font-mono text-sm text-cyber-text whitespace-pre-wrap break-words max-w-3xl">{m.message}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <a href={`mailto:${m.email}${m.subject ? `?subject=${encodeURIComponent(`Re: ${m.subject}`)}` : ''}`}><CyberButton variant="secondary" icon={Mail}>Reply</CyberButton></a>
                                    <CyberButton variant="ghost" icon={MailOpen} onClick={() => act(m.id, 'unread')}>Mark unread</CyberButton>
                                    {confirming === m.id ? (
                                        <span className="flex items-center gap-3 font-mono text-sm text-cyber-muted">
                                            Delete this message?
                                            <CyberButton variant="alert" onClick={() => act(m.id, 'delete')}>Yes, delete</CyberButton>
                                            <CyberButton variant="ghost" onClick={() => setConfirming(null)}>Keep</CyberButton>
                                        </span>
                                    ) : (
                                        <CyberButton variant="ghost" icon={Trash2} onClick={() => setConfirming(m.id)}>Delete</CyberButton>
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

export default AdminMessages;
