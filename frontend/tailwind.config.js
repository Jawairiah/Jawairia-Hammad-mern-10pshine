/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f7f9f7',
          100: '#eef2ee',
          200: '#dbe5db',
          300: '#b8cdb8',
          400: '#8fb18f',
          500: '#6b9370',
          600: '#527a59',
          700: '#3f5e45',
          800: '#2d4433',
          900: '#1a2920',
        },
        moss: {
          50: '#f5f7f3',
          100: '#e8ede3',
          200: '#d2dcc9',
          300: '#a9bfa0',
          400: '#7d9872',
          500: '#5a7a51',
          600: '#46603f',
          700: '#384d33',
          800: '#2a3927',
          900: '#1c251b',
        },
        sky: {
          50: '#f0f7fa',
          100: '#deeef5',
          200: '#c5e3ed',
          300: '#9dcfe0',
          400: '#6db3cb',
          500: '#4a97b3',
          600: '#3a7a95',
          700: '#2d5f73',
          800: '#1f4251',
          900: '#12252f',
        },
        cream: '#fdfbf7',
        'warm-white': '#faf9f6',
        paper: '#f8f6f1',
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}