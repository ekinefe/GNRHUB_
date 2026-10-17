import { useSyncExternalStore } from 'react';

// Theme controls (GNR-41): an accent colour and an optional CRT scanline overlay.
// Both live as attributes on <html> (data-accent, data-scanlines) that index.css reads.
// public/theme-init.js applies the saved choice before React mounts, so there is no flash.
export const ACCENTS = ['pink', 'cyan', 'amber', 'green'];
export const DEFAULT_ACCENT = 'pink';
export const ACCENT_KEY = 'gnrdigital:accent';
export const SCANLINES_KEY = 'gnrdigital:scanlines';

const listeners = new Set();
const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode: lasts for this visit only */ } };

let accent = ACCENTS.includes(read(ACCENT_KEY)) ? read(ACCENT_KEY) : DEFAULT_ACCENT;
let scanlines = read(SCANLINES_KEY) === '1';

function apply() {
    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (accent === DEFAULT_ACCENT) delete root.dataset.accent; else root.dataset.accent = accent;
        if (scanlines) root.dataset.scanlines = 'on'; else delete root.dataset.scanlines;
    }
    listeners.forEach((l) => l());
}

export const getAccent = () => accent;
export const getScanlines = () => scanlines;

export function setAccent(next) {
    if (!ACCENTS.includes(next)) return;
    accent = next;
    write(ACCENT_KEY, next);
    apply();
}

export function setScanlines(on) {
    scanlines = Boolean(on);
    write(SCANLINES_KEY, scanlines ? '1' : '0');
    apply();
}

/** call once at startup so the html attributes match the saved choice */
export const initTheme = apply;

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export const useAccent = () => useSyncExternalStore(subscribe, getAccent, () => DEFAULT_ACCENT);
export const useScanlines = () => useSyncExternalStore(subscribe, getScanlines, () => false);
