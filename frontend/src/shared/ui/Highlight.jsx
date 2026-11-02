import React from 'react';
import { highlightParts } from '@/shared/lib/searchText';

// Wraps the parts of `text` that match `query` in a pink highlight.
export default function Highlight({ text, query }) {
    return highlightParts(text, query).map((part, i) =>
        part.match ? (
            <mark key={i} className="bg-cyber-pink/25 text-cyber-pink rounded-sm px-0.5">{part.text}</mark>
        ) : (
            <React.Fragment key={i}>{part.text}</React.Fragment>
        )
    );
}
