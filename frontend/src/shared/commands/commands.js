import { features } from '@/shared/config/features';
import { profile } from '@/shared/config/profile';
import { ACCENTS, setAccent, getScanlines, setScanlines } from '@/shared/config/theme';
import { setReduceEffects, userReducedEffects } from '@/shared/config/effects';

// Command palette entries (GNR-49). `run` either navigates/acts (returns nothing, the palette closes)
// or returns text lines to show inside the palette. Hidden commands only appear when typed exactly.
export function buildCommands({ navigate, user = null }) {
    const go = (to) => () => navigate(to);
    const open = (url) => () => { window.open(url, '_blank', 'noopener,noreferrer'); };
    const pages = [
        { title: 'Go to Home', to: '/' },
        { title: 'Go to Projects', to: '/projects' },
        { title: 'Go to About', to: '/about' },
        { title: 'Go to Contact', to: '/contact' },
        features.tools && { title: 'Go to Tools', to: '/tools' },
        features.blogs && { title: 'Go to Blogs', to: '/blogs' },
        { title: 'Go to Colophon', to: '/colophon' },
        { title: 'Go to Privacy', to: '/privacy' },
        { title: 'Go to Terms', to: '/terms' },
    ].filter(Boolean).map((p) => ({ id: `go:${p.to}`, title: p.title, hint: p.to, run: go(p.to) }));

    const visible = [
        ...pages,
        ...ACCENTS.map((a) => ({ id: `accent:${a}`, title: `Accent: ${a}`, hint: 'theme', keywords: 'colour color theme', run: () => setAccent(a) })),
        { id: 'scanlines', title: 'Toggle scanlines', hint: 'theme', keywords: 'crt', run: () => setScanlines(!getScanlines()) },
        { id: 'effects', title: 'Toggle reduce effects', hint: 'motion', keywords: 'motion animation', run: () => setReduceEffects(!userReducedEffects()) },
        { id: 'github', title: 'Open GitHub', hint: 'external', run: open(profile.github) },
        { id: 'linkedin', title: 'Open LinkedIn', hint: 'external', run: open(profile.linkedin) },
    ];

    const hidden = {
        help: () => ['Commands: type to search, Enter to run, Esc to close.', 'Try: whoami, sudo. There may be a code.'],
        whoami: () => [user ? `${user.email ?? 'signed in'} (signed in)` : 'guest (not signed in)', `${profile.location.city}, ${profile.location.country}`],
        sudo: () => ['guest is not in the sudoers file. This incident will be reported.', '(it will not)'],
    };
    return { visible, hidden };
}

export const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** Feed key presses in; returns true when the Konami code has just been completed. */
export function konamiTracker() {
    let at = 0;
    return (key) => {
        const k = key.length === 1 ? key.toLowerCase() : key;
        at = k === KONAMI[at] ? at + 1 : k === KONAMI[0] ? 1 : 0;
        if (at === KONAMI.length) { at = 0; return true; }
        return false;
    };
}
