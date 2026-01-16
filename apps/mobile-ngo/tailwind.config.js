/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "../../packages/mobile-shared/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        primary: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'System'],
      },
    },
  },
  plugins: [],
}
