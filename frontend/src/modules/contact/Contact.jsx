import React from 'react';
import { Mail } from 'lucide-react';
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
            <section className="relative pt-24 pb-12">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">/CONTACT</h1>
                <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed mb-8">
                    Email is the best way to reach me. A good first message says who you are, what you are working on, and what you would like from me.
                </p>

                <p className="font-mono text-lg text-cyber-cyan mb-6 break-all">{profile.email}</p>

                <div className="flex flex-wrap items-center gap-4">
                    <a href={`mailto:${profile.email}`}>
                        <CyberButton variant="primary" icon={Mail}>SEND_EMAIL</CyberButton>
                    </a>
                    <CopyEmail email={profile.email} />
                </div>
            </section>
        </PageShell>
    );
};

export default Contact;
