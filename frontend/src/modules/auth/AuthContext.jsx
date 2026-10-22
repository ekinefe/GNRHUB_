import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from './authClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        authClient.getSession().then((session) => {
            if (!alive) return;
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => { alive = false; };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
