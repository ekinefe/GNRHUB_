// Frames for the loading patterns (GNR-158, docs/ascii.md). Plain functions so they are easy to test and reuse.
export const SPINNER_FRAMES = ['|', '/', '-', '\\'];
export const spinnerFrame = (tick) => SPINNER_FRAMES[((tick % SPINNER_FRAMES.length) + SPINNER_FRAMES.length) % SPINNER_FRAMES.length];

// An indeterminate bar: a short block of "=" sliding back and forth inside "[ ]". Honest because the length of a wait is
// unknown, so it does not pretend to fill up. Always `width` characters between the brackets.
export function barFrame(tick, width = 24, block = 6) {
    const room = width - block;
    const cycle = room * 2;
    const t = ((tick % cycle) + cycle) % cycle;
    const at = t <= room ? t : cycle - t;
    return `[${' '.repeat(at)}${'='.repeat(block)}${' '.repeat(room - at)}]`;
}

// What shows under "Reduce effects": the same width, nothing moving.
export const staticBar = (width = 24) => `[${'.'.repeat(width)}]`;
