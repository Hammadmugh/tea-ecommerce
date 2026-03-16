/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'prosto-one': ['Prosto One', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#282828',
        'primary-bg': '#D9D9D9',
        secondary: '#000000',
      },
      letterSpacing: {
        'wider': '0.5px',
      },
    },
  },
  plugins: [],
}
