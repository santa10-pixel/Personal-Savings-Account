/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#f0f7f4',
          100: '#dceee4',
          200: '#bbe0ce',
          300: '#8fccb2',
          400: '#5fb392',
          500: '#399676',
          600: '#2a785e',
          700: '#176d50', // Core Brand Green
          800: '#144c3a',
          900: '#113f31',
        },
        navy: {
          800: '#1a273a',
          900: '#101b2d', // Core Sidebar Dark Navy
          950: '#0b1320',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Manrope"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
