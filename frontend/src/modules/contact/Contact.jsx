import React from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import CyberButton from '@/shared/ui/CyberButton';
import { profile } from '@/shared/config/profile';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import CopyEmail from './CopyEmail';

// Launch version: no form and no backend, just a mailto link and a copy button.
const Contact = () => {
    useDocumentMeta({ title: 'Contact', description: 'How to get in touch.' });
    return (
        <PageShell width="5xl">
            <section className="relative pt-24 pb-24 grid gap-16 lg:grid-cols-[3fr_2fr]">
                <div>
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">/CONTACT</h1>
                <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                    Email is the best way to reach me. A good first message says who you are, what you are working on, and what you would like from me.
                </p>

                <p className="font-mono text-lg text-cyber-cyan mb-6 break-all">{profile.email}</p>

                <div className="flex flex-wrap items-center gap-4">
                    <a href={`mailto:${profile.email}`}>
                        <CyberButton variant="primary" icon={Mail}>Send email</CyberButton>
                    </a>
                    <CopyEmail email={profile.email} />
                </div>
                </div>

                <aside aria-labelledby="elsewhere" className="lg:border-l lg:border-cyber-border lg:pl-10 self-start">
                    <h2 id="elsewhere" className="font-mono text-sm text-cyber-muted mb-4">Elsewhere</h2>
                    <ul className="space-y-3 font-mono text-sm">
                        <li>
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-cyber-text hover:text-cyber-pink transition-colors">
                                <Github className="w-4 h-4" /> GitHub, code and projects
                            </a>
                        </li>
                        <li>
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-cyber-text hover:text-cyber-pink transition-colors">
                                <Linkedin className="w-4 h-4" /> LinkedIn, work history
                            </a>
                        </li>
                    </ul>
                    <p className="font-mono text-xs text-cyber-muted mt-6 leading-relaxed">Based in {profile.location.city}, {profile.location.country}. {profile.availability.open ? profile.availability.text + '.' : ''}</p>
                </aside>
            </section>
        </PageShell>
    );
};

export default Contact;
