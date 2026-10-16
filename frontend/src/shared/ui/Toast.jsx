import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const tones = {
    info: 'border-cyber-cyan/50 text-cyber-cyan',
    success: 'border-cyber-success/50 text-cyber-success',
    error: 'border-cyber-offline/50 text-cyber-offline',
};

// Wrap the app once, then call useToast()({ message, tone }) anywhere.
export function ToastProvider({ children, duration = 4000 }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), []);
    const push = useCallback(({ message, tone = 'info' }) => {
        const id = nextId.current++;
        setToasts((all) => [...all, { id, message, tone }]);
        setTimeout(() => dismiss(id), duration);
    }, [dismiss, duration]);

    const value = useMemo(() => push, [push]);
    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2" role="status" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`flex items-center gap-4 bg-cyber-panel border px-4 py-3 font-mono text-sm shadow-lg ${tones[t.tone]}`}>
                        <span>{t.message}</span>
                        <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-cyber-muted hover:text-white focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none">&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
