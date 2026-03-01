import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Dumbbell, House, ScanText, Box, Menu, PersonStanding } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    // Centralized Navigation Data (keeps code DRY)
    const navItems = [
        { path: "/", icon: House, label: "Home" },
        // { path: "/dashboard", icon: Box, label: "Dashboard" },
        { path: "/blogs", icon: ScanText, label: "Blogs" },
        { path: "/tools", icon: Terminal, label: "Tools" },
        { path: "/about", icon: PersonStanding, label: "About_Me" }
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-50 border-b border-cyber-border bg-cyber-black/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

                {/* === LEFT: LOGO === */}
                <Link to="/" className="group z-50 flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="border border-cyber-text bg-cyber-black px-3 py-1.5 font-mono font-bold text-lg uppercase text-cyber-text transition-colors duration-300 group-hover:border-cyber-pink group-hover:text-cyber-pink">
                        GNRHUB_ <span className="text-cyber-pink text-xs align-top">v2</span>
                    </div>
                </Link>

                {/* === MIDDLE: NAVIGATION (Desktop) === */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                relative group flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-300
                                ${isActive(item.path) ? 'text-cyber-pink' : 'text-cyber-muted hover:text-white'}
                            `}
                        >
                            {item.icon && <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />}
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
                <div className="md:hidden flex items-center z-50">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-cyber-text hover:text-cyber-pink transition-colors p-2 border border-transparent hover:border-cyber-border"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

            </div>

            {/* === MOBILE MENU OVERLAY === */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-cyber-black border-b border-cyber-border shadow-2xl">
                    <nav className="flex flex-col px-4 py-6 space-y-4">
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