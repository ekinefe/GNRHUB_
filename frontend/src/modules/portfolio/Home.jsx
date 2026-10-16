import React, { useState, useEffect } from 'react'; import { Link } from 'react-router-dom';
import { brand } from '@/shared/config/brand';
import { Terminal, Cpu, Network, ChevronRight, LucidePersonStanding, Mail, Code } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import CyberCard from '@/shared/ui/CyberCard';
import TextType from '@/shared/animations/TextType';
import PageShell from '@/shared/layout/PageShell';
import { profile } from '@/shared/config/profile';
import WarsawClock from './WarsawClock';
import { features } from '@/shared/config/features';
import { featuredProjects } from '@/shared/content/projects';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

// Card icon per project kind
const KIND_ICON = { Hardware: Cpu, Platform: Network, CLI: Terminal };

// TextType types one character at a time, so its box grows and pushes the content below it.
// An invisible copy of the full text sits in the same grid cell and reserves the final size up front.
const Reserve = ({ text, children }) => (
    <span className="grid">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">{text}</span>
        <span className="col-start-1 row-start-1">{children}</span>
    </span>
);

const Home = () => {
    useDocumentMeta({ description: `Ekin Efe Gungor - CS student in ${profile.location.city} building reliable tools in Python, Bash and embedded C++.${profile.availability.open ? ` ${profile.availability.text}.` : ''}` });
    const [showProfile, setShowProfile] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowProfile(true);
        }, 1500);

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);
    return (
        <PageShell width="5xl">

                {/* === HERO SECTION === */}
                <section className="relative pt-8 md:pt-16 pb-16 px-4 md:px-12 max-w-7xl mx-auto">

                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-border to-transparent" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Intro Text */}
                        <div className="space-y-6">
                            <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1 border border-cyber-active/30 bg-cyber-active/5 rounded-full text-xs font-mono font-bold tracking-widest">
                                {profile.availability.open && (
                                    <span className="flex items-center gap-2 text-cyber-active">
                                        <span aria-hidden="true" className="w-2 h-2 bg-cyber-active rounded-full animate-pulse" />
                                        {profile.availability.text.toUpperCase()}
                                    </span>
                                )}
                                <span className="text-cyber-muted">{profile.location.city.toUpperCase()}, {profile.location.country} · <WarsawClock /></span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-bold text-white tracking-tighter leading-tight">
                                    &gt; <Reserve text="EKIN EFE GUNGOR"><TextType
                                        text={["EKIN EFE GUNGOR"]}
                                        typingSpeed={75}
                                        pauseDuration={1500}
                                        loop={false}
                                        showCursor={!showProfile}
                                        cursorCharacter="_"
                                        texts={["EKIN EFE GUNGOR"]}
                                        deletingSpeed={50}
                                        variableSpeedEnabled={false}
                                        variableSpeedMin={60}
                                        variableSpeedMax={120}
                                        cursorBlinkDuration={0.5}
                                    /></Reserve>
                                </h1>
                                <p className="text-xl md:text-2xl font-mono text-cyber-muted">
                                    &gt;
                                    <Reserve text="CS Student (AI & Data Science)"><TextType
                                        text={["CS Student (AI & Data Science)"]}
                                        initialDelay={1000}
                                        typingSpeed={75}
                                        pauseDuration={1500}
                                        loop={false}
                                        showCursor
                                        cursorCharacter="_"
                                        // texts={["CS Student (AI & Data Science)"]}
                                        deletingSpeed={50}
                                        variableSpeedEnabled={false}
                                        variableSpeedMin={60}
                                        variableSpeedMax={120}
                                        cursorBlinkDuration={0.5}
                                    /></Reserve>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-0">
                                <Link to="/contact">
                                    <CyberButton variant="primary" icon={Mail}>Get in touch</CyberButton>
                                </Link>
                                <Link to="/projects">
                                    <CyberButton variant="secondary" icon={Code}>View projects</CyberButton>
                                </Link>
                                <Link to="/about">
                                    <CyberButton variant="ghost" icon={LucidePersonStanding}>More About Me</CyberButton>
                                </Link>
                            </div>

                            <p className="text-lg text-cyber-text/80 max-w-lg leading-relaxed font-sans">
                                Python and Bash automation on Linux, embedded C++ on Arduino. I build small, reliable tools that remove manual steps, and I am looking for a team to learn from and ship with.
                            </p>

                        </div>



                        {/* Right: The "Terminal" Bio */}
                        <div className="relative group">
                            {/* <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan opacity-20 blur transition duration-1000 group-hover:opacity-40" /> */}
                            <div className="relative bg-cyber-black border border-cyber-border rounded-lg p-6 font-mono text-sm shadow-2xl min-h-[300px]">

                                {/* Terminal Header */}
                                {/* <div className="flex items-center justify-between mb-4 border-b border-cyber-border pb-2">
                                    <span className="text-cyber-muted text-xs">{brand.prompt}</span>

                                </div> */}

                                {/* Terminal Content */}
                                <div className="space-y-2 overflow-x-auto">
                                    {/* Command Line */}
                                    <div className="flex gap-2">
                                        <span className="text-cyber-pink">{brand.prompt}#</span>
                                        <span className="text-white">
                                            <TextType
                                                text={["./profile.sh"]}
                                                typingSpeed={75}
                                                loop={false}
                                                showCursor={!showProfile} // Hide cursor when "Done"
                                                cursorCharacter="_"
                                            />
                                        </span>
                                    </div>

                                    {/* The Output (Controlled by Timer) */}
                                    {showProfile && (
                                        <div className="animate-in fade-in duration-500">
                                            {/* <div className="text-cyber-muted pl-4 mb-4">
                                                &gt; Loading kernel modules... <span className="text-cyber-success">[OK]</span><br />
                                                &gt; Initializing user profile... <span className="text-cyber-success">[OK]</span>
                                            </div> */}

                                            <div className="pl-4 space-y-2 text-cyber-text delay-1000 border-l-2 border-cyber-border ml-2">
                                                <p><span className="text-cyber-cyan font-bold">CURRENT_ROLE:</span> Student (Uniwersytet VIZJA)</p>
                                                <p><span className="text-cyber-cyan font-bold">FOCUS:</span> AI, Embedded C++, Bash</p>
                                                <p><span className="text-cyber-cyan font-bold">LANGUAGES:</span> Python, SQL, C/C++</p>
                                                <p><span className="text-cyber-cyan font-bold">LOCATION:</span> Warsaw, Poland</p>
                                                {/* <p><span className="text-cyber-cyan font-bold">UPTIME:</span> 3+ Years Experience</p> */}
                                            </div>
                                            <br />
                                            {/* New Prompt Line */}
                                            <div className="flex gap-2">
                                                <span className="text-cyber-pink">{brand.prompt}#</span>
                                                <span className="text-white">
                                                    <TextType
                                                        text={[""]}
                                                        typingSpeed={75}
                                                        loop={true}
                                                        showCursor // Hide cursor when "Done"
                                                        cursorCharacter="_"
                                                        cursorBlinkDuration={0.5}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === FEATURED PROJECTS SECTION === */}
                <section className="py-20 border-t border-cyber-border bg-cyber-panel/30">
                    <div className="max-w-7xl mx-auto px-4 md:px-12">

                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-sans font-bold text-white mb-2">
                                    <span className="text-cyber-pink">//</span> SELECTED PROJECTS
                                </h2>
                                <p className="font-mono text-cyber-muted text-sm">
                                    /projects/featured
                                </p>
                            </div>
                            <Link to={features.tools ? '/tools' : '/projects'} className="hidden md:flex items-center gap-2 text-cyber-pink hover:text-white transition-colors font-mono text-sm">
                                {features.tools ? 'VIEW ALL TOOLS' : 'VIEW ALL PROJECTS'} <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {featuredProjects.map((project) => (
                                <CyberCard key={project.id} title={`${project.name.replace(/ \(.*\)$/, '').toUpperCase()} (${project.kind.toUpperCase()})`} className="h-full">
                                    <div className="mb-4 text-cyber-cyan">
                                        {React.createElement(KIND_ICON[project.kind] ?? Terminal, { className: 'w-8 h-8 mb-2' })}
                                    </div>
                                    <p className="text-sm text-cyber-text mb-4 min-h-[40px]">{project.summary}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.tech.slice(0, 2).map((t) => (
                                            <span key={t} className="px-2 py-1 bg-cyber-panel border border-cyber-border text-xs font-mono rounded text-cyber-muted">{t}</span>
                                        ))}
                                    </div>
                                    {project.repo ? (
                                        <a href={project.repo} target="_blank" rel="noreferrer" className="text-cyber-pink text-xs font-mono hover:underline">
                                            SOURCE_CODE &gt;&gt;
                                        </a>
                                    ) : (
                                        <span className="text-cyber-muted text-xs font-mono">PRIVATE REPO</span>
                                    )}
                                </CyberCard>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === TECH STACK TICKER === */}
                <section className="py-12 border-t border-cyber-border">
                    <div className="max-w-7xl mx-auto px-4 md:px-12 text-center">
                        <p className="font-mono text-cyber-muted text-xs tracking-[0.3em] mb-6">
                            CORE_OPERATING_PROTOCOLS
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                            {['PYTHON', 'LINUX (FEDORA)', 'C/C++', 'REACT', 'SQL', 'BASH'].map((tech) => (
                                <span key={tech} className="text-2xl font-sans font-bold text-cyber-text hover:text-cyber-pink transition-colors cursor-default">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
        </PageShell>
    );
};

export default Home;