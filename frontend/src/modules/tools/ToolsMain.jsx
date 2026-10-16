import React from 'react';
import { Folder, Calendar, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CyberButton from '@/shared/ui/CyberButton';
import CatalogPage from '@/shared/catalog/CatalogPage';
import { tools } from '@/shared/content/tools';
import { useAuth } from '@/modules/auth/AuthContext';

const ToolsMain = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Guests are bounced to login, signed-in users go straight to the tool.
    const handleToolAccess = (link) => {
        if (loading) return; // session still being checked: do not treat a signed-in user as a guest
        navigate(user ? link : '/login');
    };

    const renderTool = (tool, { highlight }) => (
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
                        {highlight(tool.title)}
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
                {highlight(tool.excerpt)}
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
    );

    return (
        <CatalogPage
            items={tools}
            heroTitle="/TOOLS_&_UTILITIES"
            heroText="A collection of practical tools, CLI utilities, and scripts I've built to automate workflows and diagnose problems."
            metaTitle="Tools"
            metaDescription="Practical tools, CLI utilities and scripts built to automate workflows."
            searchPlaceholder="Search tools..."
            renderItem={renderTool}
        />
    );
};

export default ToolsMain;
