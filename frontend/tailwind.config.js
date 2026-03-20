/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm earthy palette
        cream: {
          50: '#fdfaf5',
          100: '#faf4e8',
          200: '#f5e8d0',
          300: '#eddbb8',
          400: '#e3ca9a',
          500: '#d4b07a',
        },
        clay: {
          50: '#fdf5f0',
          100: '#fae8db',
          200: '#f3ccb3',
          300: '#e9aa85',
          400: '#dc8458',
          500: '#c96a35',
          600: '#a8522a',
          700: '#884224',
          800: '#6e3520',
          900: '#5a2d1e',
        },
        bark: {
          50: '#f7f4f0',
          100: '#ede6db',
          200: '#daccb9',
          300: '#c3ad92',
          400: '#a98c6c',
          500: '#8f7050',
          600: '#755a40',
          700: '#5e4735',
          800: '#4d3a2c',
          900: '#3f3025',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #fdfaf5 0%, #faf4e8 50%, #f5e8d0 100%)',
      },
    },
  },
  plugins: [],
}
