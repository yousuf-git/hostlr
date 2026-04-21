/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1724',
        accent: '#C4522A',
        'accent-dark': '#A83E1F',
        moss: '#3D7B5A',
        sand: '#F0E8D8',
        muted: '#6B7280',
        border: '#E5DDD0',
        surface: '#FDFAF6',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
