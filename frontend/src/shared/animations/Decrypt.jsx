import React from 'react';
import DecryptedText from './DecryptedText';
import { useReducedEffects } from '@/shared/config/effects';

const TONES = {
    info: 'text-cyber-cyan font-bold',
    success: 'text-cyber-success font-bold',
    alert: 'text-cyber-offline font-bold',
    pink: 'text-cyber-pink font-bold',
    muted: 'text-cyber-muted',
};

// The "Found 3 results" scramble-to-text effect, for counters, status lines, toasts, titles and success messages.
//
//   text       what to show
//   replayKey  the animation replays only when this changes. Defaults to `text`.
//              Key a search counter by the result COUNT, not the query, so typing does not make it flicker.
//   tone       info | success | alert | pink | muted
//
// Screen readers get the plain text (the scrambling is aria-hidden); with reduced effects (OS setting or the footer switch)
// the text is shown as is, with no animation.
export default function Decrypt({ text, replayKey = text, tone = 'info', className = '', as: Tag = 'span' }) {
    const reduced = useReducedEffects();
    const classes = `${TONES[tone]} ${className}`.trim();

    if (reduced) return <Tag className={classes}>{text}</Tag>;
    return (
        <Tag className={className}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                <DecryptedText
                    key={String(replayKey)}
                    text={text}
                    animateOn="view"
                    sequential
                    speed={100}
                    maxIterations={10}
                    className={TONES[tone]}
                    encryptedClassName="text-cyber-muted"
                />
            </span>
        </Tag>
    );
}
