import React from 'react';

// Wrap any canvas / WebGL / heavy effect. If it throws (no WebGL, bad context, a bug), the page
// keeps working and `fallback` is shown instead of the error screen.
export default class SceneBoundary extends React.Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error) {
        console.warn('Visual effect failed, showing fallback:', error);
    }

    render() {
        return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
    }
}
