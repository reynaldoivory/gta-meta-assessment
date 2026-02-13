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
          dark: '#0f172a',       // Slate 900 (Background)
          panel: '#1e293b',      // Slate 800 (Card Background)
          green: '#238c64',      // Heist Green (Success/Action)
          red: '#d0021b',        // Wasted Red (Error/Danger)
          yellow: '#facc15',     // Rockstar Yellow (Warning)
          gray: '#94a3b8',       // Slate 400 (Muted Text)
        },
      },
      fontFamily: {
        heading: ['Chalet London', 'Impact', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'heist': '0 0 10px rgba(35, 140, 100, 0.3)',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out'
      }
    },
  },
  plugins: [],
}

