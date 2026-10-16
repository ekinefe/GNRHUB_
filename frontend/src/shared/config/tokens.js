// Canvas drawing (FuzzyText) cannot use Tailwind classes or CSS variables, so it reads the token
// from :root at draw time. The fallbacks only apply where there is no stylesheet (tests).
// This is the one JS file allowed to hold raw color values.
const FALLBACK = { text: '238 238 238', alert: '255 0 60', pink: '255 49 140', cyan: '0 243 255', border: '51 51 51' };

export function tokenColor(name) {
    let triplet = '';
    if (typeof document !== 'undefined') {
        triplet = getComputedStyle(document.documentElement).getPropertyValue(`--cyber-${name}`).trim();
    }
    return `rgb(${triplet || FALLBACK[name]})`;
}
