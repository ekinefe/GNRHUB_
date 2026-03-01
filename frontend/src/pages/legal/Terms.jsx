import React from 'react';
import { Terminal, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen p-4 py-12 flex justify-center">
            <div className="max-w-4xl w-full">

                {/* Back Navigation */}
                <div className="mb-6">
                    <Link to="/register" className="flex items-center gap-2 text-cyber-muted hover:text-cyber-pink transition-colors font-mono text-sm w-fit">
                        <ArrowLeft className="w-4 h-4" /> RETURN_TO_PREVIOUS
                    </Link>
                </div>

                {/* Main Content Box */}
                <div className="bg-cyber-black border border-cyber-border p-8 shadow-2xl relative">

                    {/* Header */}
                    <div className="flex items-center gap-4 border-b border-cyber-border pb-6 mb-8">
                        <ShieldAlert className="w-8 h-8 text-cyber-pink" />
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-white uppercase tracking-widest">
                                SYSTEM PROTOCOLS
                            </h1>
                            <p className="font-mono text-xs text-cyber-muted mt-1 flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> TERMS & CONDITIONS_v1.0.0
                            </p>
                        </div>
                    </div>

                    {/* Legal Text */}
                    <div className="space-y-8 font-mono text-sm leading-relaxed text-gray-300">

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">01.</span> ACCEPTANCE OF PROTOCOLS
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                By initializing a session, creating an account, or accessing the GNRHUB infrastructure (the "System"), you agree to be bound by these System Protocols. If you do not agree to every clause within this document, you must immediately terminate your connection and cease all use of the System.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">02.</span> NATURE OF THE SYSTEM & "AS-IS" PROVISION
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                The System is provided strictly on an <strong className="text-white">"AS-IS"</strong> and <strong className="text-white">"AS-AVAILABLE"</strong> basis. It operates entirely as an experimental architecture and portfolio initiative. We make absolutely no warranties, express or implied, regarding the System's reliability, uptime, accuracy, or fitness for a particular purpose. You utilize these tools entirely at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">03.</span> LIMITATION OF LIABILITY (SECURITY & BREACHES)
                            </h2>
                            <div className="pl-6 border-l border-cyber-border/50 text-cyber-muted space-y-3">
                                <p>Under no circumstances shall the System's creator, administrators, or affiliates be held liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform. This absolute limitation of liability includes, but is not limited to:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong className="text-cyber-pink">Malicious Incursions:</strong> Data loss, exposure, or corruption resulting from unauthorized access, hacking, zero-day exploits, or stolen credentials.</li>
                                    <li><strong className="text-cyber-pink">System Failure:</strong> Loss of service, corrupted PDF outputs, or failed email deliveries.</li>
                                </ul>
                                <p>By using the System, you explicitly waive any right to pursue legal or financial restitution against the creator in the event of a cyberattack, data breach, or catastrophic failure.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">04.</span> INTELLECTUAL PROPERTY, OWNERSHIP & OPEN SOURCE
                            </h2>
                            <div className="pl-6 border-l border-cyber-border/50 text-cyber-muted space-y-3">
                                <p>The System's proprietary source code, custom UI/UX design, database architectures, and generated methodologies remain the exclusive intellectual property of the creator.</p>
                                <p><strong className="text-white">Third-Party Integrations:</strong> This System actively utilizes third-party open-source frameworks, libraries, and components (including but not limited to React, Tailwind CSS, and React Bits). These open-source assets remain the intellectual property of their respective original authors and are used under their specific permissive licenses (e.g., MIT, Apache 2.0).</p>
                                <p>Accessing the System grants you a revocable, limited, non-exclusive license to use the tools. You may not copy, reverse-engineer, scrape, or distribute the proprietary, custom-built segments of this System.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">05.</span> BUSINESS TRANSFERS & FUTURE ASSIGNMENT
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                The creator retains the absolute and unencumbered right to sell, transfer, assign, or license the System, its underlying codebase, and all associated user data to a third party at any time, without prior notice or required consent from the users.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;