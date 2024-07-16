const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue[600],
        secondary: colors.gray[300],
        background: colors.gray[100],
        surface: colors.white,
        text: colors.gray[800],
        'text-secondary': colors.gray[500],
        blue: {
          300: '#93C5FD',
          500: '#3B82F6',
        },
        green: {
          500: '#10B981',
        },
        gray: {
          50: '#F9FAFB',
          300: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}