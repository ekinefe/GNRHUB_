import React, { useState, useEffect } from 'react'; import { Link } from 'react-router-dom';
import { Terminal, Cpu, Network, Github, Linkedin, ChevronRight, Download, PersonStanding, LucidePersonStanding } from 'lucide-react';
import CyberButton from '../components/ui/CyberButton';
import CyberCard from '../components/ui/CyberCard';
import TextType from '../components/animations/TextType';

const Home = () => {
    const [showProfile, setShowProfile] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowProfile(true);
        }, 1500);

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);
    return (
        // 1. The Outer Wrapper (Grid Background)
        <div className="min-h-screen bg-cyber-black bg-grid-pattern [background-size:50px_50px] text-cyber-text p-4 md:p-12 flex justify-center">

            {/* 2. The Content Container (The "Background behind the text") */}
            <div className="max-w-5xl w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen p-8 shadow-2xl relative">

                {/* === HERO SECTION === */}
                <section className="relative pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">

                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-border to-transparent" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Intro Text */}
                        <div className="space-y-6">
                            {/* <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-active/30 bg-cyber-active/5 rounded-full">
                                <span className="w-2 h-2 bg-cyber-active rounded-full animate-pulse" />
                                <span className="text-xs font-mono font-bold text-cyber-active tracking-widest">
                                    SYSTEM ONLINE // WARSAW, PL
                                </span>
                            </div> */}

                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-7xl font-sans font-bold text-white tracking-tighter leading-tight">
                                    &gt; <TextType
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
                                    />
                                </h1>
                                <p className="text-xl md:text-2xl font-mono text-cyber-muted">
                                    &gt;
                                    <TextType
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
                                    />
                                </p>
                            </div>

                            <p className="text-lg text-cyber-text/80 max-w-lg leading-relaxed font-sans">
                                Building reliable tools and CLI utilities that clarify workflows. Specializing in Python, Linux Automation, and Embedded Systems.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {/* <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                    <CyberButton variant="primary" icon={Github}>GitHub</CyberButton>
                                </a>
                                <a href="https://www.linkedin.com/in/ekin-efe-gungor-18336a20a/" target="_blank" rel="noreferrer">
                                    <CyberButton variant="secondary" icon={Linkedin}>LinkedIn</CyberButton>
                                </a> */}
                                {/* <Link to="/cv">
                                    <CyberButton variant="ghost" icon={LucidePersonStanding}>More About Me</CyberButton>
                                </Link> */}
                                <Link to="/about">
                                    <CyberButton variant="secondary" icon={LucidePersonStanding}>More About Me</CyberButton>
                                </Link>
                            </div>
                        </div>



                        {/* Right: The "Terminal" Bio */}
                        <div className="relative group">
                            {/* <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan opacity-20 blur transition duration-1000 group-hover:opacity-40" /> */}
                            <div className="relative bg-cyber-black border border-cyber-border rounded-lg p-6 font-mono text-sm shadow-2xl min-h-[300px]">

                                {/* Terminal Header */}
                                {/* <div className="flex items-center justify-between mb-4 border-b border-cyber-border pb-2">
                                    <span className="text-cyber-muted text-xs">root@gnrhub:~</span>

                                </div> */}

                                {/* Terminal Content */}
                                <div className="space-y-2 overflow-x-auto">
                                    {/* Command Line */}
                                    <div className="flex gap-2">
                                        <span className="text-cyber-pink">root@gnrhub:~#</span>
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
                                                <span className="text-cyber-pink">root@gnrhub:~#</span>
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
                            <Link to="/tools" className="hidden md:flex items-center gap-2 text-cyber-pink hover:text-white transition-colors font-mono text-sm">
                                VIEW ALL TOOLS <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Project 1: CW Keyer */}
                            <CyberCard title="CW KEYER (HARDWARE)" className="h-full">
                                <div className="mb-4 text-cyber-cyan">
                                    <Cpu className="w-8 h-8 mb-2" />
                                </div>
                                <p className="text-sm text-cyber-text mb-4 min-h-[40px]">
                                    Real-time Morse code keyer built with Arduino/C++. Standalone operation with LCD & paddles.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">C++</span>
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">Embedded</span>
                                </div>
                                <a href="https://github.com/ekinefe/CW_keyer-GNR" target="_blank" rel="noreferrer" className="text-cyber-pink text-xs font-mono hover:underline">
                                    SOURCE_CODE &gt;&gt;
                                </a>
                            </CyberCard>

                            {/* Project 2: GNRHUB */}
                            <CyberCard title="GNRHUB (SAAS)" className="h-full border-cyber-pink/40">
                                <div className="mb-4 text-cyber-pink">
                                    <Network className="w-8 h-8 mb-2" />
                                </div>
                                <p className="text-sm text-cyber-text mb-4 min-h-[40px]">
                                    Full-stack sandbox & micro-SaaS platform. Hosted on Cloudflare with React & Node.js.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">React</span>
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">Cloudflare</span>
                                </div>
                                <span className="text-cyber-active text-xs font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyber-active rounded-full animate-pulse" />
                                    DEPLOYED
                                </span>
                            </CyberCard>

                            {/* Project 3: Easy Admin */}
                            <CyberCard title="EASY ADMIN (CLI)" className="h-full">
                                <div className="mb-4 text-cyber-cyan">
                                    <Terminal className="w-8 h-8 mb-2" />
                                </div>
                                <p className="text-sm text-cyber-text mb-4 min-h-[40px]">
                                    Bash framework automating Linux admin tasks like user management and log archiving.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">Bash</span>
                                    <span className="px-2 py-1 bg-cyber-border text-xs font-mono rounded text-cyber-muted">Linux</span>
                                </div>
                                <span className="text-cyber-muted text-xs font-mono">PRIVATE REPO</span>
                            </CyberCard>

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
            </div >
        </div >
    );
};

export default Home;