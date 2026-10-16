import React from 'react';
import { profile } from '@/shared/config/profile';
import { Link } from 'react-router-dom';
import { Code, Linkedin, Github, Mail } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import TextType from '@/shared/animations/TextType';
import avatar from '@/assets/AboutMe/avatar.jpg';
import PageShell from '@/shared/layout/PageShell';
import ProjectEntry from './ProjectEntry';
import { about, skillsPackageJson } from '@/shared/content/about';
import { aboutProjects } from '@/shared/content/projects';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { useJsonLd } from '@/shared/hooks/useJsonLd';
import { brand } from '@/shared/config/brand';

// schema.org Person for search engines; built from profile and about data so it never drifts from the page.
const PERSON = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: about.name,
    jobTitle: 'Computer science student',
    url: brand.publicUrl,
    sameAs: [profile.github, profile.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: profile.location.city, addressCountry: profile.location.country },
    knowsAbout: about.skills.programming,
};

const AboutMe = () => {
    useDocumentMeta({ title: 'About', description: 'Who I am, what I have built and what I work with.' });
    useJsonLd('person', PERSON);
    return (
        <PageShell width="5xl">

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
                                {about.intro}
                            </p>
                            <p className="font-mono text-cyber-muted text-sm leading-relaxed max-w-2xl" data-testid="name-story">
                                {about.nameStory}
                            </p>

                            {/* Separators */}
                            <div className="font-mono text-[10px] sm:text-xs flex flex-wrap items-center gap-x-6 gap-y-3 uppercase pt-2 pb-2">
                                <span className="text-cyber-muted font-bold tracking-widest">{profile.location.city}-{profile.location.country}</span>
                                {Object.entries(about.languages).map(([lang, level]) => (
                                    <React.Fragment key={lang}>
                                        <span className="text-cyber-muted/40">|</span>
                                        <span className="text-cyber-muted font-bold tracking-widest">{lang} ({level})</span>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                <a href={`mailto:${profile.email}`}>
                                    <CyberButton variant="secondary" icon={Mail}>Email me</CyberButton>
                                </a>
                                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Linkedin}>LinkedIn</CyberButton>
                                </a>
                                <a href={profile.github} target="_blank" rel="noreferrer">
                                    <CyberButton variant="ghost" icon={Github}>GitHub</CyberButton>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Details Section */}
                <section className="mb-16 space-y-16">

                    <div className="space-y-6 w-full">
                        <h2 className="text-2xl font-mono font-bold uppercase tracking-wider text-white flex items-center gap-3">
                            <span className="text-cyber-pink font-bold">&lt;&gt;</span>
                            PROFESSIONAL_SUMMARY
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-4">
                            <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed">{about.summary}</p>
                        </div>
                    </div>

                    {/* Skills as a package.json block */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            SKILLS
                        </h2>
                        <pre
                            aria-label="Skills, shown as a package.json file"
                            className="border border-cyber-border bg-cyber-black p-4 font-mono text-sm text-cyber-cyan overflow-x-auto"
                        >
                            <span className="text-cyber-muted">$ cat package.json{'\n'}</span>
                            {skillsPackageJson()}
                        </pre>
                    </div>

                    {/* Education and experience as git logs */}
                    {about.log.map((group) => (
                        <div key={group.key}>
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Code className="w-6 h-6 text-cyber-pink" />
                                {group.title}
                            </h2>
                            <p className="font-mono text-xs text-cyber-muted mb-6">$ git log --oneline {group.key}</p>
                            <ol className="space-y-8 border-l-2 border-cyber-border pl-6 relative">
                                {group.entries.map((entry) => (
                                    <li key={`${entry.when}-${entry.title}`} className="relative">
                                        <span
                                            aria-hidden="true"
                                            className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 ${entry.current ? 'border-cyber-pink' : 'border-cyber-border'}`}
                                        />
                                        <div className="text-cyber-muted text-xs font-mono mb-1">{entry.when}</div>
                                        <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                                        {entry.org && <p className="text-cyber-cyan text-sm mb-2">{entry.org}</p>}
                                        {entry.text && <p className="text-cyber-text/70 text-sm">{entry.text}</p>}
                                        {entry.points && (
                                            <ul className="text-cyber-text/70 text-sm">
                                                {entry.points.map((point) => <li key={point}>&gt; {point}</li>)}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}

                    {/* Selected projects */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase m-0">
                                <Code className="w-6 h-6 text-cyber-pink" />
                                SELECTED_PROJECTS
                            </h2>
                            <Link to="/projects">
                                <CyberButton variant="ghost">Other Projects</CyberButton>
                            </Link>
                        </div>
                        <div className="space-y-8">
                            {aboutProjects.map((project) => <ProjectEntry key={project.id} project={project} points={2} />)}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase m-0 mb-4">
                            <Code className="w-6 h-6 text-cyber-pink" />
                            Certificates & Courses
                        </h2>
                        <div className="border border-cyber-border bg-cyber-black p-5 transition-colors hover:border-cyber-pink/50">
                            <ul className="space-y-2 text-cyber-muted font-mono text-sm">
                                {about.certificates.map((c) => (
                                    <li key={c.name}><span className="text-cyber-pink">&gt;</span> <span className="text-cyber-cyan font-bold">{c.name}</span> {c.issuer} ({c.when})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
        </PageShell>
    );
};

export default AboutMe;
