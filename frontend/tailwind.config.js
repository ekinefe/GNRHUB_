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
                cyber: {
                    // Your exact background colors
                    black: '#050505',  // --bg-dark
                    panel: '#111111',  // --bg-panel
                    border: '#333333', // --border

                    // Your text colors
                    text: '#eeeeee',   // --text-main
                    muted: '#888888',  // --text-muted

                    // Accents (Pink is default to match your habit)
                    pink: '#FF318C',   // --accent (Cyber Pink)
                    cyan: '#00f3ff',   // Alternative High-Tech Cyan
                    purple: '#7000ff', // Alternative Electric Purple

                    // Status Colors (from your CSS)
                    active: '#00ff9d', // --status-active
                    success: '#00ff9d', // Added for compatibility with index.css
                    beta: '#ffb700',   // --status-beta
                    offline: '#ff3333',// --status-offline
                }
            },
            // Matches your 50px graph paper grid
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)",
            },
            backgroundSize: {
                'grid-50': '50px 50px',
            },
            boxShadow: {
                // Adjusted glows to match the Pink accent
                'neon-pink': '0 0 5px #FF318C, 0 0 20px rgba(255, 49, 140, 0.4)',
                'neon-cyan': '0 0 5px #00f3ff, 0 0 20px rgba(0, 243, 255, 0.4)',
            }
        },
    },
    plugins: [],
}