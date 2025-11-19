/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          green: '#2C5530',
          navy: '#1E3A5F',
          gold: '#D4A853',
          gray: '#2A2A2A',
          red: '#8B0000',
          blue: '#0066CC'
        },
        friendly: '#0066CC',
        enemy: '#CC0000',
        neutral: '#00CC00',
        unknown: '#FFFF00'
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: ['Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}
