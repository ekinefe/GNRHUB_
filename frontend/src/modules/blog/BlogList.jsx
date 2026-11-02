import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Tag, X, Rss } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import Decrypt from '@/shared/animations/Decrypt';
import AnimatedList from '@/shared/animations/AnimatedList';
import AsciiSpinner from '@/shared/animations/AsciiSpinner';
import Highlight from '@/shared/ui/Highlight';
import Input from '@/shared/ui/Input';
import EmptyState from '@/shared/ui/EmptyState';
import { ListSkeleton } from '@/shared/ui/Skeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { matchesQuery, closestTags } from '@/shared/lib/searchText';
import { useApi, formatDate } from './usePosts';

const cleanTag = (t) => (t ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '');

// /blog: research notes and things I learned. The sidebar has the search (forgiving: "crn" finds "cron"), the tags with
// counts and the sort order. The tag lives in the address (?tag=) so a filtered list can be shared and the back button works.
// Only public posts ever reach this page.
const BlogList = () => {
    const [params, setParams] = useSearchParams();
    const tag = cleanTag(params.get('tag'));
    const [query, setQuery] = useState('');
    const [newestFirst, setNewestFirst] = useState(true);
    const [debounced] = useDebounce(query, 250);
    const searchRef = useRef(null);
    const { status, data } = useApi('/api/posts');
    useDocumentMeta({ title: tag ? `Blog: ${tag}` : 'Blog', description: 'Research notes and things I learned, written down.' });

    // "/" jumps to the search from anywhere on the page
    useEffect(() => {
        const onKey = (e) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
            if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); searchRef.current?.focus(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const posts = useMemo(() => (status === 'ready' ? data.posts : []), [status, data]);
    const tagCounts = useMemo(() => {
        const counts = new Map();
        for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [posts]);

    const shown = useMemo(() => {
        const list = posts.filter((p) => (!tag || p.tags.includes(tag)) && matchesQuery(debounced, [p.title, p.summary, ...p.tags]));
        return newestFirst ? list : [...list].reverse();
    }, [posts, tag, debounced, newestFirst]);

    const suggestions = useMemo(() => {
        const names = tagCounts.map(([t]) => t);
        const close = closestTags(debounced, names);
        return close.length ? close : names.slice(0, 5);
    }, [debounced, tagCounts]);

    const plural = (n) => `${n} post${n !== 1 ? 's' : ''}`;
    const resultLine = debounced || tag ? `Found ${shown.length} result${shown.length !== 1 ? 's' : ''}` : `${plural(posts.length)}. Type to search`;

    const pickTag = (t) => { const next = new URLSearchParams(params); if (t) next.set('tag', t); else next.delete('tag'); setParams(next); };
    const clearAll = () => { setQuery(''); pickTag(''); };
    const highlight = (text) => <Highlight text={text} query={debounced} />;

    return (
        <PageShell width="7xl">
            <section className="pt-24 pb-10 border-b border-cyber-border/40">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-4">/BLOG</h1>
                <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed max-w-2xl">Research notes and things I learned, written down so I remember them.</p>
            </section>

            <div className="grid gap-10 lg:grid-cols-[17rem_1fr] pt-10 pb-24">
                <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Search and filters">
                    <div className="space-y-3">
                        <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2"><Search className="w-5 h-5 text-cyber-pink" /> Search</h2>
                        <Input
                            ref={searchRef}
                            type="text"
                            placeholder="Search posts  ( / )"
                            aria-label="Search posts"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                            className="focus:border-cyber-pink focus-visible:ring-cyber-pink"
                        />
                        <div className="h-6 font-mono text-xs" aria-live="polite">
                            {/* Always there: ready for a search before you type, the count while you do. Keyed by the text,
                                so it replays when the results change, not on every keystroke. */}
                            {status === 'ready' ? <Decrypt text={resultLine} replayKey={resultLine} /> : <span className="text-cyber-muted"><AsciiSpinner className="text-cyber-pink mr-2" />Loading posts...</span>}
                        </div>
                    </div>

                    {tagCounts.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2"><Tag className="w-5 h-5 text-cyber-pink" /> Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => pickTag('')} aria-pressed={!tag} className={`font-mono text-xs px-2 py-1 border transition-colors ${!tag ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10' : 'border-cyber-border text-cyber-muted hover:border-cyber-text'}`}>
                                    all {posts.length}
                                </button>
                                {tagCounts.map(([t, n]) => (
                                    <button key={t} type="button" onClick={() => pickTag(t)} aria-pressed={tag === t} className={`font-mono text-xs px-2 py-1 border transition-colors ${tag === t ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10' : 'border-cyber-border text-cyber-muted hover:border-cyber-text'}`}>
                                        #{t} {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <a href="/blog/feed.xml" className="inline-flex items-center gap-2 font-mono text-xs text-cyber-muted hover:text-cyber-pink transition-colors"><Rss className="w-4 h-4" /> Subscribe with RSS</a>

                    <div className="space-y-3">
                        <h2 className="text-lg font-mono font-bold text-white">Order</h2>
                        <div className="flex gap-2 font-mono text-xs">
                            {[[true, 'Newest first'], [false, 'Oldest first']].map(([value, label]) => (
                                <button key={label} type="button" aria-pressed={newestFirst === value} onClick={() => setNewestFirst(value)} className={`px-2 py-1 border transition-colors ${newestFirst === value ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5' : 'border-cyber-border text-cyber-muted hover:border-cyber-text'}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    {(tag || debounced) && status === 'ready' && (
                        <p className="flex flex-wrap items-center gap-3 font-mono text-xs text-cyber-muted mb-6">
                            Filtered by
                            {tag && <span className="inline-flex items-center gap-1 border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan px-2 py-1">#{tag}</span>}
                            {debounced && <span className="inline-flex items-center gap-1 border border-cyber-pink/30 bg-cyber-pink/10 text-cyber-pink px-2 py-1">&ldquo;{debounced}&rdquo;</span>}
                            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-cyber-pink hover:underline"><X className="w-3 h-3" /> Clear filters</button>
                        </p>
                    )}
                    {status === 'loading' && <ListSkeleton />}
                    {status === 'error' && <EmptyState variant="error" title="The posts could not be loaded." hint="Try again in a moment." />}
                    {status === 'ready' && posts.length === 0 && <EmptyState title="No posts yet." hint="The first ones are on their way." />}
                    {status === 'ready' && posts.length > 0 && shown.length === 0 && (
                        <EmptyState title="No posts match your search.">
                            {suggestions.length > 0 && (
                                <div className="mb-6">
                                    <p className="font-mono text-xs text-cyber-muted mb-3">Try one of these tags:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {suggestions.map((t) => <button key={t} type="button" onClick={() => { setQuery(''); pickTag(t); }} className="font-mono text-xs px-2 py-1 border border-cyber-border text-cyber-cyan hover:border-cyber-cyan transition-colors">#{t}</button>)}
                                    </div>
                                </div>
                            )}
                            <button type="button" onClick={clearAll} className="font-mono text-sm text-cyber-pink hover:underline">[ CLEAR_FILTERS ]</button>
                        </EmptyState>
                    )}
                    {shown.length > 0 && (
                        <AnimatedList
                            className="space-y-6"
                            items={shown}
                            getKey={(p) => p.slug}
                            renderItem={(p) => (
                                <article className="border border-cyber-border bg-cyber-black p-6 transition-colors hover:border-cyber-pink/50 group">
                                    <p className="font-mono text-xs text-cyber-muted mb-2"><time dateTime={new Date(p.publishedAt * 1000).toISOString()}>{formatDate(p.publishedAt)}</time></p>
                                    <h2 className="text-2xl font-bold text-white mb-2"><Link to={`/blog/${p.slug}`} className="group-hover:text-cyber-pink transition-colors">{highlight(p.title)}</Link></h2>
                                    {p.summary && <p className="font-mono text-sm text-cyber-muted leading-relaxed max-w-2xl mb-4">{highlight(p.summary)}</p>}
                                    {p.tags.length > 0 && (
                                        <p className="flex flex-wrap gap-3 font-mono text-xs">
                                            {p.tags.map((t) => <button key={t} type="button" onClick={() => pickTag(t)} className="text-cyber-cyan hover:underline">#{t}</button>)}
                                        </p>
                                    )}
                                </article>
                            )}
                        />
                    )}
                </div>
            </div>
        </PageShell>
    );
};

export default BlogList;
