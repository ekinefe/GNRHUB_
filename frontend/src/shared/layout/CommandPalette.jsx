import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/shared/ui/Modal';
import { fuzzyFilter } from '@/shared/lib/fuzzy';
import { buildCommands, konamiTracker } from '@/shared/commands/commands';
import { setScanlines, getScanlines } from '@/shared/config/theme';

// Ctrl/Cmd+K from any route (GNR-49).
const CommandPalette = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [output, setOutput] = useState([]);
    const input = useRef(null);
    const { visible, hidden } = useMemo(() => buildCommands({ navigate }), [navigate]);

    const results = useMemo(() => fuzzyFilter(visible, query), [visible, query]);
    const close = () => { setOpen(false); setQuery(''); setOutput([]); setActive(0); };

    useEffect(() => {
        const konami = konamiTracker();
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
                return;
            }
            const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName);
            if (!typing && konami(e.key)) setScanlines(!getScanlines());
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Modal focuses its first control (the close button); a palette wants the search box. Runs after Modal's own effect.
    useEffect(() => { if (open) input.current?.focus(); }, [open]);

    const run = (command) => {
        const typed = query.trim().toLowerCase();
        if (!command && hidden[typed]) { setOutput(hidden[typed]()); setQuery(''); return; }
        if (!command) return;
        const lines = command.run();
        if (Array.isArray(lines)) setOutput(lines); else close();
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0))); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); run(results[active]); }
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="sr-only focus:not-sr-only focus:fixed focus:bottom-2 focus:left-2 focus:z-toast focus:bg-cyber-panel focus:border focus:border-cyber-border focus:px-3 focus:py-1 font-mono text-xs text-cyber-text">
                Open command palette
            </button>
            <Modal open={open} onClose={close} title="Command palette">
                <input
                    ref={input}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-list"
                    aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
                    aria-label="Type a command"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActive(0); setOutput([]); }}
                    onKeyDown={onKeyDown}
                    placeholder="Type a command or page"
                    className="w-full bg-cyber-panel border border-cyber-border px-3 py-2 text-white placeholder:text-cyber-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                />
                {output.length > 0 && (
                    <div role="status" className="mt-3 space-y-1 text-cyber-active">
                        {output.map((line) => <p key={line}>&gt; {line}</p>)}
                    </div>
                )}
                <ul id="palette-list" role="listbox" aria-label="Commands" className="mt-3 max-h-64 overflow-y-auto">
                    {results.map((c, i) => (
                        <li
                            key={c.id}
                            id={`palette-${c.id}`}
                            role="option"
                            aria-selected={i === active}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => run(c)}
                            className={`flex justify-between gap-4 px-3 py-2 cursor-pointer ${i === active ? 'bg-cyber-pink/15 text-cyber-pink' : 'text-cyber-text'}`}
                        >
                            <span>{c.title}</span>
                            <span className="text-cyber-muted text-xs self-center">{c.hint}</span>
                        </li>
                    ))}
                    {results.length === 0 && !hidden[query.trim().toLowerCase()] && <li className="px-3 py-2 text-cyber-muted">No match. Try "help".</li>}
                </ul>
            </Modal>
        </>
    );
};

export default CommandPalette;
