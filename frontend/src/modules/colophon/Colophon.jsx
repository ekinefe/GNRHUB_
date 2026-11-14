import React from 'react';
import PageShell from '@/shared/layout/PageShell';
import PageHeader from '@/shared/layout/PageHeader';
import SectionHeading from '@/shared/ui/SectionHeading';
import { build } from '@/shared/config/build';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const DIAGRAM = `  browser
     |
     v
  Cloudflare Worker  --->  static site (Vite build)
     |
     +--> /api/*  (Worker routes)`;

const STACK = [
    ['React', 'react'],
    ['React Router', 'react-router-dom'],
    ['Vite', 'vite'],
    ['Tailwind CSS', 'tailwindcss'],
    ['Vitest', 'vitest'],
    ['GSAP', 'gsap'],
    ['Lucide icons', 'lucide-react'],
];

const Section = ({ title, children }) => (
    <section className="mb-12">
        <SectionHeading title={title} className="mb-4" />
        {children}
    </section>
);

const Colophon = () => {
    useDocumentMeta({ title: 'Colophon', description: 'How this site is built: stack, versions and what it does not use.' });
    return (
        <PageShell>
            <PageHeader title="Colophon" description="How this site is built. The version numbers below are read from the installed packages at build time." />

            <div className="max-w-4xl pb-12">
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
                <pre aria-label="Architecture diagram: browser to a Cloudflare Worker, which serves the static site and the API routes" className="bg-cyber-panel border border-cyber-border p-4 font-mono text-xs text-cyber-pink overflow-x-auto">{DIAGRAM}</pre>
            </Section>

            <Section title="What it does and does not use">
                <ul className="font-mono text-sm text-cyber-text space-y-2 list-disc pl-5">
                    <li>No ad or third-party tracking scripts. Page views are only counted per page and day, with no cookie or address.</li>
                    <li>No cookies of its own. Signing in stores a session in your browser's local storage.</li>
                    <li>Fonts (JetBrains Mono, Space Grotesk) are served from this site, not from a font service.</li>
                    <li>Animations respect your system setting and the "Reduce effects" switch in the footer.</li>
                </ul>
            </Section>
            </div>
        </PageShell>
    );
};

export default Colophon;
