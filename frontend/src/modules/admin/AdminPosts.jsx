import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Badge from '@/shared/ui/Badge';
import { adminFetch } from './api';
import { matchesQuery } from '@/shared/lib/searchText';
import PostEditor from './PostEditor';

const TONE = { draft: undefined, private: 'cyan', public: 'success' };
const day = (s) => new Date(s * 1000).toLocaleDateString('en-GB', { dateStyle: 'medium' });

const PostList = () => {
    const [state, setState] = useState({ status: 'loading', posts: [] });
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    useEffect(() => {
        let alive = true;
        adminFetch('/api/admin/posts').then((res) => {
            if (!alive) return;
            setState(res.ok && Array.isArray(res.data?.posts) ? { status: 'ready', posts: res.data.posts } : { status: 'error', posts: [] });
        });
        return () => { alive = false; };
    }, []);

    const visible = state.posts.filter((p) => (statusFilter === 'all' || p.status === statusFilter) && matchesQuery(query, [p.title, p.summary, ...p.tags]));

    if (state.status === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading posts...</p>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the posts. The database may not be set up yet (docs/database.md).</p>;
    return (
        <section aria-labelledby="posts-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="posts-title" className="font-mono text-xl text-white">Posts</h2>
                <Link to="/admin/posts/new"><CyberButton icon={Plus}>New post</CyberButton></Link>
            </div>
            {state.posts.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
                    <input type="search" aria-label="Search posts" placeholder="Search title, summary or tag" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 min-w-[12rem] bg-cyber-panel border border-cyber-border px-3 py-2 font-mono text-sm text-white placeholder:text-cyber-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan" />
                    <div className="flex gap-2 font-mono text-xs">
                        {['all', 'public', 'private', 'draft'].map((s) => (
                            <button key={s} type="button" aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)} className={`px-2 py-1 border transition-colors ${statusFilter === s ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5' : 'border-cyber-border text-cyber-muted hover:border-cyber-text'}`}>{s}</button>
                        ))}
                    </div>
                </div>
            )}
            {state.posts.length === 0 && <p className="font-mono text-cyber-muted">No posts yet. Write the first one: a note, something you learned, or a page of your notebook.</p>}
            {state.posts.length > 0 && visible.length === 0 && <p className="font-mono text-cyber-muted">No post matches.</p>}
            <ul className="divide-y divide-cyber-border border border-cyber-border">
                {visible.map((p) => (
                    <li key={p.id}>
                        <Link to={`/admin/posts/${p.id}`} className="px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 hover:bg-cyber-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                            <span className="font-mono text-sm text-white flex-1 min-w-0 truncate">{p.title}</span>
                            <Badge tone={TONE[p.status]}>{p.status}</Badge>
                            <span className="font-mono text-xs text-cyber-muted">edited {day(p.updatedAt)}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};

const AdminPosts = () => (
    <Routes>
        <Route index element={<PostList />} />
        <Route path="new" element={<PostEditor />} />
        <Route path=":id" element={<PostEditor />} />
    </Routes>
);

export default AdminPosts;
