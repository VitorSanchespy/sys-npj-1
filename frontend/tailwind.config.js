/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ufmt-green': {
          50: '#e6f7ed',
          100: '#c1ebd4',
          200: '#97dfba',
          300: '#6bd39f',
          400: '#3fc784',
          500: '#25ad6a', // Cor principal (verde UFMT)
          600: '#1d8752',
          700: '#15613b',
          800: '#0d3b24',
          900: '#04160b',
        },
        'ufmt-gold': {
          50: '#fff8e6',
          100: '#ffedbf',
          200: '#ffe196',
          300: '#ffd66b',
          400: '#ffca40',
          500: '#ffbf16', // Dourado UFMT
          600: '#e6a500',
          700: '#b38100',
          800: '#805c00',
          900: '#4d3700',
        }
      },
    },
  },
  plugins: [],
}