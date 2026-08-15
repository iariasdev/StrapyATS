/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0d12',
        foreground: '#f4f4f5',
        surface: {
          50: '#1e212b',
          100: '#161820',
          200: '#111318',
          300: '#0c0d12',
          border: '#272b38',
          borderLight: '#393f52',
        },
        brand: {
          primary: '#0085f4',
          hover: '#0072d6',
          cyan: '#38bdf8',
          accent: '#10b981',
          danger: '#f43f5e',
          dark: '#0c0d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'revi-sm': '2px 2px 0px #000000',
        'revi': '3px 3px 0px #000000',
        'revi-lg': '5px 5px 0px #000000',
        'revi-blue': '3px 3px 0px #0085f4',
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
