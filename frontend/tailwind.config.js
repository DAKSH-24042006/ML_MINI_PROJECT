/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#e10600',
          darkred: '#b80500',
          bg: '#0b0e14',
          card: '#121721',
          cardHover: '#181f2c',
          border: '#232d3f',
          cyan: '#00d2be',
          orange: '#ff8700',
          yellow: '#ffcc00',
          blue: '#3671c6',
          green: '#229971',
          textPrimary: '#f3f4f6',
          textSecondary: '#9ca3af',
          textMuted: '#6b7280'
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Roboto Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
