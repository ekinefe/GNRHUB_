import React from 'react';
import { Link } from 'react-router-dom';
import { brand } from '@/shared/config/brand';
import { build } from '@/shared/config/build';
import { profile } from '@/shared/config/profile';
import { features } from '@/shared/config/features';
import { setReduceEffects, useUserReducedEffects } from '@/shared/config/effects';

const nav = [
    features.tools && { to: '/tools', label: 'Tools' },
    features.blogs && { to: '/blogs', label: 'Blogs' },
    { to: '/projects', label: 'Projects' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
].filter(Boolean);

const external = [
    { href: profile.github, label: 'GitHub' },
    { href: profile.linkedin, label: 'LinkedIn' },
    { href: `mailto:${profile.email}`, label: 'Email' },
];

const linkClass = 'text-cyber-muted hover:text-cyber-pink transition-colors';

const Footer = () => {
    const reduce = useUserReducedEffects();
    return (
    <footer className="border-t border-cyber-border bg-cyber-black font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid gap-8 md:grid-cols-4">
            <div>
                <p className="text-white font-bold tracking-wider mb-2">{brand.name}</p>
                <p className="text-cyber-muted leading-relaxed">Portfolio and small tools.</p>
            </div>

            <nav aria-label="Footer" className="space-y-2">
                <p className="text-cyber-text uppercase tracking-wider mb-2">Navigate</p>
                {nav.map((item) => (
                    <Link key={item.to} to={item.to} className={`block ${linkClass}`}>{item.label}</Link>
                ))}
            </nav>

            <div className="space-y-2">
                <p className="text-cyber-text uppercase tracking-wider mb-2">Contact</p>
                {external.map((item) => (
                    <a key={item.label} href={item.href} className={`block ${linkClass}`}
                        {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {item.label}
                    </a>
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-cyber-text uppercase tracking-wider mb-2">Legal</p>
                <Link to="/privacy" className={`block ${linkClass}`}>Privacy</Link>
                <Link to="/terms" className={`block ${linkClass}`}>Terms</Link>
                <Link to="/colophon" className={`block ${linkClass}`}>Colophon</Link>
            </div>
        </div>

        <div className="border-t border-cyber-border/60">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-cyber-muted">
                <span>
                    &copy; {new Date().getFullYear()} {brand.name} · Code:{' '}
                    <a href={profile.license.url} target="_blank" rel="noopener noreferrer" className={linkClass}>{profile.license.name} licence</a>
                </span>
                <button type="button" aria-pressed={reduce} onClick={() => setReduceEffects(!reduce)} className="hover:text-cyber-pink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                    Reduce effects: {reduce ? 'on' : 'off'}
                </button>
                <span data-testid="build-info">v{build.version} · build {build.sha}{build.date ? ` · ${build.date}` : ''}</span>
            </div>
        </div>
    </footer>
    );
};

export default Footer;
