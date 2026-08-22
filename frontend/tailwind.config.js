/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#faf4f7',
          100: '#f5e8ef',
          200: '#edd2e1',
          300: '#e0b0cc',
          400: '#cd84ad',
          500: '#b85d90',
          600: '#9d4375',
          700: '#83345e',
          800: '#6d2e4f',
          900: '#581c38',
          950: '#390c22',
        },
        ivory: {
          50: '#fcfbf8',
          100: '#f8f6f0',
          200: '#f0ece1',
          300: '#e6dfce',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
        'card': '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'dropdown': '0 4px 16px -2px rgba(28, 25, 23, 0.08), 0 2px 4px -2px rgba(28, 25, 23, 0.04)',
      },
    },
  },
  plugins: [],
}
