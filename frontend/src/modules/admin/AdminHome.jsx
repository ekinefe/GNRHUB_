import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, NotebookPen } from 'lucide-react';
import { useAdmin } from './AdminContext';

const Card = ({ to, icon: Icon, title, children }) => (
    <Link to={to} className="block border border-cyber-border p-5 hover:border-cyber-pink/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan">
        <p className="flex items-center gap-2 font-mono text-sm text-cyber-cyan mb-3"><Icon className="w-4 h-4" /> {title}</p>
        {children}
    </Link>
);

// The admin home: what needs attention, in two cards.
const AdminHome = () => {
    const { summary } = useAdmin();
    if (!summary) return <p role="status" className="font-mono text-cyber-muted">Loading...</p>;
    const { messages, posts } = summary;
    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Card to="/admin/messages" icon={Mail} title="Messages">
                <p className="font-mono text-3xl text-white">{messages.unread}</p>
                <p className="font-mono text-xs text-cyber-muted mt-1">{messages.unread === 1 ? 'unread message' : 'unread messages'}, {messages.total} in total</p>
            </Card>
            <Card to="/admin/posts" icon={NotebookPen} title="Posts">
                <p className="font-mono text-3xl text-white">{posts.public + posts.private + posts.draft}</p>
                <p className="font-mono text-xs text-cyber-muted mt-1">{posts.public} public, {posts.private} private, {posts.draft} draft</p>
            </Card>
        </div>
    );
};

export default AdminHome;
