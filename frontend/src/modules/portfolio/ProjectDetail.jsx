import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, Github } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import PageShell from '@/shared/layout/PageShell';
import NotFound from '@/shared/errors/NotFound';
import LoadingLine from '@/shared/animations/LoadingLine';
import { useProjects } from '@/shared/content/useProjects';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { STATUS } from './projectStatus';

const WHAT_IT_MEANS = {
    live: 'Works today.',
    soon: 'Planned, not live yet. There is no address to open.',
    paused: 'On hold for now.',
};

// One project or tool on its own page (GNR-78): status, what it is, how it is built, and where to find it.
const ProjectDetail = () => {
    const { id } = useParams();
    const { projects, toolProjects, ready } = useProjects();
    const project = [...projects, ...toolProjects].find((p) => p.id === id);
    useDocumentMeta(project
        ? { title: project.name, description: project.summary }
        : { title: 'Project', noindex: true });

    if (!project) return ready ? <NotFound /> : <PageShell><div className="pt-24"><LoadingLine>Loading...</LoadingLine></div></PageShell>;

    const status = STATUS[project.status] ?? STATUS.soon;
    return (
        <PageShell>
            <article className="pt-24 pb-24 max-w-3xl">
                <Link to="/projects" className="flex items-center gap-2 text-cyber-muted hover:text-cyber-pink transition-colors font-mono text-sm w-fit mb-8">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> All projects
                </Link>
                <p className="font-mono text-sm text-cyber-muted mb-2">{project.kind}</p>
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-4">{project.name}</h1>
                <p className="flex flex-wrap items-center gap-3 font-mono text-sm mb-8">
                    <span className={`px-2 py-0.5 border rounded text-xs ${status.className}`}>{status.label}</span>
                    <span className="text-cyber-muted">{WHAT_IT_MEANS[project.status] ?? ''}</span>
                </p>
                <p className="font-mono text-cyber-text leading-relaxed mb-8">{project.summary}</p>

                {project.image && <img src={project.image} alt={project.imageAlt} width="1280" height="720" className="w-full h-auto border border-cyber-border mb-8" />}

                <div className="flex flex-wrap items-center gap-3 mb-10">
                    {project.url && <a href={project.url} target="_blank" rel="noreferrer"><CyberButton variant="primary" icon={ExternalLink}>Live site</CyberButton></a>}
                    {project.repo ? (
                        <a href={project.repo} target="_blank" rel="noreferrer"><CyberButton variant="ghost" icon={Github}>Source code</CyberButton></a>
                    ) : project.status === 'live' ? <span className="text-cyber-muted text-xs font-mono">PRIVATE REPO</span> : null}
                    {project.caseStudy && <Link to={project.caseStudy}><CyberButton variant="ghost" icon={BookOpen}>Case study</CyberButton></Link>}
                </div>

                {project.points.length > 0 && (
                    <section aria-labelledby="what" className="mb-10">
                        <h2 id="what" className="font-mono text-sm text-cyber-cyan mb-3">What it does</h2>
                        <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                            {project.points.map((point) => <li key={point}><span className="text-cyber-pink">&gt;</span> {point}</li>)}
                        </ul>
                    </section>
                )}

                {project.tech.length > 0 && (
                    <section aria-labelledby="built" className="mb-10">
                        <h2 id="built" className="font-mono text-sm text-cyber-cyan mb-3">Built with</h2>
                        <p className="font-mono text-sm text-cyber-text">{project.tech.join(', ')}</p>
                    </section>
                )}

                {project.learned && (
                    <section aria-labelledby="learned">
                        <h2 id="learned" className="font-mono text-sm text-cyber-cyan mb-3">What I learned</h2>
                        <p className="font-mono text-sm text-cyber-muted leading-relaxed">{project.learned}</p>
                    </section>
                )}
            </article>
        </PageShell>
    );
};

export default ProjectDetail;
