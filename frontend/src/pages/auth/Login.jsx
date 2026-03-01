import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, User, Lock, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CyberButton from '../../components/ui/CyberButton';

const Login = () => {
    // Changed 'email' to 'identifier' to handle both formats
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
            let loginEmail = identifier;

            // 1. Is it a username? (If it doesn't contain '@', we assume it is)
            if (!identifier.includes('@')) {
                // Call our secure database function to get the email
                const { data, error: rpcError } = await supabase.rpc('get_email_from_username', {
                    p_username: identifier
                });

                if (rpcError || !data) {
                    // We throw a generic error for security (prevents username guessing)
                    throw new Error("Invalid username or password.");
                }

                // Swap the username out for the real email
                loginEmail = data;
            }

            // 2. Authenticate with Supabase using the email
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            });

            if (authError) throw authError;

            // === ADD THIS NEW LINE ===
            // 3. Update the audit logs in our public.profiles table
            await supabase.rpc('log_user_login');
            // =========================

            // 4. Success! Redirect to the tools or dashboard page
            navigate('/tools');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
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
                        <div className="space-y-2">
                            <label className="font-mono text-xs text-cyber-muted uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3 h-3" /> USERNAME_OR_EMAIL
                            </label>
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-3 focus:outline-none focus:border-cyber-cyan transition-colors placeholder-cyber-muted/50"
                                placeholder="sysadmin@gnrhub.com OR johndoe_99"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-mono text-xs text-cyber-muted uppercase tracking-wider flex items-center gap-2">
                                <Lock className="w-3 h-3" /> SECURITY_KEY (PASSWORD)
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-3 focus:outline-none focus:border-cyber-cyan transition-colors placeholder-cyber-muted/50"
                                placeholder="••••••••"
                            />
                        </div>

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
        </div>
    );
};

export default Login;