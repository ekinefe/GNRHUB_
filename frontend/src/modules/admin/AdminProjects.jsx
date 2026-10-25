import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Badge from '@/shared/ui/Badge';
import { projects as builtIn, toolProjects as builtInTools } from '@/shared/content/projects';
import { adminFetch } from './api';
import ProjectEditor from './ProjectEditor';
import { fromBuiltIn } from './projectForm';

const TONE = { live: 'success', soon: 'cyan', paused: undefined };

const ProjectList = () => {
    const [state, setState] = useState({ status: 'loading', projects: [] });
    const [importing, setImporting] = useState(false);
    const [problem, setProblem] = useState('');
    const load = async () => {
        const res = await adminFetch('/api/admin/projects');
        setState(res.ok && Array.isArray(res.data?.projects) ? { status: 'ready', projects: res.data.projects } : { status: 'error', projects: [] });
    };
    useEffect(() => { load(); }, []);

    // Copies the list built into the site into the database, so you can edit it. Projects whose address already exists are skipped.
    const importBuiltIn = async () => {
        setImporting(true);
        setProblem('');
        const all = [...builtIn.map((p) => [p, 'project']), ...builtInTools.map((p) => [p, 'tool'])];
        let failed = 0;
        for (const [i, [p, grp]] of all.entries()) {
            const res = await adminFetch('/api/admin/projects', { method: 'POST', body: fromBuiltIn(p, grp, (i + 1) * 10) });
            if (!res.ok && res.status !== 409) failed += 1;
        }
        setImporting(false);
        if (failed) setProblem(`${failed} of ${all.length} could not be imported. Try again.`);
        load();
    };

    if (state.status === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading projects...</p>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the projects. The database may not be set up yet (docs/database.md).</p>;
    return (
        <section aria-labelledby="projects-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="projects-title" className="font-mono text-xl text-white">Portfolio projects</h2>
                <Link to="/admin/projects/new"><CyberButton icon={Plus}>New project</CyberButton></Link>
            </div>
            {state.projects.length === 0 ? (
                <div className="border border-cyber-border p-6 space-y-4 font-mono text-sm text-cyber-muted">
                    <p>No projects in the database yet, so the site shows the list built into it. Import that list to edit it here, or add a new project. Once there is at least one project here, only this list is shown.</p>
                    <CyberButton icon={Download} onClick={importBuiltIn} disabled={importing}>{importing ? 'Importing' : 'Import the built-in projects'}</CyberButton>
                    {problem && <p role="alert" className="text-cyber-offline">{problem}</p>}
                </div>
            ) : (
                <ul className="border border-cyber-border divide-y divide-cyber-border/60">
                    {state.projects.map((p) => (
                        <li key={p.dbId}>
                            <Link to={`/admin/projects/${p.dbId}`} className="px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 hover:bg-cyber-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                <span className={`font-mono text-sm ${p.visible ? 'text-white' : 'text-cyber-muted line-through'}`}>{p.name}</span>
                                {!p.visible && <Badge>hidden</Badge>}
                                <Badge tone={TONE[p.status]}>{p.status}</Badge>
                                <span className="font-mono text-xs text-cyber-muted">{p.group === 'tool' ? 'tool' : 'project'}{p.featured ? ', on Home' : ''}{p.inAbout ? ', on About' : ''} &middot; order {p.sort}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

const AdminProjects = () => (
    <Routes>
        <Route index element={<ProjectList />} />
        <Route path="new" element={<ProjectEditor />} />
        <Route path=":id" element={<ProjectEditor />} />
    </Routes>
);

export default AdminProjects;
