/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./scripts/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

