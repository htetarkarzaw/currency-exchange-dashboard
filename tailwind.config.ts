import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        /* Cyberpunk 2077 palette */
        accent: {
          DEFAULT: '#f3e600',
          cyan: '#55ead4',
          muted: '#f2e900',
          dark: '#c4b800',
        },
        cp2077: {
          yellow: '#f3e600',
          cyan: '#55ead4',
          red: '#c5003c',
          blue: '#007aff',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(243, 230, 0, 0.35)',
        'glow-sm': '0 0 25px -5px rgba(243, 230, 0, 0.25)',
        'glow-cyan': '0 0 30px -5px rgba(85, 234, 212, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.9', filter: 'brightness(1.1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
