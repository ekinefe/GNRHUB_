import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, NotebookPen, Plus } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import { useAdmin } from './AdminContext';

const when = (seconds) => new Date(seconds * 1000).toLocaleDateString('en-GB', { dateStyle: 'medium' });
const STATUS_TONE = { public: 'text-cyber-active', private: 'text-cyber-cyan', draft: 'text-cyber-muted' };

const Card = ({ to, icon: Icon, title, children }) => (
    <Link to={to} className="block border border-cyber-border p-5 hover:border-cyber-pink/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
        <p className="flex items-center gap-2 font-mono text-sm text-cyber-cyan mb-3"><Icon aria-hidden="true" className="w-4 h-4" /> {title}</p>
        {children}
    </Link>
);

const Latest = ({ title, to, empty, children, count }) => (
    <section aria-label={title} className="border border-cyber-border">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-border">
            <h2 className="font-mono text-sm text-white">{title}</h2>
            <Link to={to} className="font-mono text-xs text-cyber-pink hover:underline">See all</Link>
        </div>
        {count === 0 ? <p className="px-5 py-6 font-mono text-sm text-cyber-muted">{empty}</p> : <ul className="divide-y divide-cyber-border/60">{children}</ul>}
    </section>
);

// The admin home: what needs attention (two counts), a way to start a post, and the latest of each so the page is never blank.
const AdminHome = () => {
    const { summary } = useAdmin();
    if (!summary) return <p role="status" className="font-mono text-cyber-muted">Loading...</p>;
    const { messages, posts, recent } = summary;
    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card to="/admin/messages" icon={Mail} title="Messages">
                    <p className="font-mono text-3xl text-white">{messages.unread}</p>
                    <p className="font-mono text-xs text-cyber-muted mt-1">{messages.unread === 1 ? 'unread message' : 'unread messages'}, {messages.total} in total</p>
                </Card>
                <Card to="/admin/posts" icon={NotebookPen} title="Posts">
                    <p className="font-mono text-3xl text-white">{posts.public + posts.private + posts.draft}</p>
                    <p className="font-mono text-xs text-cyber-muted mt-1">{posts.public} public, {posts.private} private, {posts.draft} draft</p>
                </Card>
                <div className="border border-cyber-border p-5 flex flex-col justify-between gap-4">
                    <p className="font-mono text-sm text-cyber-cyan">Write</p>
                    <Link to="/admin/posts/new" className="self-start"><CyberButton icon={Plus}>New post</CyberButton></Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Latest title="Latest messages" to="/admin/messages" empty="No messages yet. They appear here when someone uses the contact form." count={recent?.messages.length ?? 0}>
                    {(recent?.messages ?? []).map((m) => (
                        <li key={m.id}>
                            <Link to="/admin/messages" className="block px-5 py-3 hover:bg-cyber-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-sm">
                                    <span className={m.read ? 'text-cyber-text' : 'text-white font-bold'}>{m.name}</span>
                                    {!m.read && <span className="text-xs text-cyber-pink">unread</span>}
                                    <span className="text-xs text-cyber-muted">{when(m.createdAt)}</span>
                                </p>
                                <p className="font-mono text-xs text-cyber-muted mt-1 truncate">{m.subject || m.preview}</p>
                            </Link>
                        </li>
                    ))}
                </Latest>
                <Latest title="Recent posts" to="/admin/posts" empty="No posts yet. Use New post to write the first one." count={recent?.posts.length ?? 0}>
                    {(recent?.posts ?? []).map((p) => (
                        <li key={p.id}>
                            <Link to={`/admin/posts/${p.id}`} className="block px-5 py-3 hover:bg-cyber-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
                                <p className="font-mono text-sm text-white truncate">{p.title}</p>
                                <p className="font-mono text-xs mt-1"><span className={STATUS_TONE[p.status]}>{p.status}</span> <span className="text-cyber-muted">&middot; edited {when(p.updatedAt)}</span></p>
                            </Link>
                        </li>
                    ))}
                </Latest>
            </div>
        </div>
    );
};

export default AdminHome;
