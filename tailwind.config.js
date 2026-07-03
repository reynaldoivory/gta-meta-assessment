/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // ARCADE HUD -- canonical semantic tokens (use these going forward)
        // Locked by owner 2026-07-03. WCAG-AA verified in docs/ux-overhaul/DIRECTIONS.md.
        // ============================================================
        bg: {
          base: '#050b14',     // Deep Navy -- page
          surface: '#0a192f',  // Slate Blue -- cards/panels
          raised: '#12294a',   // the one emphasized block per view
          overlay: 'rgba(5, 11, 20, 0.85)', // modal/scrim backdrop
        },
        text: {
          primary: '#E6EEF7',
          secondary: '#A7BAD0',
          muted: '#8399B4',
          'on-accent': '#050b14', // dark ink on HUD-blue / Vice-pink fills
        },
        border: {
          subtle: '#17304f',
          DEFAULT: '#24406a',
          strong: '#345584',
          focus: '#29d2e3',
        },
        status: {
          // Two-channel HUD: cyan = good/actionable, pink = bad/caution.
          success: '#29d2e3',
          info: '#29d2e3',
          warning: '#ff007f',
          danger: '#ff007f',
        },
        hud: { blue: '#29d2e3', pink: '#ff007f' },
        accent: {
          'pink-text': '#ff5ba6', // body-safe pink tint (AA on all layers)
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // retires the text-[10px] cluster
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        // Arcade HUD glows -- two channels only.
        'glow-blue': '0 0 24px rgba(41, 210, 227, 0.35), 0 0 48px rgba(41, 210, 227, 0.15)',
        'glow-pink': '0 0 24px rgba(255, 0, 127, 0.35), 0 0 48px rgba(255, 0, 127, 0.15)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.25)',
        'float-lg': '0 20px 50px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)',
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
