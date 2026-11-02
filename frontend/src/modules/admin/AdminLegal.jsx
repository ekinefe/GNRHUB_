import React, { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Textarea from '@/shared/ui/Textarea';
import Markdown from '@/shared/lib/markdown/Markdown';
import LoadingLine from '@/shared/animations/LoadingLine';
import { adminFetch } from './api';

const DOCS = [{ id: 'privacy', label: 'Privacy' }, { id: 'terms', label: 'Terms' }];
const when = (seconds) => new Date(seconds * 1000).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

// Privacy and Terms (GNR-161). Every save is a new version and the old ones stay. Until the first save the public pages
// show the text that ships with the site.
const AdminLegal = () => {
    const [doc, setDoc] = useState('privacy');
    const [state, setState] = useState({ status: 'loading', versions: [], current: null });
    const [values, setValues] = useState({ summary: '', body: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ kind: '', text: '' });
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);

    const load = useCallback(async (which, version) => {
        setState((s) => ({ ...s, status: 'loading' }));
        const res = await adminFetch(`/api/admin/legal/${which}${version ? `?version=${version}` : ''}`);
        if (!(res.ok && Array.isArray(res.data?.versions))) { setState({ status: 'error', versions: [], current: null }); return; }
        setState({ status: 'ready', versions: res.data.versions, current: res.data.current });
        setValues({ summary: res.data.current?.summary ?? '', body: res.data.current?.body ?? '' });
        setErrors({});
    }, []);
    useEffect(() => { load(doc); }, [doc, load]);

    const set = (field) => (e) => { setValues((v) => ({ ...v, [field]: e.target.value })); setMessage({ kind: '', text: '' }); };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        const res = await adminFetch(`/api/admin/legal/${doc}`, { method: 'POST', body: values });
        setSaving(false);
        if (res.ok) {
            setMessage({ kind: 'ok', text: res.data?.unchanged ? 'Nothing changed, so no new version was made.' : `Saved as version ${res.data.version}. The public page shows it within a minute.` });
            load(doc);
        } else if (res.status === 400 && res.data?.errors) setErrors(res.data.errors);
        else setMessage({ kind: 'error', text: res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'Could not save. Try again.' });
    };

    const newest = state.versions[0]?.version;
    return (
        <section aria-labelledby="legal-title" className="space-y-6">
            <h2 id="legal-title" className="font-mono text-xl text-white">Legal texts</h2>
            <div role="tablist" aria-label="Document" className="flex gap-2 font-mono text-sm">
                {DOCS.map((d) => (
                    <button key={d.id} type="button" role="tab" aria-selected={doc === d.id} onClick={() => { setDoc(d.id); setMessage({ kind: '', text: '' }); }} className={`px-3 py-1 border transition-colors ${doc === d.id ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5' : 'border-cyber-border text-cyber-muted hover:border-cyber-text'}`}>{d.label}</button>
                ))}
            </div>
            {state.status === 'loading' && <LoadingLine>Loading...</LoadingLine>}
            {state.status === 'error' && <p role="alert" className="font-mono text-cyber-offline">Could not load the text. The database may not be set up yet (docs/database.md).</p>}
            {state.status === 'ready' && (
                <>
                    <p className="font-mono text-sm text-cyber-muted max-w-3xl">
                        {newest ? <>The public page shows version {newest}. Every save adds a version; old ones stay.</> : <>No version saved yet, so the public page shows the text that ships with the site. Saving here replaces it.</>} Write in Markdown. Start with the plain-language summary people read first.
                    </p>
                    <form onSubmit={save} noValidate aria-label={`Edit ${doc}`} className="space-y-5 max-w-3xl">
                        <Textarea label="Plain-language summary" name="summary" rows={3} value={values.summary} onChange={set('summary')} error={errors.summary} maxLength={500} hint="Two or three sentences, shown above the full text." />
                        <Textarea label="Full text (Markdown)" name="body" rows={16} value={values.body} onChange={set('body')} error={errors.body} maxLength={30000} />
                        {message.text && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`font-mono text-sm ${message.kind === 'error' ? 'text-cyber-offline' : 'text-cyber-success'}`}>{message.text}</p>}
                        <div className="flex flex-wrap items-center gap-4">
                            <CyberButton type="submit" icon={Save} disabled={saving}>{saving ? 'Saving' : 'Save as new version'}</CyberButton>
                            <CyberButton type="button" variant="ghost" onClick={() => setPreview((p) => !p)}>{preview ? 'Hide preview' : 'Preview'}</CyberButton>
                        </div>
                    </form>
                    {preview && (
                        <div aria-label="Preview" className="max-w-3xl border border-cyber-border p-6 font-mono text-sm text-cyber-muted space-y-3">
                            <p className="text-white">Short version: {values.summary}</p>
                            <Markdown source={values.body} />
                        </div>
                    )}
                    {state.versions.length > 0 && (
                        <div className="max-w-3xl">
                            <h3 className="font-mono text-sm text-cyber-cyan mb-2">Versions</h3>
                            <ul className="divide-y divide-cyber-border/60 border border-cyber-border">
                                {state.versions.map((v) => (
                                    <li key={v.version} className="flex items-center justify-between gap-4 px-4 py-2 font-mono text-sm">
                                        <span className="text-cyber-text">Version {v.version} <span className="text-cyber-muted text-xs">{when(v.createdAt)}</span></span>
                                        <button type="button" onClick={() => load(doc, v.version)} className="text-xs text-cyber-pink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">Load into the editor</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default AdminLegal;
