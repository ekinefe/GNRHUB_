import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '@/shared/layout/PageShell';
import { ListSkeleton } from '@/shared/ui/Skeleton';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { useApi, formatDate } from './usePosts';

// /blog: research notes and things I learned. Only public posts ever reach this page.
const BlogList = () => {
    const [params] = useSearchParams();
    const tag = (params.get('tag') ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    useDocumentMeta({ title: tag ? `Blog: ${tag}` : 'Blog', description: 'Research notes and things I learned, written down.' });
    const { status, data } = useApi(tag ? `/api/posts?tag=${tag}` : '/api/posts');

    return (
        <PageShell width="5xl">
            <section className="pt-24 pb-24">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-4">/BLOG</h1>
                <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed max-w-2xl mb-10">
                    Research notes and things I learned, written down so I remember them.
                </p>
                {tag && (
                    <p className="font-mono text-sm text-cyber-muted mb-8">
                        Showing posts tagged <span className="text-cyber-cyan">#{tag}</span>. <Link to="/blog" className="text-cyber-pink underline underline-offset-4">Show all</Link>
                    </p>
                )}
                {status === 'loading' && <ListSkeleton />}
                {status === 'error' && <p role="alert" className="font-mono text-cyber-offline">The posts could not be loaded. Try again in a moment.</p>}
                {status === 'ready' && data.posts.length === 0 && (
                    <p className="font-mono text-cyber-muted">{tag ? 'No posts with that tag.' : 'No posts yet. The first ones are on their way.'}</p>
                )}
                {status === 'ready' && data.posts.length > 0 && (
                    <ul className="divide-y divide-cyber-border border-y border-cyber-border">
                        {data.posts.map((p) => (
                            <li key={p.slug} className="py-6">
                                <article>
                                    <p className="font-mono text-xs text-cyber-muted mb-2"><time dateTime={new Date(p.publishedAt * 1000).toISOString()}>{formatDate(p.publishedAt)}</time></p>
                                    <h2 className="text-2xl font-bold text-white mb-2"><Link to={`/blog/${p.slug}`} className="hover:text-cyber-pink transition-colors">{p.title}</Link></h2>
                                    {p.summary && <p className="font-mono text-sm text-cyber-muted leading-relaxed max-w-2xl mb-3">{p.summary}</p>}
                                    {p.tags.length > 0 && (
                                        <p className="flex flex-wrap gap-3 font-mono text-xs">
                                            {p.tags.map((t) => <Link key={t} to={`/blog?tag=${t}`} className="text-cyber-cyan hover:underline">#{t}</Link>)}
                                        </p>
                                    )}
                                </article>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PageShell>
    );
};

export default BlogList;
