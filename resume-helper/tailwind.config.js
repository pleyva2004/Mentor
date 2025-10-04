/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
        secondary: '#1F2937',
        background: '#F9FAFB',
        'card-background': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'border-color': '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
      },
      boxShadow: {
        'default': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
