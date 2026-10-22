import React from 'react';
import { profile } from '@/shared/config/profile';
import { User, Code, Terminal, ExternalLink, PersonStanding, Linkedin, Github, Download } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import TextType from '@/shared/animations/TextType';
import PageShell from '@/shared/layout/PageShell';
import ProjectEntry from './ProjectEntry';
import { projects, experiments } from '@/shared/content/projects';
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

                    {/* Professional & Collaborative Work */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Terminal className="w-6 h-6 text-cyber-pink" />
                            Professional_&_Collaborative_Work
                        </h2>

                        <div className="space-y-8 border-l-2 border-cyber-border pl-6 relative">
                            {/* Experience 1 */}
                            <div className="relative">
                                <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">DYRK1Aprot.com</h3>
                                        <p className="text-cyber-cyan text-sm mb-3 font-mono">Data Management & Web Development</p>
                                    </div>
                                    <div>
                                        <a href={profile.dyrk1a} target="_blank" rel="noopener noreferrer">
                                            <CyberButton variant="ghost" icon={ExternalLink}>Visit site</CyberButton>
                                        </a>
                                    </div>

                                </div>
                                <ul className="text-cyber-text/70 text-sm space-y-1 font-mono">
                                    <li><span className="text-cyber-pink">&gt;</span> Collaborating with a 6-student team in Warsaw to develop a solution for DYRK1A syndrome.</li>
                                    <li><span className="text-cyber-pink">&gt;</span> Responsible for website architecture and future data management systems to support research goals.</li>
                                </ul>
                            </div>

                            {/* Experience 2 */}
                            <div className="relative">
                                <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-border" />
                                <h3 className="text-lg font-bold text-white">EKK Accounting Automation</h3>
                                <p className="text-cyber-cyan text-sm mb-3 font-mono">Python, Excel/Data Processing</p>
                                <ul className="text-cyber-text/70 text-sm space-y-1 font-mono">
                                    <li><span className="text-cyber-pink">&gt;</span> Developed a custom Python tool to eliminate manual data entry for a Turkish institution.</li>
                                    <li><span className="text-cyber-pink">&gt;</span> Audits Excel records, generates filtered reports, and uses web automation to stage data in accounting software.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Key Hardware & Software Projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 uppercase [overflow-wrap:anywhere]">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            Key_Hardware_&_Software_Projects
                        </h2>

                        <div className="space-y-8">
                            {projects.map((project) => <ProjectEntry key={project.id} project={project} detailed />)}

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