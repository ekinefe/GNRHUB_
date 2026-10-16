import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';
import ErrorScreen from './ErrorScreen';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const RETRY_KEY = 'auto-retried';

const reload = () => window.location.reload();

const ServerError = () => {
    useDocumentMeta({ title: 'Something went wrong', noindex: true });

    // Retry on its own once per session; a second failure stays put so a persistent error cannot reload forever.
    const autoRetry = useMemo(() => {
        try {
            if (sessionStorage.getItem(RETRY_KEY)) return undefined;
            return {
                seconds: 15,
                onRetry: () => {
                    sessionStorage.setItem(RETRY_KEY, '1');
                    reload();
                },
            };
        } catch {
            return undefined;
        }
    }, []);

    return (
        <ErrorScreen
            code="500 ERROR"
            heading="CRITICAL SYSTEM FAILURE"
            tone="alert"
            icon={<ServerCrash className="w-20 h-20 text-cyber-offline animate-pulse" />}
            log={['DIAGNOSTIC REPORT:', 'The central processing unit encountered an unrecoverable exception.', 'Connection to the mainframe has been severed.', 'Recommendation: Immediate manual override (Refresh).']}
            autoRetry={autoRetry}
            actions={
                <>
                    <button onClick={reload} className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-offline text-black font-bold hover:bg-white transition-all duration-300 font-mono uppercase tracking-wider cursor-pointer">
                        <RefreshCw className="w-4 h-4" />
                        <span>Initiate Reboot</span>
                    </button>
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-700 text-zinc-400 hover:border-cyber-pink hover:text-cyber-pink transition-all duration-300 font-mono uppercase tracking-wider">
                        <span>Safe Mode (Home)</span>
                    </Link>
                </>
            }
        />
    );
};

export default ServerError;
