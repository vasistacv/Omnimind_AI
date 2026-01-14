/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
                'spin-reverse': 'spin-reverse 15s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 5px var(--neon-cyan)' },
                    '50%': { boxShadow: '0 0 20px var(--neon-cyan), 0 0 10px var(--neon-cyan)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
