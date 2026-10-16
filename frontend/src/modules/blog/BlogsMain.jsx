import React from 'react';
import { Folder, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CyberButton from '@/shared/ui/CyberButton';
import CatalogPage from '@/shared/catalog/CatalogPage';
import { mockBlogs } from './mockBlogs';

const renderBlog = (blog) => (
    <article key={blog.id} className="border border-cyber-border bg-cyber-black p-6 transition-colors hover:border-cyber-pink/50 group block">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2 font-mono text-xs">
                        <span className="text-cyber-pink flex items-center gap-1"><Folder className="w-3 h-3" /> {blog.category}</span>
                        <span className="text-cyber-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyber-pink transition-colors">
                        <Link to={blog.link}>{blog.title}</Link>
                    </h3>
                </div>
                <Link to={blog.link} className="hidden md:block">
                    <CyberButton variant="ghost" icon={ChevronRight}>Read</CyberButton>
                </Link>
            </div>

            <p className="font-mono text-cyber-muted text-sm mb-6 max-w-3xl leading-relaxed">
                {blog.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {blog.tags.map(tag => (
                        <span key={tag} className="font-mono text-xs text-cyber-cyan before:content-['#']">
                            {tag}
                        </span>
                    ))}
                </div>
                <Link to={blog.link} className="md:hidden">
                    <CyberButton variant="ghost" icon={ChevronRight}>Read</CyberButton>
                </Link>
            </div>
        </article>
);

const BlogsMain = () => (
    <CatalogPage
        items={mockBlogs}
        heroTitle="/BLOGS_&_RESEARCH"
        heroText="A collection of technical write-ups, project logs, and research notes. Covering everything from embedded systems to web development and data science."
        searchPlaceholder="Search articles..."
        renderItem={renderBlog}
    />
);

export default BlogsMain;
