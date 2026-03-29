/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          'blue-light': '#60a5fa',
        },
        background: {
          light: '#f0f9ff',
        },
        text: {
          dark: '#1e293b',
          light: '#64748b',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'premium-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}