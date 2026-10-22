import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, it, expect } from 'vitest';

// Layout rules:
//   shared/  is generic code and never imports from modules/ or app/
//   modules/ a module only imports shared/, itself, and the platform modules below
//   app/     wires everything together and may import anything
const SRC = join(process.cwd(), 'src');
const PLATFORM = new Set(); // modules any other module may use (none today)

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (/\.(jsx?)$/.test(name)) out.push(p);
    }
    return out;
}

function importsOf(file) {
    const text = readFileSync(file, 'utf8');
    return [...text.matchAll(/(?:from\s*|import\s*\(\s*|vi\.mock\(\s*)['"]@\/([^'"]+)['"]/g)].map((m) => m[1]);
}

const files = walk(SRC).map((f) => ({ rel: relative(SRC, f).split(sep).join('/'), file: f }));

describe('module layout', () => {
    it('shared/ does not depend on modules/ or app/', () => {
        const bad = files
            .filter((f) => f.rel.startsWith('shared/') && !f.rel.endsWith('.test.jsx'))
            .flatMap((f) => importsOf(f.file).filter((i) => /^(modules|app)\//.test(i)).map((i) => `${f.rel} -> ${i}`));
        expect(bad).toEqual([]);
    });

    it('modules only import shared code, themselves or platform modules', () => {
        const bad = files
            .filter((f) => f.rel.startsWith('modules/') && f.rel.split('/').length > 2)
            .flatMap((f) => {
                const own = f.rel.split('/')[1];
                return importsOf(f.file)
                    .filter((i) => i.startsWith('modules/'))
                    .filter((i) => {
                        const other = i.split('/')[1];
                        return other !== own && !PLATFORM.has(other) && other !== 'registry' && other !== 'registry.js';
                    })
                    .map((i) => `${f.rel} -> ${i}`);
            });
        expect(bad).toEqual([]);
    });
});
