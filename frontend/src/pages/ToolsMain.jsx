import React, { useState, useMemo, useEffect } from 'react';
import { Search, Tag, Folder, Calendar, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CyberButton from '../components/ui/CyberButton';
import TextType from '../components/animations/TextType';
import DecryptedText from '../components/animations/DecryptedText';
import { mockTools } from '../data/mockTools';
import { useAuth } from '../context/AuthContext'; // <-- ADDED AUTH CONTEXT

const ToolsMain = () => {
    // Auth & Navigation
    const { user } = useAuth();
    const navigate = useNavigate();

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTag, setSelectedTag] = useState('All');
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        setIsSearching(true);
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setIsSearching(false);
        }, 800);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Extract unique categories and tags for filters
    const categories = ['All', ...new Set(mockTools.map(tool => tool.category))];
    const tags = ['All', ...new Set(mockTools.flatMap(tool => tool.tags))];

    // Filter logic
    const filteredTools = useMemo(() => {
        return mockTools.filter(tool => {
            const matchesSearch = tool.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                tool.excerpt.toLowerCase().includes(debouncedQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            const matchesTag = selectedTag === 'All' || tool.tags.includes(selectedTag);

            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [debouncedQuery, selectedCategory, selectedTag]);

    // --- NEW: Access Gatekeeper ---
    const handleToolAccess = (link) => {
        if (user) {
            navigate(link); // Let them in
        } else {
            navigate('/login'); // Bounce them to login
        }
    };

    return (
        <div className="min-h-screen bg-cyber-black bg-grid-pattern [background-size:50px_50px] text-cyber-text p-4 md:p-12 flex justify-center">
            <div className="max-w-7xl w-full bg-cyber-black border-l border-r border-cyber-border min-h-screen p-4 md:p-8 shadow-2xl relative">

                {/* Hero Section */}
                <section className="relative pt-24 pb-12 mb-8 border-b border-cyber-border/40">
                    <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">
                        <TextType
                            text={["/TOOLS_&_UTILITIES"]}
                            initialDelay={100}
                            typingSpeed={75}
                            pauseDuration={1500}
                            loop={false}
                            showCursor
                            cursorCharacter="_"
                        />
                    </h1>
                    <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed text-justify">
                        A collection of practical tools, CLI utilities, and scripts I've built to automate workflows and diagnose problems.
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
                                    placeholder="Search tools..."
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
                                                key={debouncedQuery}
                                                text={`Found ${filteredTools.length} result${filteredTools.length !== 1 ? 's' : ''}`}
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

                    {/* RIGHT: Tool List */}
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

                        {filteredTools.length > 0 ? (
                            <div className="space-y-6">
                                {filteredTools.map(tool => (
                                    <article key={tool.id} className="border border-cyber-border bg-cyber-black p-6 transition-colors hover:border-cyber-pink/50 group block">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2 font-mono text-xs">
                                                    <span className="text-cyber-pink flex items-center gap-1"><Folder className="w-3 h-3" /> {tool.category}</span>
                                                    <span className="text-cyber-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {tool.date}</span>
                                                </div>

                                                {/* Replaced <Link> with an onClick handler on the title */}
                                                <h3
                                                    onClick={() => handleToolAccess(tool.link)}
                                                    className="text-2xl font-bold text-white group-hover:text-cyber-pink transition-colors cursor-pointer"
                                                >
                                                    {tool.title}
                                                </h3>
                                            </div>

                                            {/* Replaced <Link> with dynamic button */}
                                            <div className="hidden md:block">
                                                <CyberButton
                                                    variant={user ? "ghost" : "primary"}
                                                    icon={user ? ChevronRight : Lock}
                                                    onClick={() => handleToolAccess(tool.link)}
                                                >
                                                    {user ? "ACCESS_TOOL" : "AUTH_REQUIRED"}
                                                </CyberButton>
                                            </div>
                                        </div>

                                        <p className="font-mono text-cyber-muted text-sm mb-6 max-w-3xl leading-relaxed">
                                            {tool.excerpt}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                {tool.tags.map(tag => (
                                                    <span key={tag} className="font-mono text-xs text-cyber-cyan before:content-['#']">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {/* Mobile Button */}
                                            <div className="md:hidden">
                                                <CyberButton
                                                    variant={user ? "ghost" : "primary"}
                                                    icon={user ? ChevronRight : Lock}
                                                    onClick={() => handleToolAccess(tool.link)}
                                                >
                                                    {user ? "ACCESS" : "LOCKED"}
                                                </CyberButton>
                                            </div>
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

export default ToolsMain;