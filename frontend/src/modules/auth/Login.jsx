import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, User, Lock, LogIn } from 'lucide-react';
import { authClient } from './authClient';
import Input from '@/shared/ui/Input';
import CyberButton from '@/shared/ui/CyberButton';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const Login = () => {
    useDocumentMeta({ title: 'Log in', noindex: true });
    // 'identifier' accepts an email or a username
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // The identifier may be an email or a username; the backend resolves it.
            const { error: authError } = await authClient.signIn({ identifier, password });
            if (authError) throw authError;

            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main id="main" className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full relative group">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan opacity-20 blur transition duration-1000 group-hover:opacity-40" />

                <div className="relative bg-cyber-black border border-cyber-border p-8 shadow-2xl">

                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-cyber-border pb-4 mb-6">
                        <Terminal className="w-6 h-6 text-cyber-cyan" />
                        <h2 className="text-2xl font-sans font-bold text-white uppercase tracking-widest">
                            AUTHENTICATE
                        </h2>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 border border-red-500 bg-red-500/10 text-red-500 font-mono text-sm">
                            &gt; ERROR: {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label={<><User className="w-3 h-3" /> USERNAME_OR_EMAIL</>}
                            type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="name@example.com OR johndoe_99"
                        />

                        <Input
                            label={<><Lock className="w-3 h-3" /> SECURITY_KEY (PASSWORD)</>}
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        />

                        <div className="pt-2">
                            <CyberButton
                                variant="primary"
                                icon={LogIn}
                                disabled={loading}
                                className="w-full justify-center"
                            >
                                {loading ? "VERIFYING..." : "ACCESS_SYSTEM"}
                            </CyberButton>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-6 border-t border-cyber-border text-center">
                        <p className="font-mono text-xs text-cyber-muted">
                            NO CLEARANCE YET?{' '}
                            <Link to="/register" className="text-cyber-pink hover:text-white transition-colors underline underline-offset-4">
                                REQUEST_ACCESS
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;