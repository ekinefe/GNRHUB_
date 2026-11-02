import React from 'react';

const CyberCard = ({ children, title, className = "" }) => {
    return (
        // Changed hover:border-cyber-primary -> hover:border-cyber-pink
        <div className={`relative bg-cyber-panel border border-cyber-border p-6 group hover:border-cyber-pink transition-colors ${className}`}>

            {/* Header Glow Line - Changed to Pink */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />

            {title && (
                // Changed text-cyber-primary -> text-cyber-pink
                <h3 className="text-cyber-pink font-mono text-sm uppercase tracking-widest mb-4 border-b border-cyber-border pb-2">
                    {title}
                </h3>
            )}
            <div className="text-cyber-text font-mono text-sm leading-relaxed">
                {children}
            </div>
        </div>
    );
};

export default CyberCard;