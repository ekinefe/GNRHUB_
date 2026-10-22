import React from 'react';
import { User, Code, Terminal, ExternalLink, PersonStanding, Linkedin, Github, Download } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import TextType from '@/shared/animations/TextType';
import PageShell from '@/shared/layout/PageShell';
import ProjectEntry from './ProjectEntry';
import { projects, toolProjects, experiments } from '@/shared/content/projects';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const AboutMe = () => {
    useDocumentMeta({ title: 'Projects', description: 'Selected projects: repos, status and the tech behind them.' });
    return (
        <PageShell width="5xl">

                {/* Hero Section */}
                <section className="relative pt-24 pb-16 mb-12 border-b border-cyber-border/40">
                    <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-12">
                        <TextType
                            text={["/PORTFOLIO"]}
                            initialDelay={100}
                            typingSpeed={75}
                            pauseDuration={1500}
                            loop={false}
                            showCursor
                            cursorCharacter="_"
                            deletingSpeed={50}
                            variableSpeedEnabled={false}
                            variableSpeedMin={60}
                            variableSpeedMax={120}
                            cursorBlinkDuration={0.5}
                        />
                    </h1>

                    {/* <div className="flex flex-col lg:flex-row gap-2 lg:gap-12 items-start mt-8 pb-8">
                        Right: Info
                        <div className="flex-1 space-y-2">

                            Actions
                            <div className="flex flex-wrap gap-2 pt-2">
                                <a href={`mailto:${profile.email}`}>
                                    <CyberButton variant="secondary" icon={PersonStanding}>Email me</CyberButton>
                                </a>
                                <a href={brand.publicUrl} target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={ExternalLink}>{brand.name}</CyberButton>
                                </a>
                                <a href={profile.github} target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Github}>GitHub</CyberButton>
                                </a>
                                <a href={cv} target='_blank' rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Download}>Download CV</CyberButton>
                                </a>
                            </div>
                        </div>
                    </div> */}
                </section>

                <div className="space-y-16">

                    {/* Education & Core Skills */}
                    {/* <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            Education_&_Technical_Skills
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-5">
                            <ul className="space-y-3 text-cyber-muted font-mono">
                                <li>
                                    [cite_start]<span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">Education:</span> B.Sc. in Computer Science (AI & Data Science), Uniwersytet VIZJA w Warszawie (Expected 2027)[cite: 1085].
                                </li>
                                <li>
                                    [cite_start]<span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">Core Tech:</span> Python, Bash, C/C++, SQL, Linux (Fedora/Debian), Git GitHub[cite: 1086].
                                </li>
                            </ul>
                        </div>
                    </div> */}

                    {/* Key Hardware & Software Projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            Projects
                        </h2>

                        <div className="space-y-8">
                            {projects.map((project) => <ProjectEntry key={project.id} project={project} detailed />)}

                        </div>
                    </div>

                    {/* Tools that are their own projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Terminal className="w-6 h-6 text-cyber-pink" />
                            Separate_Tools
                        </h2>
                        <div className="space-y-8">
                            {toolProjects.map((project) => <ProjectEntry key={project.id} project={project} detailed />)}
                        </div>
                    </div>

                    {/* Experimental & Utility Projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Terminal className="w-6 h-6 text-cyber-pink" />
                            Experimental_&_Utility_Projects
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-5">
                            <ul className="space-y-4 text-cyber-muted font-mono text-sm">
                                {experiments.map((item) => (
                                    <li key={item.name}>
                                        <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">{item.name}:</span> {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
        </PageShell>
    );
};

export default AboutMe;