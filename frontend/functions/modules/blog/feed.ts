// GET /blog/feed.xml: an RSS 2.0 feed of the latest public posts (ADR 0009). Drafts and private posts never appear.
// Built on request; if the database cannot be read it answers 503 rather than an empty feed that readers would cache.
import { brand } from '../../../src/shared/config/brand.js';

type D1 = { prepare: (sql: string) => { bind: (...v: unknown[]) => { all: <T>() => Promise<{ results: T[] }> } } };
type Context = { request: Request; env: { DB?: unknown } };
type Row = { slug: string; title: string; summary: string; tags: string; publishedAt: number };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LIMIT = 20;

async function feed({ request, env }: Context): Promise<Response> {
  if (!env.DB) return new Response('The feed is not available right now.', { status: 503 });
  const origin = new URL(request.url).origin;
  let results: Row[];
  try {
    ({ results } = await (env.DB as D1)
      .prepare("SELECT slug, title, summary, tags, published_at AS publishedAt FROM posts WHERE status = 'public' ORDER BY published_at DESC, id DESC LIMIT ?")
      .bind(LIMIT)
      .all<Row>());
  } catch (error) {
    console.error('feed: could not read posts', error);
    return new Response('The feed is not available right now.', { status: 503 });
  }

  const items = results
    .map((p) => {
      const link = `${origin}/blog/${p.slug}`;
      const categories = (p.tags ? p.tags.split(',') : []).map((t) => `<category>${esc(t)}</category>`).join('');
      return `    <item><title>${esc(p.title)}</title><link>${esc(link)}</link><guid isPermaLink="true">${esc(link)}</guid><pubDate>${new Date(p.publishedAt * 1000).toUTCString()}</pubDate>${p.summary ? `<description>${esc(p.summary)}</description>` : ''}${categories}</item>`;
    })
    .join('\n');
  const updated = results[0] ? new Date(results[0].publishedAt * 1000).toUTCString() : new Date(0).toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(brand.name)} blog</title>
    <link>${esc(origin)}/blog</link>
    <description>Research notes and things I learned, written down so I remember them.</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${esc(origin)}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } });
}

export const feedRoute = { onRequestGet: feed };
