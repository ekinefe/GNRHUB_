import React from 'react';
import { Database, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
                        <Database className="w-8 h-8 text-cyber-cyan" />
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-white uppercase tracking-widest">
                                DATA PRIVACY DIRECTIVES
                            </h1>
                            <p className="font-mono text-xs text-cyber-muted mt-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> PRIVACY_POLICY_v1.0.0
                            </p>
                        </div>
                    </div>

                    {/* Legal Text */}
                    <div className="space-y-8 font-mono text-sm leading-relaxed text-gray-300">

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">01.</span> DATA ACQUISITION AND USAGE
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                To provide services such as the Auto Mail Sender and CV Maker, the System logs essential user data, including but not limited to: email addresses, usernames, encrypted passwords, and generated usage metadata (e.g., login timestamps, service utilization metrics). This data is strictly used to facilitate platform operations and enforce role-based access limits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">02.</span> VOLUNTARY RISK ACCEPTANCE (THE SECURITY DIRECTIVE)
                            </h2>
                            <div className="pl-6 border-l border-cyber-border/50 text-cyber-muted space-y-3">
                                <p>While the System utilizes industry-standard cryptographic practices and secure database architecture to protect your data, no method of digital transmission or server storage is universally secure.</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong className="text-cyber-pink">Acknowledgment of Risk:</strong> You acknowledge that any data uploaded, entered, or processed through the System may be vulnerable to interception, theft, or unauthorized decryption by malicious third parties.</li>
                                    <li><strong className="text-cyber-pink">Data Forfeiture:</strong> In the event of a hostile breach or stolen database, the System administrators hold zero liability for the exposure of your email, profile data, or generated content.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">03.</span> DATA RETENTION AND DESTRUCTION
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                As an experimental environment, the System is not designed for permanent data warehousing. We reserve the right to purge, delete, or reset the database—including all user profiles, logs, and generated files—at any time, without warning. You are solely responsible for maintaining personal backups of any CVs or data generated here.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">04.</span> MERGERS, ACQUISITIONS, AND INFRASTRUCTURE TRANSFER
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                While there is no immediate intent to commercialize, sell, or transfer ownership of this infrastructure, the System formally reserves the right to do so to adapt to unforeseen operational realities. In the event that the System is acquired by, merged with, or sold to a third-party entity, all collected user data and profiles will be transferred as a core business asset to the acquiring entity.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-cyber-cyan text-lg mb-2 flex items-center gap-2">
                                <span className="text-cyber-pink">05.</span> AMENDMENTS TO DIRECTIVES
                            </h2>
                            <p className="pl-6 border-l border-cyber-border/50 text-cyber-muted">
                                The System administrators reserve the right to modify, alter, or rewrite these Directives at any time. Continued use of the System following any modifications constitutes your formal acceptance of the revised Directives.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;