import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Badge from '@/shared/ui/Badge';
import Input from '@/shared/ui/Input';
import Checkbox from '@/shared/ui/Checkbox';
import LoadingLine from '@/shared/animations/LoadingLine';
import { adminFetch } from './api';

const EMPTY = { slug: '', target: '', permanent: false };

// Short links (GNR-147): /r/<name> sends a visitor to an address. One screen: the list, and a form for a new or chosen link.
const AdminRedirects = () => {
    const [state, setState] = useState({ status: 'loading', redirects: [] });
    const [editing, setEditing] = useState(null); // null, or { id?: number, values }
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ kind: '', text: '' });
    const [saving, setSaving] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const load = useCallback(async () => {
        const res = await adminFetch('/api/admin/redirects');
        setState(res.ok && Array.isArray(res.data?.redirects) ? { status: 'ready', redirects: res.data.redirects } : { status: 'error', redirects: [] });
    }, []);
    useEffect(() => { load(); }, [load]);

    const open = (next) => { setEditing(next); setErrors({}); setMessage({ kind: '', text: '' }); setConfirming(false); };
    const set = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditing((cur) => ({ ...cur, values: { ...cur.values, [field]: value } }));
        setMessage({ kind: '', text: '' });
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        const { id, values } = editing;
        const res = await adminFetch(id ? `/api/admin/redirects/${id}` : '/api/admin/redirects', { method: 'POST', body: id ? { action: 'save', ...values } : values });
        setSaving(false);
        if (res.ok) {
            setEditing(null);
            setMessage({ kind: 'ok', text: 'Saved.' });
            load();
        } else if ((res.status === 400 || res.status === 409) && res.data?.errors) setErrors(res.data.errors);
        else setMessage({ kind: 'error', text: res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'Could not save. Try again.' });
    };

    const remove = async () => {
        const res = await adminFetch(`/api/admin/redirects/${editing.id}`, { method: 'POST', body: { action: 'delete' } });
        if (res.ok) { setEditing(null); setMessage({ kind: 'ok', text: 'Deleted.' }); load(); }
        else { setConfirming(false); setMessage({ kind: 'error', text: 'Could not delete. Try again.' }); }
    };

    if (state.status === 'loading') return <LoadingLine>Loading short links...</LoadingLine>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the short links. The database may not be set up yet (docs/database.md).</p>;

    return (
        <section aria-labelledby="redirects-title" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="redirects-title" className="font-mono text-xl text-white">Short links</h2>
                <CyberButton icon={Plus} onClick={() => open({ values: EMPTY })}>New link</CyberButton>
            </div>
            <p className="font-mono text-sm text-cyber-muted max-w-3xl">A short link such as <code>/r/cv</code> sends the visitor on to another address, so a link on a CV or a QR code keeps working when the address behind it changes. Use "permanent" only when you will never change it: browsers remember it.</p>
            {message.text && !editing && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`font-mono text-sm ${message.kind === 'error' ? 'text-cyber-offline' : 'text-cyber-success'}`}>{message.text}</p>}

            {editing && (
                <form onSubmit={save} noValidate aria-label={editing.id ? 'Edit link' : 'New link'} className="space-y-6 max-w-3xl border border-cyber-border p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Input label="Short name" name="slug" value={editing.values.slug} onChange={set('slug')} error={errors.slug} hint="Becomes /r/name. Lower-case letters, digits and hyphens." maxLength={60} />
                        <Input label="Goes to" name="target" value={editing.values.target} onChange={set('target')} error={errors.target} hint="A https:// address, or a page of this site such as /about." maxLength={300} />
                    </div>
                    <Checkbox label="Permanent (301, browsers remember it)" name="permanent" checked={editing.values.permanent} onChange={set('permanent')} />
                    <div className="flex flex-wrap items-center gap-4">
                        <CyberButton type="submit" icon={Save} disabled={saving}>{saving ? 'Saving' : 'Save'}</CyberButton>
                        <CyberButton type="button" variant="ghost" onClick={() => open(null)}>Cancel</CyberButton>
                        {editing.id && (confirming ? (
                            <span className="flex items-center gap-3 font-mono text-sm text-cyber-muted">
                                Delete this link for good?
                                <CyberButton type="button" variant="alert" onClick={remove}>Yes, delete</CyberButton>
                                <CyberButton type="button" variant="ghost" onClick={() => setConfirming(false)}>Keep</CyberButton>
                            </span>
                        ) : (
                            <CyberButton type="button" variant="ghost" icon={Trash2} onClick={() => setConfirming(true)}>Delete</CyberButton>
                        ))}
                        {message.text && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`font-mono text-sm ${message.kind === 'error' ? 'text-cyber-offline' : 'text-cyber-success'}`}>{message.text}</p>}
                    </div>
                </form>
            )}

            {state.redirects.length === 0 ? (
                <p className="border border-cyber-border p-6 font-mono text-sm text-cyber-muted">No short links yet. Add one, for example <code>cv</code> going to the address of your CV.</p>
            ) : (
                <ul className="border border-cyber-border divide-y divide-cyber-border/60">
                    {state.redirects.map((r) => (
                        <li key={r.id}>
                            <button type="button" onClick={() => open({ id: r.id, values: { slug: r.slug, target: r.target, permanent: r.permanent } })} className="w-full text-left px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 hover:bg-cyber-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                <span className="font-mono text-sm text-white">/r/{r.slug}</span>
                                <span className="font-mono text-xs text-cyber-muted break-all">{r.target}</span>
                                <Badge>{r.permanent ? '301' : '302'}</Badge>
                                <span className="font-mono text-xs text-cyber-muted">{r.clicks} {r.clicks === 1 ? 'visit' : 'visits'}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default AdminRedirects;
