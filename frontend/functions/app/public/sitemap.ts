// GET /sitemap.xml, built on request (ADR 0009): the fixed pages plus every public post. Drafts and private posts
// are never in it. If the database cannot be read, the fixed pages are still served.
import { sitemapPosts } from '../../domain/posts/actions.ts';
import { dbOf } from '../../infra/d1.ts';
import { sitemapPaths } from '../../../src/shared/config/seo.js';

type Context = { request: Request; env: { DB?: unknown } };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function sitemap({ request, env }: Context): Promise<Response> {
  const base = new URL(request.url).origin;
  const urls: Array<{ path: string; lastmod?: string }> = sitemapPaths.map((path: string) => ({ path }));
  try {
    const db = dbOf(env);
    if (db) {
      for (const p of await sitemapPosts(db)) urls.push({ path: `/blog/${p.slug}`, lastmod: new Date(p.updatedAt * 1000).toISOString().slice(0, 10) });
    }
  } catch (error) {
    console.error('sitemap: could not read posts, serving the fixed pages only', error);
  }
  const body = urls
    .map((u) => `  <url><loc>${esc(base + (u.path === '/' ? '/' : u.path))}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}

export const sitemapRoute = { onRequestGet: sitemap };
