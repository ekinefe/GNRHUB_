import React from 'react';
import { User, Code, Terminal, ExternalLink, PersonStanding, Linkedin, Github, Download } from 'lucide-react';
import CyberButton from '../../components/ui/CyberButton';
import TextType from '../../components/animations/TextType';
import avatar from '../../assets/AboutMe/avatar.jpg';
import cv from '../../assets/Ekin_Efe_GUNGOR_CV_ATS.pdf';

const AboutMe = () => {
    return (
        <div className="min-h-screen bg-cyber-black bg-grid-pattern [background-size:50px_50px] text-cyber-text p-4 md:p-12 flex justify-center">

            <div className="max-w-5xl w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen p-8 shadow-2xl relative">

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
                                <a href="mailto:ekinefegnr@gmail.com">
                                    <CyberButton variant="secondary" icon={PersonStanding}>EMAIL_ME</CyberButton>
                                </a>
                                <a href="https://gnrhub.pages.dev" target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={ExternalLink}>GNRHUB</CyberButton>
                                </a>
                                <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Github}>GITHUB</CyberButton>
                                </a>
                                <a href={cv} target='_blank'>
                                    <CyberButton variant="ghost" icon={Download}>DOWNLOAD_CV</CyberButton>
                                </a>
                            </div>
                        </div>
                    </div> */}
                </section>

                <div className="space-y-16">

                    {/* Education & Core Skills */}
                    {/* <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase">
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
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase">
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
                                        <a href="https://dyrk1aprot.com" target="_blank" rel="noopener noreferrer">
                                            <CyberButton variant="ghost" icon={ExternalLink}>VISIT_SITE</CyberButton>
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
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 uppercase">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            Key_Hardware_&_Software_Projects
                        </h2>

                        <div className="space-y-8">
                            {/* Project 1: CW Keyer */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                                    <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                        <span className="text-cyber-pink">&gt;</span> CW Keyer

                                    </h3>
                                    <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                        <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                    </a>
                                </div>
                                <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                    <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                        <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> C++, Arduino, Embedded Systems</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Designed and built a hardware device from scratch to standardize Morse code transmission and reception.</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Developed firmware in C/C++ and designed circuitry for real-time operation with an LCD and paddles.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Project 2: CW Trainer */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">

                                    <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                        <span className="text-cyber-pink">&gt;</span> CW Trainer (Desktop)
                                    </h3>
                                    <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                        <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                    </a>
                                </div>
                                <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                    <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                        <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> C++, Qt6, Python</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Developed a cross-platform (Windows/Linux) training app to interface with the hardware keyer.</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Features adaptive difficulty and live performance tracking for error-free long-form text training.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Project 3: GNRHUB */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">

                                    <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                        <span className="text-cyber-pink">&gt;</span> GNRHUB_V2 (Personal Platform)
                                    </h3>
                                    {/* <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                        <CyberButton variant="ghost" icon={ExternalLink}>Live Site</CyberButton>
                                    </a> */}
                                </div>
                                <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                    <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                        <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> React.js, Node.js, Cloudflare, Bcrypt</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Full-stack sandbox currently being developed into a micro-SaaS platform.</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Implemented secure user authentication using bcryptjs for password hashing.</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Infrastructure hosted on Cloudflare with sensitive API keys secured via environment variables.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Project 4: EasyAdmin */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">

                                    <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                        <span className="text-cyber-pink">&gt;</span> EasyAdmin
                                    </h3>
                                    <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                        <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                    </a>
                                </div>
                                <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                    <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                        <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> Bash, Linux Automation</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Multilingual (TR/EN/PL) CLI framework for automated headless server management.</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Automates user management, permissions, and log archiving for Debian-based (Ubuntu) systems.</li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Experimental & Utility Projects */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 uppercase">
                            <Terminal className="w-6 h-6 text-cyber-pink" />
                            Experimental_&_Utility_Projects
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-5">
                            <ul className="space-y-4 text-cyber-muted font-mono text-sm">
                                <li>
                                    <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">PixelART (Python):</span> A generative art algorithm using randomized color-flow logic for unique digital transitions.
                                </li>
                                <li>
                                    <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">YT Video Downloader (Python):</span> Terminal utility to fetch high-bitrate audio directly from YouTube servers.
                                </li>
                                <li>
                                    <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">Focus Timer CLI (C++):</span> A productivity tool utilizing the ncurses library for a functional terminal UI.
                                </li>
                                <li>
                                    <span className="text-cyber-pink">&gt;</span> <span className="text-white font-bold">Security & Web Tools:</span> Developed a high-entropy Password Generator (Python) and various Web Scrapers (Selenium) for automation and data practice.
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AboutMe;