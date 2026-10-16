import { useSyncExternalStore } from 'react';

// "Reduce effects": the OS setting (prefers-reduced-motion) OR the visitor's own switch in the footer.
// Everything that animates asks effectsReduced() / useReducedEffects() instead of checking on its own.
const KEY = 'reduce-effects';
const QUERY = '(prefers-reduced-motion: reduce)';
const listeners = new Set();

const osReduced = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;
const read = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };

let userReduced = read();

function apply() {
    if (typeof document !== 'undefined') document.documentElement.dataset.reduceEffects = String(effectsReduced());
    listeners.forEach((l) => l());
}

export const effectsReduced = () => userReduced || osReduced();
export const userReducedEffects = () => userReduced;

export function setReduceEffects(on) {
    userReduced = on;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* private mode: keep it for this visit only */ }
    apply();
}

/** call once at startup so the html attribute (and CSS) match the saved choice */
export function initEffects() {
    apply();
    if (typeof window.matchMedia === 'function') window.matchMedia(QUERY).addEventListener?.('change', apply);
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export const useReducedEffects = () => useSyncExternalStore(subscribe, effectsReduced, () => false);
export const useUserReducedEffects = () => useSyncExternalStore(subscribe, userReducedEffects, () => false);
