import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B7340',
        secondary: '#C9A84C',
        accent: '#0E7490',
      },
      fontFamily: {
        sans: ['Noto Sans Thai', 'Noto Nastaliq Urdu', 'sans-serif'],
      },
      borderRadius: {
        'islamic': '0.375rem',
      },
      keyframes: {
        'badge-unlock': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      animation: {
        'badge-unlock': 'badge-unlock 0.5s ease-out forwards',
        'confetti-fall': 'confetti-fall 3s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
