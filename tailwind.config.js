/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: "var(--pink)",
        blue: "var(--blue)",
        lilac: "var(--lilac)",
        meta: "var(--meta)",
        text: "var(--text)",
        bg: "var(--bg)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};





