/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rema: {
          blue: '#002855',
          red: '#E30613',
          lightBlue: '#E6EEF8',
          accent: '#0056B3'
        }
      }
    },
  },
  plugins: [],
}
