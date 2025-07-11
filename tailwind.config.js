/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a9f7',
          500: '#0d8de4',
          600: '#006dc2',
          700: '#00579e',
          800: '#044a83',
          900: '#0a3e6d',
          950: '#07284a',
        },
        secondary: {
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#b9e4ff',
          300: '#7cd0ff',
          400: '#36b9ff',
          500: '#0d9eeb',
          600: '#007dca',
          700: '#0063a3',
          800: '#005287',
          900: '#074570',
          950: '#042b4a',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#ffcaca',
          300: '#ffa5a5',
          400: '#ff7171',
          500: '#f84040',
          600: '#e02424',
          700: '#bc1b1b',
          800: '#9b1919',
          900: '#801b1b',
          950: '#450a0a',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e2e3e8',
          200: '#c5c7d2',
          300: '#a3a6b7',
          400: '#81859c',
          500: '#686c85',
          600: '#53576c',
          700: '#44475a',
          800: '#3a3c4a',
          900: '#33343e',
          950: '#1e1e24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 8s ease-in-out infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}