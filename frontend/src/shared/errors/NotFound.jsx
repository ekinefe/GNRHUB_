import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, CornerDownRight } from 'lucide-react';
import ErrorScreen from './ErrorScreen';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { sitemapPaths } from '@/shared/config/seo';
import { suggestRoute } from '@/shared/lib/suggestRoute';

const shown = (path) => (path.length > 60 ? `${path.slice(0, 57)}...` : path);

// A shell that tried to open the address you typed, then offers the closest real page.
const NotFound = () => {
    useDocumentMeta({ title: 'Page not found', noindex: true });
    const { pathname } = useLocation();
    const guess = suggestRoute(pathname, sitemapPaths);
    return (
        <ErrorScreen
            code="404"
            heading="Page not found"
            log={[
                `cd ${shown(pathname)}`,
                `bash: cd: ${shown(pathname)}: No such file or directory (ERR_PAGE_NOT_FOUND)`,
                `ls /  ->  ${sitemapPaths.filter((p) => p !== '/').map((p) => p.slice(1)).join('  ')}`,
            ]}
            actions={
                <>
                    {guess && (
                        <Link to={guess} className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-pink text-black hover:bg-white transition-colors font-mono uppercase tracking-wider">
                            <CornerDownRight className="w-4 h-4" />
                            <span>Did you mean {guess}?</span>
                        </Link>
                    )}
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-black transition-all duration-300 font-mono uppercase tracking-wider group">
                        <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                        <span>Back to home</span>
                    </Link>
                </>
            }
        />
    );
};

export default NotFound;
