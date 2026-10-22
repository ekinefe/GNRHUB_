import React from 'react';

// Restrained ASCII (GNR-158): the wordmark only, decorative, in the accent colour.
// Hidden from screen readers (the name is already on the page as real text) and from very narrow screens.
const GNR = [
    '  ___ _  _ ___ ',
    ' / __| \\| | _ \\',
    "| (_ | .' |   /",
    ' \\___|_|\\_|_|_\\',
].join('\n');

const AsciiWordmark = ({ className = '' }) => (
    <pre aria-hidden="true" data-testid="ascii-wordmark" className={`hidden sm:block text-cyber-pink text-[18px] leading-[1.2] select-none overflow-x-auto ${className}`}>{GNR}</pre>
);

export default AsciiWordmark;
