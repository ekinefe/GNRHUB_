import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import CyberButton from '@/shared/ui/CyberButton';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import AdminLogin from './AdminLogin';
import AdminHome from './AdminHome';
import { AdminContext } from './AdminContext';
import { adminFetch } from './api';
import { sections } from './sections';

// /admin: asks the server who you are, then shows either the sign-in form or the shell with the sections.
// Nothing here is protected by the browser; every admin API route checks the session itself.
const AdminApp = () => {
    useDocumentMeta({ title: 'Admin', noindex: true });
    const [state, setState] = useState('checking'); // checking | signedOut | signedIn
    const [needsCode, setNeedsCode] = useState(false);
    const [summary, setSummary] = useState(null);

    const check = useCallback(async () => {
        const result = await adminFetch('/api/admin/me');
        setNeedsCode(result.data?.needsCode === true);
        // A 200 is not enough: without the API (plain `npm run dev`) the page itself answers with HTML.
        setState(result.ok && result.data?.ok === true ? 'signedIn' : 'signedOut');
    }, []);

    useEffect(() => { check(); }, [check]);

    const refreshSummary = useCallback(async () => {
        const res = await adminFetch('/api/admin/summary');
        if (res.ok && res.data?.messages) setSummary(res.data);
    }, []);
    useEffect(() => { if (state === 'signedIn') refreshSummary(); }, [state, refreshSummary]);

    const signOut = async () => {
        await adminFetch('/api/admin/logout', { method: 'POST' });
        setSummary(null);
        setState('signedOut');
    };

    return (
        <PageShell width="5xl">
            <div className="pt-16 pb-24">
                {state === 'checking' && <p role="status" className="font-mono text-cyber-muted">Checking sign-in...</p>}
                {state === 'signedOut' && <AdminLogin onSignedIn={check} needsCode={needsCode} />}
                {state === 'signedIn' && (
                    <AdminContext.Provider value={{ summary, refreshSummary }}>
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border pb-4">
                            <h1 className="text-3xl font-mono font-bold text-white">Admin</h1>
                            <CyberButton variant="ghost" icon={LogOut} onClick={signOut}>Sign out</CyberButton>
                        </div>
                        {sections.length > 0 && (
                            <nav aria-label="Admin sections" className="flex flex-wrap gap-6 font-mono text-sm">
                                {sections.map((s) => (
                                    <NavLink key={s.path} to={`/admin/${s.path}`} className={({ isActive }) => (isActive ? 'text-cyber-pink' : 'text-cyber-muted hover:text-cyber-pink')}>
                                        {s.label}{s.path === 'messages' && summary?.messages.unread > 0 && <span className="ml-2 px-1.5 py-0.5 text-xs bg-cyber-pink text-black" aria-label={`${summary.messages.unread} unread`}>{summary.messages.unread}</span>}
                                    </NavLink>
                                ))}
                            </nav>
                        )}
                        <Routes>
                            {sections.map((s) => <Route key={s.path} path={`${s.path}/*`} element={s.element} />)}
                            <Route path="*" element={<AdminHome />} />
                        </Routes>
                    </div>
                    </AdminContext.Provider>
                )}
            </div>
        </PageShell>
    );
};

export default AdminApp;
