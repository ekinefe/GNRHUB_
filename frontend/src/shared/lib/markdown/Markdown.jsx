import React from 'react';
import { parseMarkdown } from './parse';

// Renders a post to React elements. No HTML string is ever inserted into the page: text is always text.
const Inline = ({ nodes }) => nodes.map((n, i) => {
    switch (n.type) {
        case 'text': return <React.Fragment key={i}>{n.value}</React.Fragment>;
        case 'code': return <code key={i} className="px-1 py-0.5 bg-cyber-panel border border-cyber-border text-cyber-cyan text-[0.9em]">{n.value}</code>;
        case 'bold': return <strong key={i} className="text-white font-bold"><Inline nodes={n.children} /></strong>;
        case 'italic': return <em key={i}><Inline nodes={n.children} /></em>;
        case 'link': {
            const external = /^(https?:|mailto:)/i.test(n.href);
            return (
                <a key={i} href={n.href} {...(external && !n.href.startsWith('mailto:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-cyber-pink underline underline-offset-4 hover:text-white">
                    <Inline nodes={n.children} />
                </a>
            );
        }
        default: return null;
    }
});

const HEADING = {
    1: 'text-3xl md:text-4xl mt-10 mb-4',
    2: 'text-2xl mt-10 mb-3',
    3: 'text-xl mt-8 mb-2',
    4: 'text-lg mt-6 mb-2',
};

const Block = ({ block }) => {
    switch (block.type) {
        case 'heading': {
            const Tag = `h${Math.min(block.level + 1, 6)}`; // the page title is the h1
            return (
                <Tag id={block.id} className={`${HEADING[block.level]} font-bold text-white scroll-mt-24 group`}>
                    <Inline nodes={block.children} />
                    {block.id && <a href={`#${block.id}`} aria-label="Link to this section" className="ml-2 text-cyber-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-cyber-pink">#</a>}
                </Tag>
            );
        }
        case 'paragraph': return <p className="my-4"><Inline nodes={block.children} /></p>;
        case 'code': return <pre className="my-4 p-4 overflow-x-auto bg-cyber-panel border border-cyber-border text-sm text-cyber-text"><code>{block.value}</code></pre>;
        case 'quote': return <blockquote className="my-4 pl-4 border-l-2 border-cyber-pink text-cyber-muted"><Blocks blocks={block.children} /></blockquote>;
        case 'rule': return <hr className="my-8 border-cyber-border" />;
        case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul';
            return (
                <Tag className={`my-4 pl-6 space-y-1 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-cyber-pink`}>
                    {block.items.map((item, i) => <li key={i}><Inline nodes={item} /></li>)}
                </Tag>
            );
        }
        default: return null;
    }
};

const Blocks = ({ blocks }) => blocks.map((b, i) => <Block key={i} block={b} />);

const Markdown = ({ source, className = '' }) => (
    <div className={`font-mono text-sm md:text-base leading-relaxed text-cyber-text max-w-3xl ${className}`}>
        <Blocks blocks={parseMarkdown(source)} />
    </div>
);

export default Markdown;
