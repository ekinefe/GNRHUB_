import React, { useEffect, useId, useState } from 'react';
import Wordmark from '@/shared/ui/Wordmark';
import ScrollProgress from './ScrollProgress';
import { Link, useLocation } from 'react-router-dom';
import { House, NotebookPen, Menu, X, PersonStanding } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuId = useId();

    // Close the drawer when the route changes or Escape is pressed.
    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;
        const onKey = (e) => e.key === 'Escape' && setIsMobileMenuOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isMobileMenuOpen]);

    // Header shrinks a little once the page is scrolled.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Helper to check if link is active
    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`));

    // Centralized Navigation Data (keeps code DRY)
    const navItems = [
        { path: "/", icon: House, label: "Home" },
        { path: "/blog", icon: NotebookPen, label: "Blog" },
        { path: "/about", icon: PersonStanding, label: "About" }
    ].filter(Boolean);

    return (
        <header className="fixed top-0 left-0 w-full z-header border-b border-cyber-border bg-cyber-black/90 backdrop-blur-md">
            <div className={`max-w-screen-2xl mx-auto px-4 md:px-10 ${scrolled ? 'h-14' : 'h-16'} transition-[height] duration-base flex items-center justify-between`}>

                {/* === LEFT: LOGO === */}
                <Link to="/" className="group z-header flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="border border-cyber-text bg-cyber-black px-3 py-1.5 font-mono text-lg text-cyber-text transition-colors duration-300 group-hover:border-cyber-pink group-hover:text-cyber-pink">
                        <Wordmark />
                    </div>
                </Link>

                {/* === MIDDLE: NAVIGATION (Desktop) === */}
                <nav aria-label="Main" className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                relative group flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-300
                                ${isActive(item.path) ? 'text-cyber-pink' : 'text-cyber-muted hover:text-white'}
                            `}
                        >
                            {item.icon && <item.icon aria-hidden="true" className={`w-4 h-4 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />}
                            <span>{item.label}</span>

                            {/* Active Indicator (The "LED" Line) */}
                            <span className={`
                                absolute bottom-0 left-0 h-[2px] bg-cyber-pink transition-all duration-300
                                ${isActive(item.path) ? 'w-full shadow-neon-pink' : 'w-0 group-hover:w-full group-hover:bg-cyber-border'}
                            `} />
                        </Link>
                    ))}
                </nav>

                {/* === RIGHT: MOBILE MENU TOGGLE === */}
                <div className="md:hidden flex items-center z-header">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls={menuId}
                        className="text-cyber-text hover:text-cyber-pink transition-colors p-2 border border-transparent hover:border-cyber-border"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

            </div>

            <ScrollProgress />

            {/* === MOBILE MENU OVERLAY === */}
            {isMobileMenuOpen && (
                <div id={menuId} className="md:hidden absolute top-full left-0 w-full bg-cyber-black border-b border-cyber-border shadow-2xl">
                    <nav aria-label="Mobile" className="flex flex-col px-4 py-6 space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                                className={`
                                    flex items-center gap-3 p-3 border transition-colors font-mono uppercase tracking-wider text-sm
                                    ${isActive(item.path)
                                        ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5'
                                        : 'border-cyber-border text-cyber-muted hover:border-cyber-text hover:text-white bg-cyber-panel'}
                                `}
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;