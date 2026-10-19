// Pure colour helpers (GNR-90): WCAG 2.x contrast, format conversion, accessible suggestions,
// tint/shade palette and colour-vision-deficiency simulation. No UI and no dependencies.

export function parseHex(input) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(input).trim());
    if (!m) return null;
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

export const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

const toLinear = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const fromLinear = (c) => 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

export const relativeLuminance = ([r, g, b]) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export function contrastRatio(a, b) {
    const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

/** WCAG thresholds: AA 4.5 (3 for large text), AAA 7 (4.5 for large text). */
export const passes = (ratio, level = 'AA', large = false) =>
    ratio >= (level === 'AAA' ? (large ? 4.5 : 7) : (large ? 3 : 4.5));

export const formatRatio = (ratio) => `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;

export function rgbToHsl([r, g, b]) {
    const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
    return [h * 60, s, l];
}

export function hslToRgb([h, s, l]) {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

export function rgbToCmyk([r, g, b]) {
    const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return [0, 0, 0, 100];
    return [(1 - rn - k) / (1 - k), (1 - gn - k) / (1 - k), (1 - bn - k) / (1 - k), k].map((v) => Math.round(v * 100));
}

/** Same hue and saturation as `fg`, lightness moved away from `bg` until the ratio reaches `target`. Null if impossible. */
export function suggestAccessible(fg, bg, target = 4.5) {
    if (contrastRatio(fg, bg) >= target) return toHex(fg);
    const [h, s, l] = rgbToHsl(fg);
    const darken = relativeLuminance(bg) > 0.179; // the luminance where black and white contrast equally
    for (let step = 1; step <= 100; step += 1) {
        const next = Math.min(1, Math.max(0, l + (darken ? -step : step) / 100));
        const rgb = hslToRgb([h, s, next]);
        if (contrastRatio(rgb, bg) >= target) return toHex(rgb);
    }
    return null;
}

/** Five steps from light to dark around the colour, keeping its hue and saturation. */
export function paletteFrom(rgb) {
    const [h, s] = rgbToHsl(rgb);
    return [0.9, 0.75, 0.5, 0.3, 0.15].map((l) => toHex(hslToRgb([h, s, l])));
}

// Machado, Oliveira and Fernandes (2009), severity 1.0, applied to linear RGB.
const CVD = {
    protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};

export const CVD_TYPES = Object.keys(CVD);

export function simulateCvd(rgb, type) {
    const m = CVD[type];
    if (!m) throw new Error(`Unknown colour-vision type: ${type}`);
    const lin = rgb.map(toLinear);
    return m.map((row) => fromLinear(Math.min(1, Math.max(0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]))));
}
