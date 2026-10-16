import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import { accessOf, ACCESS } from './access';
import { supabase } from '@/shared/lib/supabase';
import Badge from '@/shared/ui/Badge';

// Guest: a Log in link. Signed in: email, a role badge and Log out.
export default function AccountMenu() {
    const { user, loading } = useAuth();
    if (loading) return null;

    if (!user) {
        return (
            <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 border border-cyber-border font-mono text-sm uppercase tracking-wider text-cyber-text hover:border-cyber-pink hover:text-cyber-pink transition-colors focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none">
                <LogIn className="w-4 h-4" aria-hidden="true" /> Log in
            </Link>
        );
    }

    const level = accessOf(user);
    return (
        <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-cyber-muted truncate max-w-[12rem]" title={user.email}>{user.email}</span>
            <Badge tone={level === ACCESS.ADMIN ? 'pink' : 'neutral'}>{level}</Badge>
            <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-2 px-3 py-2 border border-cyber-border text-cyber-muted hover:text-cyber-pink hover:border-cyber-pink transition-colors focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none"
            >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Log out
            </button>
        </div>
    );
}
