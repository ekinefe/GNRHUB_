import React from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, BookOpen } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';

const STATUS = {
    live: { label: 'LIVE', className: 'text-cyber-active border-cyber-active/40' },
    soon: { label: 'COMING SOON', className: 'text-cyber-muted border-cyber-border' },
    paused: { label: 'ON HOLD', className: 'text-cyber-beta border-cyber-beta/40' },
};

// One project block, shared by Projects (detailed) and About (compact). `points` limits how many bullets show.
const ProjectEntry = ({ project, points = project.points.length, detailed = false }) => {
    const status = STATUS[project.status] ?? STATUS.soon;
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                <h3 className="text-xl font-bold text-white mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-cyber-pink">&gt;</span> {project.name}
                    {detailed && <span className={`px-2 py-0.5 border rounded text-xs font-mono ${status.className}`}>{status.label}</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    {project.repo ? (
                        <a href={project.repo} target="_blank" rel="noreferrer">
                            <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                        </a>
                    ) : project.status === 'live' ? (
                        <span className="text-cyber-muted text-xs font-mono">PRIVATE REPO</span>
                    ) : null}
                    {project.url && (
                        <a href={project.url} target="_blank" rel="noreferrer">
                            <CyberButton variant="ghost" icon={ExternalLink}>Live site</CyberButton>
                        </a>
                    )}
                    {detailed && project.caseStudy && (
                        <Link to={project.caseStudy}>
                            <CyberButton variant="ghost" icon={BookOpen}>Case study</CyberButton>
                        </Link>
                    )}
                </div>
            </div>
            <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                {detailed && project.image && (
                    <img src={project.image} alt={project.imageAlt} loading="lazy" width="1280" height="720" className="w-full h-auto border border-cyber-border mb-5" />
                )}
                <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> {project.tech.join(', ')}</li>
                    {project.points.slice(0, points).map((point) => (
                        <li key={point}><span className="text-cyber-pink">&gt;</span> {point}</li>
                    ))}
                    {detailed && project.learned && (
                        <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">LEARNED:</span> {project.learned}</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProjectEntry;
