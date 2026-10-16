import React from 'react';
import { Github } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';

// One project block, shared by Projects and About. `points` limits how many bullets show.
const ProjectEntry = ({ project, points = project.points.length }) => (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-cyber-pink">&gt;</span> {project.name}
            </h3>
            {project.repo ? (
                <a href={project.repo} target="_blank" rel="noreferrer">
                    <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                </a>
            ) : (
                <span className="text-cyber-muted text-xs font-mono">PRIVATE REPO</span>
            )}
        </div>
        <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
            <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> {project.tech.join(', ')}</li>
                {project.points.slice(0, points).map((point) => (
                    <li key={point}><span className="text-cyber-pink">&gt;</span> {point}</li>
                ))}
            </ul>
        </div>
    </div>
);

export default ProjectEntry;
