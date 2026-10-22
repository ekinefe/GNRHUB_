import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Shared frame for Privacy and Terms: back link, themed header, numbered sections, last-updated line.
export const LegalLayout = ({ icon: Icon, iconClass, title, tag, updated, children }) => (
    <main id="main" className="min-h-screen p-4 py-12 flex justify-center">
        <div className="max-w-4xl w-full">
            <div className="mb-6">
                <Link to="/" className="flex items-center gap-2 text-cyber-muted hover:text-cyber-pink transition-colors font-mono text-sm w-fit">
                    <ArrowLeft className="w-4 h-4" /> RETURN_TO_PREVIOUS
                </Link>
            </div>

            <div className="bg-cyber-black border border-cyber-border p-8 shadow-2xl relative">
                <div className="flex items-center gap-4 border-b border-cyber-border pb-6 mb-8">
                    <Icon className={`w-8 h-8 ${iconClass}`} />
                    <div>
                        <h1 className="text-3xl font-sans font-bold text-white uppercase tracking-widest">{title}</h1>
                        <p className="font-mono text-xs text-cyber-muted mt-1">{tag} · Last updated: <time dateTime={updated}>{updated}</time></p>
                    </div>
                </div>

                <div className="space-y-8 font-mono text-sm leading-relaxed text-gray-300">{children}</div>
            </div>
        </div>
    </main>
);

export const Section = ({ n, title, children }) => (
    <section>
        <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
            <span className="text-cyber-pink">{n}.</span> {title}
        </h2>
        <div className="pl-6 border-l border-cyber-border/50 text-cyber-muted space-y-3">{children}</div>
    </section>
);
