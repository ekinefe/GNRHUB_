import React from 'react';
import CyberButton from '../components/ui/CyberButton';
import CyberCard from '../components/ui/CyberCard';
import { Zap, Shield, Terminal, Layout } from 'lucide-react';

const DesignSystem = () => {
    return (
        // 1. The Outer Wrapper (Grid Background)
        <div className="min-h-screen bg-cyber-black bg-grid-pattern [background-size:50px_50px] text-cyber-text p-4 md:p-12 flex justify-center">

            {/* 2. The Content Container (The "Background behind the text") */}
            <div className="max-w-5xl w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen p-8 shadow-2xl relative">

                {/* Optional: Top Border Line for extra style */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan" />

                <header className="space-y-4 mb-12 border-b border-cyber-border pb-8">
                    <div className="flex items-center gap-3 text-cyber-pink mb-2">
                        <Layout className="w-6 h-6" />
                        <span className="font-mono text-sm tracking-widest">SYSTEM_UI // V2.0</span>
                    </div>
                    <h1 className="text-5xl font-sans font-bold text-white tracking-tighter">
                        DESIGN PROTOCOLS
                    </h1>
                    <p className="text-cyber-muted font-mono max-w-2xl">
                        &gt; Establishing visual coherence using the "JetBrains" monospace standard.<br />
                        &gt; Primary visual signature: <span className="text-cyber-pink">#FF318C (Cyber Pink)</span>.
                    </p>
                </header>

                {/* Section: Typography */}
                <section className="mb-16">
                    <h2 className="text-xl font-sans text-white border-b border-cyber-border pb-2 mb-6">
                        01 // TYPOGRAPHY
                    </h2>
                    <div className="space-y-6 bg-cyber-panel p-6 border border-cyber-border">
                        <div>
                            <h1 className="text-4xl font-sans text-white mb-2">Header 1 (Space Grotesk)</h1>
                            <p className="font-mono text-xs text-cyber-muted">Used for: Page Titles, Hero Sections</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-sans text-white mb-2">Header 2 (Section Title)</h2>
                            <p className="font-mono text-xs text-cyber-muted">Used for: Section Dividers</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-sans text-white mb-2">Header 3 (Section Title)</h3>
                            <h4 className="text-lg font-sans text-white mb-2">Header 4 (Section Title)</h4>
                            <h5 className="text-md font-sans text-white mb-2">Header 5 (Section Title)</h5>
                            <h6 className="text-sm font-sans text-white mb-2">Header 6 (Section Title)</h6>
                            <p className="text-base font-sans text-white mb-2">Paragraph (Section Title)</p>
                            <p className="text-s font-sans text-white mb-2">Paragraph (Section Title)</p>
                            <p className="text-sm font-sans text-white mb-2">Paragraph (Section Title)</p>
                            <p className="text-xs font-sans text-white mb-2">Paragraph (Section Title)</p>
                        </div>
                        <div>
                            <p className="font-mono text-cyber-text leading-relaxed">
                                Body Text (JetBrains Mono). The quick brown fox jumps over the lazy dog.
                                System status: <span className="text-cyber-active">ONLINE</span>.
                                Warning level: <span className="text-cyber-offline">CRITICAL</span>.
                            </p>
                        </div>

                        {/* Terminal Look Demo */}
                        <div className="mt-8">
                            <p className="font-mono text-xs text-cyber-muted mb-2 uppercase tracking-widest">
                                // SYSTEM_LOGS (TRY SELECTING THIS TEXT)
                            </p>
                            <div className="bg-black border border-cyber-border rounded-md p-4 font-mono text-sm relative group">
                                {/* Terminal Header Decoration */}
                                <div className="absolute top-0 right-0 p-2 flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-cyber-border"></div>
                                    <div className="w-2 h-2 rounded-full bg-cyber-border"></div>
                                </div>

                                <pre className="overflow-x-auto text-cyber-text">
                                    <code>
                                        <span className="text-cyber-pink">root@gnrhub:~$</span> ./init_sequence.sh{'\n'}
                                        <span className="text-cyber-muted">&gt; Loading modules...</span>{'\n'}
                                        <span className="text-cyber-success">[OK]</span> Core Processor{'\n'}
                                        <span className="text-cyber-success">[OK]</span> Memory Banks (32GB){'\n'}
                                        <span className="text-cyber-success">[OK]</span> Network Interface{'\n'}
                                        <span className="text-cyber-muted">&gt; Establishing secure connection...</span>{'\n'}
                                        <span className="text-cyber-primary">Connection established (Latency: 12ms)</span>
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Buttons */}
                <section className="mb-16">
                    <h2 className="text-xl font-sans text-white border-b border-cyber-border pb-2 mb-6">
                        02 // INTERFACE CONTROLS
                    </h2>
                    <div className="flex flex-wrap gap-4 p-6 bg-cyber-panel border border-cyber-border">
                        <CyberButton variant="primary" icon={Zap}>Initialize</CyberButton>
                        <CyberButton variant="secondary" icon={Terminal}>Execute</CyberButton>
                        <CyberButton variant="alert" icon={Shield}>Purge System</CyberButton>
                        <CyberButton variant="secondary">Cancel</CyberButton>
                        <CyberButton variant="ghost">Cancel</CyberButton>
                    </div>
                </section>

                {/* Section: Cards */}
                <section className="mb-16">
                    <h2 className="text-xl font-sans text-white border-b border-cyber-border pb-2 mb-6">
                        03 // DATA CONTAINERS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CyberCard title="System Metrics">
                            <div className="flex justify-between font-mono text-sm mb-2">
                                <span>CPU_LOAD</span>
                                <span className="text-cyber-pink">12%</span>
                            </div>
                            <div className="w-full bg-cyber-border h-1">
                                <div className="bg-cyber-pink h-1 w-[12%]" />
                            </div>
                        </CyberCard>

                        <CyberCard title="Security Status">
                            <p className="text-sm text-cyber-muted">Connection encrypted via TLS 1.3.</p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyber-active rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-cyber-active">SECURE CONNECTION</span>
                            </div>
                        </CyberCard>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DesignSystem;