/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        ocean: {
          950: '#0A1931',
          800: '#1A3D63',
          600: '#4A7FA7',
          300: '#B4CFE5',
          50: '#F6FAFD',
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
