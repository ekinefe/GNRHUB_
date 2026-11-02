export const controlClasses = (error) =>
    `w-full bg-cyber-panel border text-white font-mono p-3 text-sm placeholder-cyber-muted/80 transition-colors focus:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
        error
            ? 'border-cyber-offline focus:border-cyber-offline focus-visible:ring-cyber-offline'
            : 'border-cyber-border focus:border-cyber-cyan focus-visible:ring-cyber-cyan'
    }`;

export const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
