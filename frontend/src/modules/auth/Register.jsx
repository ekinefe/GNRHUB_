import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Mail, Lock, UserPlus, User } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import Input from '@/shared/ui/Input';
import Checkbox from '@/shared/ui/Checkbox';
import CyberButton from '@/shared/ui/CyberButton';
import TextType from '@/shared/animations/TextType';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const Register = () => {
    useDocumentMeta({ title: 'Create account', noindex: true });
    // State for all form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // State for UI feedback
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // --- 1. FRONT-END VALIDATION ---
        if (password !== confirmPassword) {
            setError("SECURITY ALERT: Passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("SECURITY ALERT: Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        if (!agreedToTerms) {
            setError("ACCESS DENIED: You must agree to the System Protocols (Terms & Conditions).");
            setLoading(false);
            return;
        }

        // --- 2. SEND TO SUPABASE ---
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                // Pass the extra fields into Supabase's user metadata
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        username: username,
                    }
                }
            });

            if (error) throw error;

            // 3. SUCCESS STATE
            setMessage("INITIATION_SUCCESSFUL. Check your email to verify your access vector.");

            // Optional: Clear form
            setFirstName('');
            setLastName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setAgreedToTerms(false);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-20">
            <div className="max-w-xl w-full relative group">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan opacity-20 blur transition duration-1000 group-hover:opacity-40" />

                <div className="relative bg-cyber-black border border-cyber-border p-8 shadow-2xl">

                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-cyber-border pb-4 mb-6">
                        <Terminal className="w-6 h-6 text-cyber-pink" />

                        <h2 className="text-2xl font-sans font-bold text-white uppercase tracking-widest">
                            <TextType
                                text={["NEW_USER_REGISTRATION"]}
                                initialDelay={100}
                                typingSpeed={75}
                                pauseDuration={1500}
                                loop={false}
                                showCursor
                                cursorCharacter="_"
                            />
                        </h2>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-3 border border-red-500 bg-red-500/10 text-red-500 font-mono text-sm">
                            &gt; {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-6 p-3 border border-cyber-success bg-cyber-success/10 text-cyber-success font-mono text-sm">
                            &gt; {message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-6">

                        {/* 2-Column Grid for Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={<><User className="w-3 h-3" /> FIRST_NAME</>}
                                type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                            />
                            <Input
                                label={<><User className="w-3 h-3" /> LAST_NAME</>}
                                type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                            />
                        </div>

                        {/* Username & Email */}
                        <Input
                            label={<><Terminal className="w-3 h-3" /> USERNAME</>}
                            type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe_99" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                        />

                        <Input
                            label={<><Mail className="w-3 h-3" /> EMAIL_ADDRESS</>}
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                        />

                        {/* 2-Column Grid for Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={<><Lock className="w-3 h-3" /> PASSWORD</>}
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                            />
                            <Input
                                label={<><Lock className="w-3 h-3" /> CONFIRM_PASSWORD</>}
                                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                            />
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="pt-2">
                            <Checkbox
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                label={<span className="text-xs text-cyber-muted leading-relaxed">I acknowledge that I have read and agree to the <Link to="/terms" className="text-cyber-cyan hover:text-cyber-pink underline underline-offset-2">System Protocols (Terms)</Link> and <Link to="/privacy" className="text-cyber-cyan hover:text-cyber-pink underline underline-offset-2">Data Privacy Directives</Link>.</span>}
                            />
                        </div>

                        <div className="pt-4">
                            <CyberButton
                                variant="primary"
                                icon={UserPlus}
                                disabled={loading}
                                className="w-full justify-center"
                            >
                                {loading ? "PROCESSING_DATA..." : "INITIALIZE_USER"}
                            </CyberButton>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-6 border-t border-cyber-border text-center">
                        <p className="font-mono text-xs text-cyber-muted">
                            ALREADY HAVE CLEARANCE?{' '}
                            <Link to="/login" className="text-cyber-cyan hover:text-cyber-pink transition-colors underline underline-offset-4">
                                AUTHENTICATE_HERE
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;