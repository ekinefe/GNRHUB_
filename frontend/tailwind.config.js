/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // You used JetBrains for EVERYTHING in the old project. 
                // This sets it as the default font stack for the whole app.
                sans: ['"JetBrains Mono"', 'monospace'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                // Values live in src/index.css (:root) as RGB triplets; edit them there.
                cyber: {
                    black: 'rgb(var(--cyber-black) / <alpha-value>)',
                    panel: 'rgb(var(--cyber-panel) / <alpha-value>)',
                    border: 'rgb(var(--cyber-border) / <alpha-value>)',
                    text: 'rgb(var(--cyber-text) / <alpha-value>)',
                    muted: 'rgb(var(--cyber-muted) / <alpha-value>)',
                    pink: 'rgb(var(--cyber-pink) / <alpha-value>)',
                    cyan: 'rgb(var(--cyber-cyan) / <alpha-value>)',
                    purple: 'rgb(var(--cyber-purple) / <alpha-value>)',
                    active: 'rgb(var(--cyber-active) / <alpha-value>)',
                    success: 'rgb(var(--cyber-success) / <alpha-value>)',
                    beta: 'rgb(var(--cyber-beta) / <alpha-value>)',
                    offline: 'rgb(var(--cyber-offline) / <alpha-value>)',
                    alert: 'rgb(var(--cyber-alert) / <alpha-value>)',
                },
            },
            // Matches your 50px graph paper grid
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgb(var(--cyber-border)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--cyber-border)) 1px, transparent 1px)",
            },
            backgroundSize: {
                'grid-50': '50px 50px',
            },
            boxShadow: {
                'neon-pink': 'var(--glow-pink)',
                'neon-cyan': 'var(--glow-cyan)',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
            },
            zIndex: {
                header: 'var(--z-header)',
                modal: 'var(--z-modal)',
                toast: 'var(--z-toast)',
            },
            transitionDuration: {
                fast: 'var(--motion-fast)',
                base: 'var(--motion-base)',
                slow: 'var(--motion-slow)',
            },
            transitionTimingFunction: {
                token: 'var(--motion-ease)',
            },
        },
    },
    plugins: [],
}
