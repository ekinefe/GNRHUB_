import React from 'react';
import PageShell from '@/shared/layout/PageShell';
import { build } from '@/shared/config/build';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const DIAGRAM = `  browser
     |
     v
  Cloudflare Pages  --->  static site (Vite build)
     |
     +--> /api/*  (Pages Functions)
     |
     +--> Supabase  (sign-in, profiles)`;

const STACK = [
    ['React', 'react'],
    ['React Router', 'react-router-dom'],
    ['Vite', 'vite'],
    ['Tailwind CSS', 'tailwindcss'],
    ['Vitest', 'vitest'],
    ['GSAP', 'gsap'],
    ['Lucide icons', 'lucide-react'],
    ['Supabase JS', '@supabase/supabase-js'],
];

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-mono font-bold text-white border-b border-cyber-border pb-2 mb-4 uppercase tracking-wider">{title}</h2>
        {children}
    </section>
);

const Colophon = () => {
    useDocumentMeta({ title: 'Colophon', description: 'How this site is built: stack, versions and what it does not use.' });
    return (
        <PageShell width="5xl">
            <section className="relative pt-24 pb-8">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-4">/COLOPHON</h1>
                <p className="font-mono text-cyber-muted text-sm leading-relaxed">How this site is built. The version numbers below are read from the installed packages at build time.</p>
            </section>

            <Section title="Stack">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 font-mono text-sm">
                    {STACK.map(([label, pkg]) => (
                        <div key={pkg} className="flex justify-between border-b border-cyber-border/40 py-1">
                            <dt className="text-cyber-text">{label}</dt>
                            <dd className="text-cyber-cyan">{build.stack[pkg] ?? 'unknown'}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section title="This build">
                <p className="font-mono text-sm text-cyber-text" data-testid="colophon-build">
                    commit <span className="text-cyber-cyan">{build.sha}</span>
                    {build.date && <> on <span className="text-cyber-cyan">{build.date}</span></>}
                </p>
                <p className="font-mono text-xs text-cyber-muted mt-2">Pull requests run the unit tests in CI before they can be merged.</p>
            </Section>

            <Section title="How it fits together">
                <pre aria-label="Architecture diagram: browser to Cloudflare Pages, which serves the static site and API functions, with Supabase for sign-in" className="bg-cyber-panel border border-cyber-border p-4 font-mono text-xs text-cyber-pink overflow-x-auto">{DIAGRAM}</pre>
            </Section>

            <Section title="What it does and does not use">
                <ul className="font-mono text-sm text-cyber-text space-y-2 list-disc pl-5">
                    <li>No analytics, ad or tracking scripts.</li>
                    <li>No cookies of its own. Signing in stores a session in your browser's local storage.</li>
                    <li>Fonts (JetBrains Mono, Space Grotesk) currently load from Google Fonts. Self-hosting them is planned.</li>
                    <li>Animations respect your system setting and the "Reduce effects" switch in the footer.</li>
                </ul>
            </Section>
        </PageShell>
    );
};

export default Colophon;
