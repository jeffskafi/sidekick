import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/_components/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      colors: {
        'primary': {
          light: '#F59E0B', // Amber-500
          dark: '#D97706', // Amber-600
        },
        'secondary': {
          light: '#B45309', // Amber-700
          dark: '#92400E', // Amber-800
        },
        'background': {
          light: '#FFFBEB', // Amber-50
          dark: '#1A1A1A', // Very dark gray, almost black
        },
        'surface': {
          light: '#FEF3C7', // Amber-100
          dark: '#2A2A2A', // Dark gray
        },
        'text': {
          light: '#78350F', // Amber-900
          dark: '#FDE68A', // Amber-200
        },
        'text-light': {
          light: '#92400E', // Amber-800
          dark: '#FCD34D', // Amber-300
        },
        'accent': {
          light: '#059669', // Emerald-600
          dark: '#10B981', // Emerald-500
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundColor: {
        'dark-bg': '#1a1a1a',
      },
      fontSize: {
        'base': '1.0625rem',
      },
      spacing: {
        '17': '4.25rem',
        '21': '5.25rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config