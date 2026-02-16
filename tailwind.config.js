/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gta: {
          // Legacy compatibility
          dark: '#0f0918',
          panel: '#1a1128',
          green: '#22d3ee',
          red: '#fb7185',
          yellow: '#fb923c',
          gray: '#94a3b8',
        },
        // NEW: Enterprise Kid-Friendly Palette (3 Primary Colors)
        primary: {
          purple: { 
            50: '#faf5ff',
            100: '#f3e8ff',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            900: '#581c87',
          },
          cyan: { 
            50: '#ecfeff',
            100: '#cffafe',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
          },
          orange: { 
            50: '#fff7ed',
            100: '#ffedd5',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
        },
        // Neutral palette for balance
        surface: {
          dark: '#0f0918',      // Deep purple-black
          card: '#1a1128',      // Rich purple card
          elevated: '#251a35',  // Elevated purple
        },
        accent: {
          pink: '#fb7185',
          green: '#4ade80',
          gold: '#fbbf24',
        }
      },
      fontFamily: {
        // FONT 1: Display/Headings (Apple-style)
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        // FONT 2: Body text (Modern, clean)
        body: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        // FONT 3: Mono for numbers/stats (Technical feel)
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',      // 16px - SHAPE 1: Standard rounded rectangles
        '2xl': '1.5rem',   // 24px - SHAPE 1: Large rounded rectangles
        '3xl': '2rem',     // 32px - SHAPE 1: Extra large
        'full': '9999px',  // SHAPE 2: Circles/pills
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.4), 0 0 60px rgba(34, 211, 238, 0.2)',
        'glow-orange': '0 0 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',  // SHAPE 3: Apple-style elevation
        'float-lg': '0 20px 50px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' }
        }
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

