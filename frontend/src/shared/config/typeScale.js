// The type scale (GNR-37): Tailwind's own sizes, listed once so /design shows what the site uses.
// `px` is the rendered size at the default 16px root; a test checks it against Tailwind.
export const typeScale = [
    { cls: 'text-xs', px: 12, use: 'Captions, footer, labels' },
    { cls: 'text-sm', px: 14, use: 'Secondary text, buttons' },
    { cls: 'text-base', px: 16, use: 'Body text' },
    { cls: 'text-lg', px: 18, use: 'Lead paragraphs, h4' },
    { cls: 'text-xl', px: 20, use: 'Section titles (h3)' },
    { cls: 'text-2xl', px: 24, use: 'Section headings (h2)' },
    { cls: 'text-4xl', px: 36, use: 'Page titles (h1)' },
    { cls: 'text-5xl', px: 48, use: 'Hero headings' },
];
