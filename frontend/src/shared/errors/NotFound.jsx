import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import ErrorScreen from './ErrorScreen';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const NotFound = () => {
    useDocumentMeta({ title: 'Page not found', noindex: true });
    const { pathname } = useLocation();
    return (
        <ErrorScreen
            code="404"
            heading="System Failure: Coordinates Unknown"
            log={[`GET ${pathname}`, 'Error Code: ERR_PAGE_NOT_FOUND', 'The requested resource vector could not be located in this sector.']}
            actions={
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-black transition-all duration-300 font-mono uppercase tracking-wider group">
                    <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Return to Base</span>
                </Link>
            }
        />
    );
};

export default NotFound;
