import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import { ListSkeleton } from '@/shared/ui/Skeleton';
import NotFound from '@/shared/errors/NotFound';
import Markdown from '@/shared/lib/markdown/Markdown';
import { headingsOf, readingMinutes } from '@/shared/lib/markdown/parse';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { useApi, formatDate } from './usePosts';

// /blog/:slug. The text is rendered by the safe Markdown renderer (no HTML from a post is ever run).
const BlogPost = () => {
    const { slug } = useParams();
    const { status, data } = useApi(`/api/posts/${encodeURIComponent(slug)}`);
    const post = data?.post;
    const { hash } = useLocation();
    const contents = post ? headingsOf(post.body) : [];

    // The page loads after the address, so a link like /blog/x#notes has to scroll once the post has arrived.
    useEffect(() => {
        if (post && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    }, [post, hash]);
    useDocumentMeta(post ? { title: post.title, description: post.summary || undefined } : { title: 'Blog', noindex: status !== 'loading' });

    if (status === 'missing') return <NotFound />;

    return (
        <PageShell width="5xl">
            <article className="pt-24 pb-24">
                <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-sm text-cyber-muted hover:text-cyber-pink mb-10"><ArrowLeft className="w-4 h-4" /> All posts</Link>
                {status === 'loading' && <ListSkeleton count={1} />}
                {status === 'error' && <p role="alert" className="font-mono text-cyber-offline">The post could not be loaded. Try again in a moment.</p>}
                {post && (
                    <>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">{post.title}</h1>
                        <p className="font-mono text-xs text-cyber-muted mb-10">
                            <time dateTime={new Date(post.publishedAt * 1000).toISOString()}>{formatDate(post.publishedAt)}</time> · {readingMinutes(post.body)} min read
                            {post.tags.map((t) => <React.Fragment key={t}> · <Link to={`/blog?tag=${t}`} className="text-cyber-cyan underline underline-offset-4 decoration-cyber-cyan/40 hover:decoration-cyber-cyan">#{t}</Link></React.Fragment>)}
                        </p>
                        {contents.length >= 3 && (
                            <nav aria-label="Contents" className="mb-10 border border-cyber-border p-4 max-w-3xl">
                                <p className="font-mono text-xs text-cyber-muted mb-2">On this page</p>
                                <ol className="space-y-1 font-mono text-sm">
                                    {contents.map((h) => (
                                        <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 1}rem` }}>
                                            <a href={`#${h.id}`} className="text-cyber-text hover:text-cyber-pink underline underline-offset-4 decoration-cyber-border">{h.text}</a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        )}
                        <Markdown source={post.body} />
                        {(post.older || post.newer) && (
                            <nav aria-label="More posts" className="mt-16 pt-6 border-t border-cyber-border grid gap-6 sm:grid-cols-2 font-mono text-sm">
                                {post.older ? (
                                    <Link to={`/blog/${post.older.slug}`} className="group">
                                        <span className="flex items-center gap-2 text-xs text-cyber-muted mb-1"><ArrowLeft className="w-3 h-3" /> Older</span>
                                        <span className="text-white group-hover:text-cyber-pink transition-colors">{post.older.title}</span>
                                    </Link>
                                ) : <span />}
                                {post.newer && (
                                    <Link to={`/blog/${post.newer.slug}`} className="group sm:text-right">
                                        <span className="flex items-center gap-2 text-xs text-cyber-muted mb-1 sm:justify-end">Newer <ArrowRight className="w-3 h-3" /></span>
                                        <span className="text-white group-hover:text-cyber-pink transition-colors">{post.newer.title}</span>
                                    </Link>
                                )}
                            </nav>
                        )}
                    </>
                )}
            </article>
        </PageShell>
    );
};

export default BlogPost;
