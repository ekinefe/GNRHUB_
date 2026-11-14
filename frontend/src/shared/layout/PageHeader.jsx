import React from 'react';
import TextType from '@/shared/animations/TextType';

// The top of every page except Home: "/TITLE_" typed in once, an optional line under it, then one thin rule.
// Every page uses this so titles, spacing and the typing effect are the same everywhere (docs/brand.md, Layout).
//
//   title        the page name without the slash, e.g. "Contact" (shown uppercase)
//   description  optional one-line intro under the title
//   children     optional extra content under the description
//
// Screen readers get the whole title at once; the typing copy is aria-hidden. An invisible copy reserves the final
// width so nothing below moves while it types. With reduced effects TextType shows the text at once.
export default function PageHeader({ title, description, children }) {
    const text = `/${title.toUpperCase()}`;
    return (
        <header className="pt-16 md:pt-24 pb-10 mb-12 border-b border-cyber-border/40">
            <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight [overflow-wrap:anywhere]">
                <span className="sr-only">{text}</span>
                <span aria-hidden="true" className="grid">
                    <span className="invisible col-start-1 row-start-1 tracking-tight">{text}<span className="ml-1">_</span></span>
                    <span className="col-start-1 row-start-1">
                        <TextType
                            as="span"
                            text={text}
                            initialDelay={100}
                            typingSpeed={75}
                            loop={false}
                            showCursor
                            cursorCharacter="_"
                            cursorBlinkDuration={0.5}
                        />
                    </span>
                </span>
            </h1>
            {description && (
                <p className="mt-4 font-mono text-cyber-muted text-sm md:text-base leading-relaxed max-w-2xl">{description}</p>
            )}
            {children}
        </header>
    );
}
