/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        colors: {
          primary: "#6366f1", // indigo modern
          dark: "#0f172a",    // slate dark
        },
      },
    },
    plugins: [],
  }
