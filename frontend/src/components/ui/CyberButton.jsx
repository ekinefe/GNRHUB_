import React from 'react';

const CyberButton = ({ children, onClick, variant = 'primary', icon: Icon }) => {
    const baseStyles = "relative px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all duration-200 clip-path-polygon group active:scale-95 flex items-center gap-2";

    const variants = {
        // OLD: bg-cyber-primary (Cyan) -> NEW: bg-cyber-pink (Your preference)
        primary: "bg-cyber-pink text-black hover:bg-white hover:shadow-neon-pink border border-transparent",

        // Kept Cyan as an "Alternative" option
        cyan: "bg-cyber-cyan text-black hover:bg-white hover:shadow-neon-cyan border border-transparent",

        secondary: "border border-cyber-border text-cyber-text hover:border-cyber-pink hover:text-cyber-pink bg-cyber-panel",

        alert: "bg-cyber-offline text-black hover:bg-white hover:shadow-none",

        ghost: "text-cyber-muted hover:text-cyber-pink border border-transparent"
    };

    return (
        <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

export default CyberButton;