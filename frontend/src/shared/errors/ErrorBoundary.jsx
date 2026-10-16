import React from 'react';
import { useLocation } from 'react-router-dom';
import ServerError from './ServerError';

// Failed lazy chunk loads (stale deploy, offline) surface as one of these messages.
const isChunkError = (error) =>
    /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(error?.message ?? '');

class Boundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Uncaught render error:', error, info?.componentStack);
        // A chunk that 404s after a deploy is fixed by one reload; guard against a reload loop.
        if (isChunkError(error) && !sessionStorage.getItem('gnrdigital:chunk-reloaded')) {
            sessionStorage.setItem('gnrdigital:chunk-reloaded', '1');
            window.location.reload();
        }
    }

    componentDidUpdate(prevProps) {
        // Navigating somewhere else (e.g. "Safe Mode (Home)") clears the error.
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
    }

    render() {
        return this.state.error ? <ServerError /> : this.props.children;
    }
}

// Must sit inside the Router: ServerError uses <Link>.
export default function ErrorBoundary({ children }) {
    const { pathname } = useLocation();
    return <Boundary resetKey={pathname}>{children}</Boundary>;
}
