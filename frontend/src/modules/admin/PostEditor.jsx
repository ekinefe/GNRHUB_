import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2 } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import Textarea from '@/shared/ui/Textarea';
import Markdown from '@/shared/lib/markdown/Markdown';
import { slugify } from '@/shared/lib/slugify';
import { adminFetch } from './api';

const EMPTY = { title: '', slug: '', summary: '', tags: '', status: 'draft', body: '' };
const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft: only here in the admin panel' },
    { value: 'private', label: 'Private: my notebook, never on the public site' },
    { value: 'public', label: 'Public: listed on the blog' },
];

// One post: a plain form and a live preview. The slug follows the title until you edit it yourself.
const PostEditor = () => {
    const { id } = useParams();
    const isNew = id === undefined;
    const navigate = useNavigate();
    const [values, setValues] = useState(EMPTY);
    const [slugTouched, setSlugTouched] = useState(!isNew);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ kind: '', text: '' });
    const [load, setLoad] = useState(isNew ? 'ready' : 'loading');
    const [saving, setSaving] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (isNew) return undefined;
        let alive = true;
        adminFetch(`/api/admin/posts/${id}`).then((res) => {
            if (!alive) return;
            if (res.ok && res.data?.post) {
                const p = res.data.post;
                setValues({ title: p.title, slug: p.slug, summary: p.summary, tags: p.tags.join(', '), status: p.status, body: p.body });
                setLoad('ready');
            } else setLoad(res.status === 404 ? 'missing' : 'error');
        });
        return () => { alive = false; };
    }, [id, isNew]);

    const set = (field) => (e) => {
        const value = e.target.value;
        setValues((v) => ({ ...v, [field]: value, ...(field === 'title' && !slugTouched ? { slug: slugify(value) } : {}) }));
        setMessage({ kind: '', text: '' });
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setMessage({ kind: '', text: '' });
        const res = await adminFetch(isNew ? '/api/admin/posts' : `/api/admin/posts/${id}`, { method: 'POST', body: isNew ? values : { action: 'save', ...values } });
        setSaving(false);
        if (res.ok) {
            if (isNew && res.data?.id) navigate(`/admin/posts/${res.data.id}`, { replace: true });
            else setMessage({ kind: 'ok', text: 'Saved.' });
            return;
        }
        if ((res.status === 400 || res.status === 409) && res.data?.errors) setErrors(res.data.errors);
        else setMessage({ kind: 'error', text: res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'Could not save. Try again.' });
    };

    const remove = async () => {
        const res = await adminFetch(`/api/admin/posts/${id}`, { method: 'POST', body: { action: 'delete' } });
        if (res.ok) navigate('/admin/posts', { replace: true });
        else { setConfirming(false); setMessage({ kind: 'error', text: 'Could not delete. Try again.' }); }
    };

    if (load === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading post...</p>;
    if (load === 'missing') return <p className="font-mono text-cyber-muted">That post does not exist. <Link className="text-cyber-pink underline" to="/admin/posts">Back to the list</Link></p>;
    if (load === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the post.</p>;

    return (
        <form onSubmit={save} noValidate className="space-y-6" aria-labelledby="post-editor-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="post-editor-title" className="font-mono text-xl text-white">{isNew ? 'New post' : 'Edit post'}</h2>
                <Link to="/admin/posts" className="font-mono text-sm text-cyber-muted hover:text-cyber-pink">Back to the list</Link>
            </div>

            <Input label="Title" name="title" value={values.title} onChange={set('title')} error={errors.title} required maxLength={150} />
            <div className="grid gap-6 md:grid-cols-2">
                <Input label="Address" name="slug" value={values.slug} onChange={(e) => { setSlugTouched(true); set('slug')(e); }} error={errors.slug} hint={`/blog/${values.slug || '...'}`} maxLength={80} />
                <Select label="Who can see it" name="status" value={values.status} onChange={set('status')} error={errors.status} options={STATUS_OPTIONS} />
            </div>
            <Input label="Summary" name="summary" value={values.summary} onChange={set('summary')} error={errors.summary} hint="One or two sentences shown in the list." maxLength={300} />
            <Input label="Tags" name="tags" value={values.tags} onChange={set('tags')} error={errors.tags} hint="Separated by commas, for example linux, cron, notes." />

            <div className="grid gap-6 lg:grid-cols-2">
                <Textarea label="Text (Markdown)" name="body" rows={20} className="font-mono text-sm" value={values.body} onChange={set('body')} error={errors.body} hint="# Heading, **bold**, *italic*, `code`, [link](https://...), - lists, > quotes, ``` code blocks." />
                <div>
                    <p className="font-mono text-xs text-cyber-muted mb-2">Preview</p>
                    <div className="border border-cyber-border p-4 min-h-[16rem] overflow-x-auto" data-testid="preview">
                        <Markdown source={values.body} />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <CyberButton type="submit" icon={Save} disabled={saving}>{saving ? 'Saving' : 'Save'}</CyberButton>
                {!isNew && (confirming ? (
                    <span className="flex items-center gap-3 font-mono text-sm text-cyber-muted">
                        Delete this post for good?
                        <CyberButton type="button" variant="alert" onClick={remove}>Yes, delete</CyberButton>
                        <CyberButton type="button" variant="ghost" onClick={() => setConfirming(false)}>Keep</CyberButton>
                    </span>
                ) : (
                    <CyberButton type="button" variant="ghost" icon={Trash2} onClick={() => setConfirming(true)}>Delete</CyberButton>
                ))}
                {message.text && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`font-mono text-sm ${message.kind === 'error' ? 'text-cyber-offline' : 'text-cyber-success'}`}>{message.text}</p>}
            </div>
        </form>
    );
};

export default PostEditor;
