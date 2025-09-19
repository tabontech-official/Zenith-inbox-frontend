// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9b59b6', // Purple color
        secondary: '#f39c12', // Yellow color for buttons
        accent: '#8e44ad', // Another shade of purple for hover
      },
    },
  },
  plugins: [],
}
