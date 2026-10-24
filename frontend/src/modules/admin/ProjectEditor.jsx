import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2 } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import Textarea from '@/shared/ui/Textarea';
import Checkbox from '@/shared/ui/Checkbox';
import { slugify } from '@/shared/lib/slugify';
import { adminFetch } from './api';
import { fromApi } from './projectForm';

const EMPTY = { name: '', slug: '', grp: 'project', kind: 'Web app', summary: '', tech: '', points: '', status: 'live', repo: '', url: '', image: '', imageAlt: '', caseStudy: '', learned: '', featured: false, inAbout: false, sort: 100 };
const GROUPS = [{ value: 'project', label: 'Project: in the main list' }, { value: 'tool', label: 'Tool: a separate project, shown in its own block' }];
const STATUSES = [{ value: 'live', label: 'Live: it works today' }, { value: 'soon', label: 'Soon: planned, shown as coming soon' }, { value: 'paused', label: 'Paused: on hold' }];
const KINDS = ['Web app', 'Platform', 'Hardware', 'CLI', 'Desktop', 'Tool'];

// One project: a plain form. The address (slug) follows the name until you edit it yourself.
const ProjectEditor = () => {
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
        adminFetch(`/api/admin/projects/${id}`).then((res) => {
            if (!alive) return;
            if (res.ok && res.data?.project) {
                setValues(fromApi(res.data.project));
                setLoad('ready');
            } else setLoad(res.status === 404 ? 'missing' : 'error');
        });
        return () => { alive = false; };
    }, [id, isNew]);

    const set = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setValues((v) => ({ ...v, [field]: value, ...(field === 'name' && !slugTouched ? { slug: slugify(value, 60) } : {}) }));
        setMessage({ kind: '', text: '' });
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setMessage({ kind: '', text: '' });
        const res = await adminFetch(isNew ? '/api/admin/projects' : `/api/admin/projects/${id}`, { method: 'POST', body: isNew ? values : { action: 'save', ...values } });
        setSaving(false);
        if (res.ok) {
            if (isNew && res.data?.id) navigate(`/admin/projects/${res.data.id}`, { replace: true });
            else setMessage({ kind: 'ok', text: 'Saved. The site shows it within a minute.' });
            return;
        }
        if ((res.status === 400 || res.status === 409) && res.data?.errors) setErrors(res.data.errors);
        else setMessage({ kind: 'error', text: res.status === 401 ? 'You were signed out. Reload the page and sign in again.' : 'Could not save. Try again.' });
    };

    const remove = async () => {
        const res = await adminFetch(`/api/admin/projects/${id}`, { method: 'POST', body: { action: 'delete' } });
        if (res.ok) navigate('/admin/projects', { replace: true });
        else { setConfirming(false); setMessage({ kind: 'error', text: 'Could not delete. Try again.' }); }
    };

    if (load === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading project...</p>;
    if (load === 'missing') return <p className="font-mono text-cyber-muted">That project does not exist. <Link className="text-cyber-pink underline" to="/admin/projects">Back to the list</Link></p>;
    if (load === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the project.</p>;

    return (
        <form onSubmit={save} noValidate className="space-y-6 max-w-3xl" aria-labelledby="project-editor-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="project-editor-title" className="font-mono text-xl text-white">{isNew ? 'New project' : 'Edit project'}</h2>
                <Link to="/admin/projects" className="font-mono text-sm text-cyber-muted hover:text-cyber-pink">Back to the list</Link>
            </div>

            <Input label="Name" name="name" value={values.name} onChange={set('name')} error={errors.name} required maxLength={80} />
            <div className="grid gap-6 md:grid-cols-2">
                <Input label="Address" name="slug" value={values.slug} onChange={(e) => { setSlugTouched(true); set('slug')(e); }} error={errors.slug} hint="A short unique name, used as the key." maxLength={60} />
                <Select label="Where it goes" name="grp" value={values.grp} onChange={set('grp')} error={errors.grp} options={GROUPS} />
                <Select label="Kind" name="kind" value={KINDS.includes(values.kind) ? values.kind : ''} onChange={set('kind')} error={errors.kind} options={KINDS.includes(values.kind) ? KINDS : [{ value: '', label: values.kind || 'Choose' }, ...KINDS]} />
                <Select label="Status" name="status" value={values.status} onChange={set('status')} error={errors.status} options={STATUSES} />
            </div>
            <Textarea label="Summary" name="summary" rows={2} value={values.summary} onChange={set('summary')} error={errors.summary} hint="One sentence shown on the cards." maxLength={300} />
            <Input label="Technologies" name="tech" value={values.tech} onChange={set('tech')} error={errors.tech} hint="Separated by commas, for example React, TypeScript, D1." />
            <Textarea label="Points" name="points" rows={4} value={values.points} onChange={set('points')} error={errors.points} hint="One point per line, up to 6." />
            <div className="grid gap-6 md:grid-cols-2">
                <Input label="Source code" name="repo" value={values.repo} onChange={set('repo')} error={errors.repo} hint="A https:// address. Empty means a private repository." />
                <Input label="Live site" name="url" value={values.url} onChange={set('url')} error={errors.url} hint="A https:// address, or empty." />
                <Input label="Screenshot" name="image" value={values.image} onChange={set('image')} error={errors.image} hint="A file in the site, for example /projects/my-project.png (put the file in frontend/public/projects/)." />
                <Input label="Screenshot description" name="imageAlt" value={values.imageAlt} onChange={set('imageAlt')} error={errors.imageAlt} hint="For people who cannot see the image." />
                <Input label="Case study page" name="caseStudy" value={values.caseStudy} onChange={set('caseStudy')} error={errors.caseStudy} hint="A page of this site, for example /colophon, or empty." />
                <Input label="Order" name="sort" type="number" value={values.sort} onChange={set('sort')} error={errors.sort} hint="Smaller comes first." />
            </div>
            <Textarea label="What I learned" name="learned" rows={2} value={values.learned} onChange={set('learned')} error={errors.learned} hint="Optional, one or two sentences." />
            <div className="flex flex-wrap gap-8">
                <Checkbox label="Show on the Home page" name="featured" checked={values.featured} onChange={set('featured')} />
                <Checkbox label="Show on the About page" name="inAbout" checked={values.inAbout} onChange={set('inAbout')} />
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <CyberButton type="submit" icon={Save} disabled={saving}>{saving ? 'Saving' : 'Save'}</CyberButton>
                {!isNew && (confirming ? (
                    <span className="flex items-center gap-3 font-mono text-sm text-cyber-muted">
                        Delete this project for good?
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

export default ProjectEditor;
