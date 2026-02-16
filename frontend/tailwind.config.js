/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 1. Typography System
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'], // For code, data, tiny details
                sans: ['"Space Grotesk"', 'sans-serif'], // For big titles, easy reading
            },
            // 2. High-Tech Color Palette
            colors: {
                cyber: {
                    black: '#020617',  // Deepest slate (richer than #000)
                    slate: '#1e293b',  // Panel backgrounds
                    primary: '#00f0ff', // "Hacker" Cyan (Tron-like)
                    secondary: '#7000ff', // Electric Purple
                    alert: '#ff003c',   // Cyberpunk Red
                }
            },
            // 3. Custom Animations (For that "alive" feel)
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glitch': 'glitch 1s linear infinite',
            },
            // 4. Glow Effects (Box Shadows)
            boxShadow: {
                'neon-blue': '0 0 5px theme("colors.cyber.primary"), 0 0 20px theme("colors.cyber.primary")',
                'neon-purple': '0 0 5px theme("colors.cyber.secondary"), 0 0 20px theme("colors.cyber.secondary")',
            }
        },
    },
    plugins: [],
}