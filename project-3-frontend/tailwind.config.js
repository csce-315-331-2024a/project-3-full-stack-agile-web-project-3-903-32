/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customMaroon: 'rgb(80, 0, 0)',
      },
      backgroundImage: {
        'placeholder': "url('https://via.placeholder.com/150')",
      },
    },
  },
  plugins: [],
}
