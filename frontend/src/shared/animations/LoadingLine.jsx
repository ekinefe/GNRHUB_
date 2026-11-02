import React from 'react';
import AsciiSpinner from './AsciiSpinner';

// "Loading posts..." with the spinner in front. The text is what assistive technology reads (role="status").
export default function LoadingLine({ children, className = '' }) {
    return (
        <p role="status" className={`font-mono text-cyber-muted ${className}`.trim()}>
            <AsciiSpinner className="text-cyber-pink mr-2" />{children}
        </p>
    );
}
