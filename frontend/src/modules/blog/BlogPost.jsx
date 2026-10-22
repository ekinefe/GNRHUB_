import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import { ListSkeleton } from '@/shared/ui/Skeleton';
import NotFound from '@/shared/errors/NotFound';
import Markdown from '@/shared/lib/markdown/Markdown';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { useApi, formatDate } from './usePosts';

// /blog/:slug. The text is rendered by the safe Markdown renderer (no HTML from a post is ever run).
const BlogPost = () => {
    const { slug } = useParams();
    const { status, data } = useApi(`/api/posts/${encodeURIComponent(slug)}`);
    const post = data?.post;
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
                            <time dateTime={new Date(post.publishedAt * 1000).toISOString()}>{formatDate(post.publishedAt)}</time>
                            {post.tags.map((t) => <React.Fragment key={t}> · <Link to={`/blog?tag=${t}`} className="text-cyber-cyan hover:underline">#{t}</Link></React.Fragment>)}
                        </p>
                        <Markdown source={post.body} />
                    </>
                )}
            </article>
        </PageShell>
    );
};

export default BlogPost;
