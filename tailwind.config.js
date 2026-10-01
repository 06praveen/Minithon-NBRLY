/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F4EF",
        charcoal: "#171717",
        lime: "#C7F36B",
        "muted-gray": "#737373",
        "nbrly-border": "#DCDCD6",
        "urgent-red": "#FF5C5C",
        "success-green": "#4F8F5B",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'panel': '20px',
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(23, 23, 23, 0.05)',
        'lifted': '0 12px 24px -6px rgba(23, 23, 23, 0.08)',
      },
    },
  },
  plugins: [],
}
