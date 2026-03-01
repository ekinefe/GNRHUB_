import React from 'react';
import { Link } from 'react-router-dom';
import { User, Code, Terminal, ExternalLink, PersonStanding, Linkedin, Github, Download, Mail } from 'lucide-react';
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
                            text={["/ABOUT_ME"]}
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

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-8 pb-8">
                        {/* Left: Avatar with Pink Border */}
                        <div className="w-56 h-56 flex-shrink-0 bg-cyber-black flex items-center justify-center overflow-hidden">
                            <img src={avatar} alt="Ekin Efe Gungor" className="w-full h-full object-cover grayscale-[30%] contrast-125 hover:grayscale-0 transition-all duration-500" />
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-mono font-bold text-white uppercase tracking-wider mb-4">
                                    EKIN_EFE_GUNGOR
                                </h2>
                                <div className="text font-mono text-lg flex flex-wrap items-center gap-2">
                                    <span className="text-cyber-pink">&gt;</span>
                                    <span>CS_STUDENT <span className="text-cyber-pink mx-2">|</span> AI_&_Data_Science</span>
                                </div>
                            </div>

                            <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed max-w-2xl">
                                I build practical tools across web, data, and embedded systems—everything from Morse code hardware to Linux automation scripts. Currently studying AI & Data Science in Warsaw, Poland.
                            </p>

                            {/* Separators */}
                            <div className="font-mono text-[10px] sm:text-xs flex flex-wrap items-center gap-x-6 gap-y-3 uppercase pt-2 pb-2">
                                <span className="text-cyber-muted font-bold tracking-widest">WARSAW-PL</span>
                                <span className="text-cyber-muted/40">|</span>
                                <span className="text-cyber-muted font-bold tracking-widest">ENGLISH (C1)</span>
                                <span className="text-cyber-muted/40">|</span>
                                <span className="text-cyber-muted font-bold tracking-widest">TURKISH (NATIVE)</span>
                                <span className="text-cyber-muted/40">|</span>
                                <span className="text-cyber-muted font-bold tracking-widest">POLISH (A1)</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                <a href="mailto:[EMAIL_ADDRESS]">
                                    <CyberButton variant="secondary" icon={Mail}>EMAIL_ME</CyberButton>
                                </a>
                                <a href="https://www.linkedin.com/in/ekin-efe-gungor-18336a20a/" target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Linkedin}>LINKEDIN</CyberButton>
                                </a>
                                <a href="https://github.com/ekinefe" target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Github}>GITHUB</CyberButton>
                                </a>
                                <a href={cv} target='_blank'>
                                    <CyberButton variant="ghost" icon={Download}>DOWNLOAD_CV</CyberButton>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Details Section */}
                <section className="mb-16">

                    {/* FIX 1 & 2: Removed max-w-3xl, changed to w-full, and added mb-16 for spacing */}
                    <div className="space-y-6 w-full mb-16">
                        {/* Added a subtle bottom border to the title to separate it from the text */}
                        <h2 className="text-2xl font-mono font-bold uppercase tracking-wider text-white flex items-center gap-3">
                            <span className="text-cyber-pink font-bold">&lt;&gt;</span>
                            PROFESSIONAL_SUMMARY
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-4">
                            <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed text-justify">
                                CS student (AI and Data Science) with 3+ years of Python and Bash on Linux and hands-on embedded work
                                (Arduino, C/C++, KiCad). I build small, reliable tools (CLI utilities and microcontroller apps) that remove
                                manual steps and clarify workflows. Looking for opportunities to learn quickly and contribute directly by solving
                                real problems for teams.
                            </p>
                        </div>
                    </div>

                    {/* Increased space-y-12 to space-y-16 to give more breathing room between Skills and Timeline */}
                    <div className="space-y-16">

                        {/* Core Skills */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Code className="w-6 h-6 text-cyber-pink" />
                                SKILLS
                            </h2>
                            <div className="border border-cyber-border bg-cyber-black p-4">
                                {/* <div className="text-cyber-cyan mb-2">LANGUAGES</div> */}
                                <ul className="space-y-1 text-cyber-muted">
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-base font-bold">Programming: </span> <span className="text-cyber-muted">Python, Bash, C/C++, Java, SQL</span></li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-base font-bold">Systems: </span> <span className="text-cyber-muted">Linux, shell scripting, cron, Git/GitHub</span></li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-base font-bold">Embedded/Electronics: </span> <span className="text-cyber-muted">Arduino (C/C++), microcontrollers, KiCad (schematics)</span></li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-base font-bold">Tools: </span> <span className="text-cyber-muted">JetBrains/VS Code, Figma, DaVinci Resolve</span></li>
                                </ul>
                            </div>
                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
                                <div className="border border-cyber-border bg-cyber-black p-4">
                                    <div className="text-cyber-cyan mb-2">LANGUAGES</div>
                                    <ul className="space-y-1 text-cyber-muted">
                                        <li><span className="text-cyber-pink">&gt;</span> Python</li>
                                        <li><span className="text-cyber-pink">&gt;</span> C/C++</li>
                                        <li><span className="text-cyber-pink">&gt;</span> JavaScript / TypeScript</li>
                                        <li><span className="text-cyber-pink">&gt;</span> SQL</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Bash</li>
                                    </ul>
                                </div>
                                <div className="border border-cyber-border bg-cyber-black p-4">
                                    <div className="text-cyber-cyan mb-2">FRAMEWORKS / TOOLS</div>
                                    <ul className="space-y-1 text-cyber-muted">
                                        <li><span className="text-cyber-pink">&gt;</span> React / Node.js</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Linux (Fedora/Debian)</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Docker</li>
                                        <li><span className="text-cyber-pink">&gt;</span> Git & Automation</li>
                                    </ul>
                                </div>
                            </div> */}
                        </div>

                        {/* Timeline / Experience */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                {/* <Terminal className="w-6 h-6 text-cyber-pink" /> */}
                                <Code className="w-6 h-6 text-cyber-pink" />
                                EDUCATION
                            </h2>

                            <div className="space-y-8 border-l-2 border-cyber-border pl-6 relative">
                                {/* Timeline Item 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">2023 – Present (expected 2027)</div>
                                    <h3 className="text-lg font-bold text-white">CS Student (AI & Data Science)</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">Uniwersytet VIZJA w Warszawie</p>
                                    <p className="text-cyber-text/70 text-sm">
                                        Bachelor’s Degree in Computer Science, specialization in Artificial Intelligence and Data Science                                    </p>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative">
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-cyan" /> */}
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-border" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">2021 – 2023</div>
                                    <h3 className="text-lg font-bold text-white">Bachelor’s Degree in Computer Science</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">Polish-Japanese Academy of Information Technology, Warsaw</p>
                                    {/* <p className="text-cyber-text/70 text-sm">
                                        Built micro-SaaS platforms, automated embedded deployments, and created CLI tools for sysadmin workflows.
                                    </p> */}
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Experience */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                {/* <Terminal className="w-6 h-6 text-cyber-pink" /> */}
                                <Code className="w-6 h-6 text-cyber-pink" />
                                PROFESSIONAL_EXPERIENCE
                            </h2>

                            <div className="space-y-8 border-l-2 border-cyber-border pl-6 relative">
                                {/* Timeline Item 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">2026 – Present</div>
                                    <h3 className="text-lg font-bold text-white">IT & Data Specialist</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">DYRK1Aprot</p>
                                    <p className="text-cyber-text/70 text-sm">
                                        Provides the technical backbone of the project, managing digital infrastructure and website development. He applies data science and computational methods to support the team in analyzing complex data.
                                    </p>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative">
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-cyan" /> */}
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-border" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">January 2024 – July 2025</div>
                                    <h3 className="text-lg font-bold text-white">Data Science & e-Learning Intern</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">Nobel Learning PBC</p>
                                    <ul className="text-cyber-text/70 text-sm">
                                        <li>&gt;     Built LMS-ready modules and interactive content to enhance engagement and outcomes.</li>
                                        <li>&gt; Partnered with instructors to scope features and ship prototypes for instructional tools.</li>
                                        <li>&gt; Integrated modern learning tools into course workflows and wrote clear how-to docs.</li>
                                        <li>&gt; Collected feedback and iterated to improve usability and content clarity.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Experience */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                {/* <Terminal className="w-6 h-6 text-cyber-pink" /> */}
                                <Code className="w-6 h-6 text-cyber-pink" />
                                OTHER_EXPERIENCE
                            </h2>

                            <div className="space-y-8 border-l-2 border-cyber-border pl-6 relative">
                                {/* Timeline Item 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">July 2024 – Present</div>
                                    <h3 className="text-lg font-bold text-white">Part-time Bike Technician</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">Benefit Bike</p>
                                    <ul className="text-cyber-text/70 text-sm">
                                        <li>&gt; Diagnose mechanical issues and complete same-day repairs; perform drivetrain/brake tuning, component
                                            replacements, and safety checks.</li>
                                        <li>&gt; Communicate repair options, costs, and timelines; document work and maintain service logs.</li>
                                        <li>&gt; Own the workflow end-to-end–from intake to pickup–ensuring on-time completion and QC.</li>
                                        <li>&gt; Prepare/store bikes to preserve condition; organize parts/tools to reduce turnaround time.</li>
                                    </ul>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative">
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" />
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-cyan" /> */}
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-border" /> */}
                                    <div className="text-cyber-muted text-xs font-mono mb-1">June 2019 – Present</div>
                                    <h3 className="text-lg font-bold text-white">Freelance Photographer & Technical Consultant</h3>
                                    {/* <p className="text-cyber-cyan text-sm mb-2">Nobel Learning PBC</p> */}
                                    <ul className="text-cyber-text/70 text-sm">
                                        <li>&gt; Managed portrait, event, and commercial shoots end-to-end (brief, shoot, edit, delivery).</li>
                                        <li>&gt; Built a terminal utility to launch common editing workflows, improving daily throughput.</li>
                                        <li>&gt; Scoped requirements and advised clients on asset management and color workflows.</li>
                                    </ul>
                                </div>
                                {/* Timeline Item 3 */}
                                <div className="relative">
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-pink" /> */}
                                    {/* <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-cyan" /> */}
                                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-cyber-border" />
                                    <div className="text-cyber-muted text-xs font-mono mb-1">January 2016 – December 2020</div>
                                    <h3 className="text-lg font-bold text-white">Leader’s Assistant & PR/Social Media Manager</h3>
                                    <p className="text-cyber-cyan text-sm mb-2">Turkish Aeronautical Association</p>
                                    <ul className="text-cyber-text/70 text-sm">
                                        <li>&gt; Led a 5-member youth team to plan national events (100+ attendees); coordinated schedules, budgets, and
                                            on-site operations.</li>
                                        <li>&gt; Produced/published cross-channel social content; coordinated promo campaigns.</li>
                                        <li>&gt; Liaised with local media (newspapers, radio, TV) to increase visibility and attendance.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* === SELECTED PROJECTS === */}
                        {/* Wrapping the whole section in a single div prevents the parent's space-y from tearing it apart */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase m-0">
                                    <Code className="w-6 h-6 text-cyber-pink" />
                                    SELECTED_PROJECTS
                                </h2>
                                <Link to="/projects">
                                    <CyberButton variant="ghost">Other Projects</CyberButton>
                                </Link>
                            </div>

                            {/* Inner container for the projects with a smaller gap between each project */}
                            <div className="space-y-8">

                                {/* Project 1: CW Keyer */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                                        <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                            <span className="text-cyber-pink">&gt;</span> CW Keyer

                                        </h3>
                                        <a href="https://github.com/ekinefegungor" target="_blank" rel="noreferrer">
                                            <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                        </a>
                                    </div>
                                    <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                        <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                            <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> C++, Arduino, Embedded Systems</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Real-time Morse code keyer with standalone operation via LCD and paddles.</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Developed firmware in C/C++ and designed circuitry from scratch.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Project 2: GNRHUB */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                                        <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                            <span className="text-cyber-pink">&gt;</span> GNRHUB (Personal Platform)

                                        </h3>
                                        <a href="https://github.com/ekinefegungor" target="_blank" rel="noreferrer">
                                            <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                        </a>
                                    </div>
                                    <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                        <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                            <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> React.js, Node.js, Cloudflare, Tailwind</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Full-stack sandbox developed into a micro-SaaS platform.</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Implemented secure user authentication and secured API environments.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Project 3: Easy Admin */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">

                                        <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-2'>
                                            <span className="text-cyber-pink">&gt;</span> EasyAdmin

                                        </h3>
                                        <a href="https://github.com/ekinefegungor" target="_blank" rel="noreferrer">
                                            <CyberButton variant="ghost" icon={Github}>Source Code</CyberButton>
                                        </a>
                                    </div>
                                    <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                        <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                            <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">TECH:</span> Bash, Linux Automation, Cron</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Multilingual (TR/EN/PL) CLI framework for automated headless server management.</li>
                                            <li><span className="text-cyber-pink">&gt;</span> Automates user management, permissions, and log archiving for Debian-based systems.</li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase m-0 mb-4">
                                <Code className="w-6 h-6 text-cyber-pink" />
                                Certificates & Courses
                            </h2>

                            <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                                <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">ChatGPT Prompt Engineering for Developers</span> DeepLearning.AI (August 2025)</li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">Fundamentals Program (90 hours)</span> Nobel Learning PBC (July 2025)</li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">Academic Skills</span> NAVOICA (January 2024)</li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">Website Development</span> NAVOICA (January 2024)</li>
                                    <li><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">Daily and Business English</span> Wyższa Szkoła Ekologii i Zarządzania w Warszawie. – (2020 – 2021)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
};

export default AboutMe;
