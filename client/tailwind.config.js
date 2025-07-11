// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};