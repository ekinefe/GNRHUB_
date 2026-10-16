import React from 'react';
import { brand } from '@/shared/config/brand';

// The lockup: bold GNR, lighter "digital", a pink cursor, and the small pink version tag.
// Same shape as public/og.png and the favicon mark; see docs/brand.md.
const Wordmark = ({ tag = true }) => (
    <span className="font-mono whitespace-nowrap" aria-hidden="true">
        <span className="font-extrabold">GNR</span>
        <span className="font-light">digital</span>
        <span className="text-cyber-pink">_</span>
        {tag && <span className="text-cyber-pink text-xs align-top font-bold ml-1">{brand.version}</span>}
    </span>
);

export default Wordmark;
