import React, { useMemo, useState } from 'react';
import { Search, Tag, Folder } from 'lucide-react';
import TextType from '@/shared/animations/TextType';
import DecryptedText from '@/shared/animations/DecryptedText';
import PageShell from '@/shared/layout/PageShell';
import { useDebounce } from '@/shared/hooks/useDebounce';

const ALL = 'All';

// A searchable, filterable list page (tools, blogs, ...).
//   items: [{ id, title, excerpt, category, tags[] }]
//   renderItem(item) -> the card for one item
export default function CatalogPage({ items, heroTitle, heroText, searchPlaceholder, renderItem, debounceMs = 800 }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(ALL);
    const [selectedTag, setSelectedTag] = useState(ALL);
    const [debouncedQuery, isSearching] = useDebounce(searchQuery, debounceMs);

    const categories = [ALL, ...new Set(items.map((item) => item.category))];
    const tags = [ALL, ...new Set(items.flatMap((item) => item.tags))];

    const filtered = useMemo(() => {
        const q = debouncedQuery.toLowerCase();
        return items.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
            const matchesCategory = selectedCategory === ALL || item.category === selectedCategory;
            const matchesTag = selectedTag === ALL || item.tags.includes(selectedTag);
            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [items, debouncedQuery, selectedCategory, selectedTag]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(ALL);
        setSelectedTag(ALL);
    };

    return (
        <PageShell width="7xl">
            <section className="relative pt-24 pb-12 mb-8 border-b border-cyber-border/40">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">
                    <TextType
                        text={[heroTitle]}
                        initialDelay={100}
                        typingSpeed={75}
                        pauseDuration={1500}
                        loop={false}
                        showCursor
                        cursorCharacter="_"
                    />
                </h1>
                <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed text-justify">{heroText}</p>
            </section>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-1/4 space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Search className="w-5 h-5 text-cyber-pink" />
                            Search
                        </h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
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
                                            key={debouncedQuery} // remount to replay the animation when a search completes
                                            text={`Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
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

                    <div className="space-y-3">
                        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Folder className="w-5 h-5 text-cyber-pink" />
                            Categories
                        </h2>
                        <div className="flex flex-col gap-2">
                            {categories.map((category) => (
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

                    <div className="space-y-3">
                        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Tag className="w-5 h-5 text-cyber-pink" />
                            Tags
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
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

                <main className="w-full lg:w-3/4">
                    <div className="flex justify-end items-center mb-6">
                        <div className="hidden md:flex gap-2 text-xs font-mono">
                            {selectedCategory !== ALL && (
                                <span className="bg-cyber-pink/10 text-cyber-pink px-2 py-1 border border-cyber-pink/30 flex items-center gap-1">
                                    <Folder className="w-3 h-3" /> {selectedCategory}
                                </span>
                            )}
                            {selectedTag !== ALL && (
                                <span className="bg-cyber-cyan/10 text-cyber-cyan px-2 py-1 border border-cyber-cyan/30 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> {selectedTag}
                                </span>
                            )}
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="space-y-6">{filtered.map((item) => renderItem(item))}</div>
                    ) : (
                        <div className="border border-dashed border-cyber-border p-12 text-center">
                            <p className="font-mono text-cyber-muted mb-4">No results found matching your criteria.</p>
                            <button onClick={clearFilters} className="font-mono text-sm text-cyber-pink hover:underline">
                                [ CLEAR_FILTERS ]
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </PageShell>
    );
}
