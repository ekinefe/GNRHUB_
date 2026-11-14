import React from 'react';
import PageShell from '@/shared/layout/PageShell';
import PageHeader from '@/shared/layout/PageHeader';
import SectionHeading from '@/shared/ui/SectionHeading';
import ProjectEntry from './ProjectEntry';
import { experiments } from '@/shared/content/projects';
import { useProjects } from '@/shared/content/useProjects';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const AboutMe = () => {
    const { projects, toolProjects } = useProjects();
    useDocumentMeta({ title: 'Projects', description: 'Selected projects: repos, status and the tech behind them.' });
    return (
        <PageShell>
                <PageHeader title="Portfolio" description="Things I have built: what they do, where they stand and the tech behind them." />

                <div className="space-y-16 pb-24">
                    <section aria-labelledby="projects-all">
                        <SectionHeading id="projects-all" title="Projects" path="/projects/all" />
                        <div className="space-y-8">
                            {projects.map((project) => <ProjectEntry key={project.id} project={project} detailed />)}
                        </div>
                    </section>

                    {/* Tools that are their own projects */}
                    <section aria-labelledby="projects-tools">
                        <SectionHeading id="projects-tools" title="Separate tools" path="/projects/tools" />
                        <div className="space-y-8">
                            {toolProjects.map((project) => <ProjectEntry key={project.id} project={project} detailed />)}
                        </div>
                    </section>

                    <section aria-labelledby="projects-experiments">
                        <SectionHeading id="projects-experiments" title="Experiments and utilities" path="/projects/experiments" />
                        <div className="border border-cyber-border bg-cyber-black p-5">
                            <ul className="space-y-4 text-cyber-muted font-mono text-sm">
                                {experiments.map((item) => (
                                    <li key={item.name}>
                                        <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">{item.name}:</span> {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
        </PageShell>
    );
};

export default AboutMe;