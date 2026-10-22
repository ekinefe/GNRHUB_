import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Input from '@/shared/ui/Input';
import { adminFetch, loginMessage } from './api';

const AdminLogin = ({ onSignedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const result = await adminFetch('/api/admin/login', { method: 'POST', body: { username, password } });
        setBusy(false);
        if (result.ok) { setPassword(''); onSignedIn(); } else setError(loginMessage(result));
    };

    return (
        <form onSubmit={submit} className="max-w-sm space-y-6" aria-labelledby="admin-login-title">
            <h1 id="admin-login-title" className="text-3xl font-mono font-bold text-white">Admin sign-in</h1>
            <Input label="Username" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p role="alert" className="font-mono text-sm text-cyber-offline">{error}</p>}
            <CyberButton type="submit" icon={LogIn} disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</CyberButton>
        </form>
    );
};

export default AdminLogin;
