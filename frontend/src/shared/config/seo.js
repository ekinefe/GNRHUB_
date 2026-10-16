// Static SEO files for the launch: sitemap.xml and robots.txt are generated at build time (vite.config.js)
// from this list and brand.publicUrl. When the Worker arrives (GNR-16) it can generate them from D1 instead.
// Only routes that are live at launch belong here: flagged-off areas (tools, blogs, account) are left out.
import { brand } from './brand.js';

export const sitemapPaths = ['/', '/about', '/projects', '/contact', '/colophon', '/privacy', '/terms'];

export function sitemapXml(base = brand.publicUrl, paths = sitemapPaths) {
    const urls = paths.map((p) => `  <url><loc>${base}${p === '/' ? '/' : p}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(base = brand.publicUrl) {
    return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}
