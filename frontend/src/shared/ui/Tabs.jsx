import React, { useId, useState } from 'react';

// tabs: [{ key, label, content }]. Arrow keys, Home and End move between tabs.
export default function Tabs({ tabs, defaultKey }) {
    const base = useId();
    const [active, setActive] = useState(defaultKey ?? tabs[0]?.key);
    const index = tabs.findIndex((t) => t.key === active);

    const onKeyDown = (e) => {
        const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        let next = null;
        if (move) next = (index + move + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        setActive(tabs[next].key);
        document.getElementById(`${base}-tab-${tabs[next].key}`)?.focus();
    };

    return (
        <div>
            <div role="tablist" onKeyDown={onKeyDown} className="flex border-b border-cyber-border">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        id={`${base}-tab-${t.key}`}
                        role="tab"
                        type="button"
                        aria-selected={t.key === active}
                        aria-controls={`${base}-panel-${t.key}`}
                        tabIndex={t.key === active ? 0 : -1}
                        onClick={() => setActive(t.key)}
                        className={`px-4 py-2 font-mono text-sm uppercase tracking-wider border-b-2 -mb-px transition-colors focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none ${
                            t.key === active ? 'border-cyber-pink text-cyber-pink' : 'border-transparent text-cyber-muted hover:text-cyber-text'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {tabs.map((t) => (
                <div key={t.key} id={`${base}-panel-${t.key}`} role="tabpanel" aria-labelledby={`${base}-tab-${t.key}`} hidden={t.key !== active} className="pt-4">
                    {t.key === active && t.content}
                </div>
            ))}
        </div>
    );
}
