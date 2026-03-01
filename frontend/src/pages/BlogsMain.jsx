import React, { useState, useMemo } from 'react';
import { Search, Tag, Folder, Calendar, ChevronRight } from 'lucide-react';
import CyberButton from '../components/ui/CyberButton';
import TextType from '../components/animations/TextType';
import { Link } from 'react-router-dom';
import { mockBlogs } from '../data/mockBlogs';
import DecryptedText from '../components/animations/DecryptedText';


const BlogsMain = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTag, setSelectedTag] = useState('All');
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    React.useEffect(() => {
        setIsSearching(true);
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setIsSearching(false);
        }, 800);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Extract unique categories and tags for filters
    const categories = ['All', ...new Set(mockBlogs.map(blog => blog.category))];
    const tags = ['All', ...new Set(mockBlogs.flatMap(blog => blog.tags))];

    // Filter logic
    const filteredBlogs = useMemo(() => {
        return mockBlogs.filter(blog => {
            const matchesSearch = blog.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(debouncedQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
            const matchesTag = selectedTag === 'All' || blog.tags.includes(selectedTag);

            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [debouncedQuery, selectedCategory, selectedTag]);

    return (
        <div className="min-h-screen bg-cyber-black bg-grid-pattern [background-size:50px_50px] text-cyber-text p-4 md:p-12 flex justify-center">
            <div className="max-w-7xl w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen p-4 md:p-8 shadow-2xl relative">

                {/* Hero Section */}
                <section className="relative pt-24 pb-12 mb-8 border-b border-cyber-border/40">
                    <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">
                        <TextType
                            text={["/BLOGS_&_RESEARCH"]}
                            initialDelay={100}
                            typingSpeed={75}
                            pauseDuration={1500}
                            loop={false}
                            showCursor
                            cursorCharacter="_"
                        />
                    </h1>
                    <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed text-justify">
                        A collection of technical write-ups, project logs, and research notes. Covering everything from embedded systems to web development and data science.
                    </p>
                </section>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT/TOP: Filters & Search */}
                    <aside className="w-full lg:w-1/4 space-y-8">

                        {/* Search Bar */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                <Search className="w-5 h-5 text-cyber-pink" />
                                Search
                            </h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-cyber-black border border-cyber-border text-cyber-text p-3 font-mono text-sm focus:outline-none focus:border-cyber-pink transition-colors mb-2"
                                />
                                <div className="h-6 font-mono text-xs">
                                    {searchQuery && (
                                        isSearching ? (
                                            <DecryptedText
                                                text="Searching"
                                                animateOn="view"
                                                sequential={true}
                                                speed={100}
                                                maxIterations={20}
                                                className="text-cyber-pink font-bold"
                                                encryptedClassName="text-cyber-muted"
                                            />
                                        ) : (
                                            <DecryptedText
                                                key={debouncedQuery} // Remount to trigger animation again when search completes
                                                text={`Found ${filteredBlogs.length} result${filteredBlogs.length !== 1 ? 's' : ''}`}
                                                animateOn="view"
                                                sequential={true}
                                                speed={100}
                                                maxIterations={10}
                                                className="text-cyber-cyan font-bold"
                                                encryptedClassName="text-cyber-muted"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                <Folder className="w-5 h-5 text-cyber-pink" />
                                Categories
                            </h2>
                            <div className="flex flex-col gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`text-left font-mono text-sm px-3 py-2 border transition-all duration-300 ${selectedCategory === category
                                            ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5'
                                            : 'border-transparent text-cyber-muted hover:border-cyber-border hover:text-cyber-text'
                                            }`}
                                    >
                                        <span className={selectedCategory === category ? '' : 'text-cyber-pink mr-2'}>&gt;</span> {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                <Tag className="w-5 h-5 text-cyber-pink" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`font-mono text-xs px-2 py-1 border transition-all duration-300 ${selectedTag === tag
                                            ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10'
                                            : 'border-cyber-border text-cyber-muted hover:border-cyber-text hover:bg-cyber-border/20'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT: Blog List */}
                    <main className="w-full lg:w-3/4">
                        <div className="flex justify-end items-center mb-6">
                            {/* Active Filters Display */}
                            <div className="hidden md:flex gap-2 text-xs font-mono">
                                {selectedCategory !== 'All' && (
                                    <span className="bg-cyber-pink/10 text-cyber-pink px-2 py-1 border border-cyber-pink/30 flex items-center gap-1">
                                        <Folder className="w-3 h-3" /> {selectedCategory}
                                    </span>
                                )}
                                {selectedTag !== 'All' && (
                                    <span className="bg-cyber-cyan/10 text-cyber-cyan px-2 py-1 border border-cyber-cyan/30 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> {selectedTag}
                                    </span>
                                )}
                            </div>
                        </div>

                        {filteredBlogs.length > 0 ? (
                            <div className="space-y-6">
                                {filteredBlogs.map(blog => (
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
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-cyber-border p-12 text-center">
                                <p className="font-mono text-cyber-muted mb-4">No results found matching your criteria.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedTag('All'); }}
                                    className="font-mono text-sm text-cyber-pink hover:underline"
                                >
                                    [ CLEAR_FILTERS ]
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BlogsMain;