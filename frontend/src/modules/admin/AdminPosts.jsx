import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Badge from '@/shared/ui/Badge';
import { adminFetch } from './api';
import PostEditor from './PostEditor';

const TONE = { draft: undefined, private: 'cyan', public: 'success' };
const day = (s) => new Date(s * 1000).toLocaleDateString('en-GB', { dateStyle: 'medium' });

const PostList = () => {
    const [state, setState] = useState({ status: 'loading', posts: [] });
    useEffect(() => {
        let alive = true;
        adminFetch('/api/admin/posts').then((res) => {
            if (!alive) return;
            setState(res.ok && Array.isArray(res.data?.posts) ? { status: 'ready', posts: res.data.posts } : { status: 'error', posts: [] });
        });
        return () => { alive = false; };
    }, []);

    if (state.status === 'loading') return <p role="status" className="font-mono text-cyber-muted">Loading posts...</p>;
    if (state.status === 'error') return <p role="alert" className="font-mono text-cyber-offline">Could not load the posts. The database may not be set up yet (docs/database.md).</p>;
    return (
        <section aria-labelledby="posts-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="posts-title" className="font-mono text-xl text-white">Posts</h2>
                <Link to="/admin/posts/new"><CyberButton icon={Plus}>New post</CyberButton></Link>
            </div>
            {state.posts.length === 0 && <p className="font-mono text-cyber-muted">No posts yet. Write the first one: a note, something you learned, or a page of your notebook.</p>}
            <ul className="divide-y divide-cyber-border border border-cyber-border">
                {state.posts.map((p) => (
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
