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
      // Extend default theme
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      colors: {
        // Custom color palette
        'primary': '#F59E0B', // Amber-500
        'primary-dark': '#D97706', // Amber-600
        'secondary': '#78350F', // Amber-900
        'background': {
          light: '#FFFBEB', // Amber-50
          dark: '#1A1A1A', // Very dark gray, almost black
        },
        'surface': {
          light: '#FFFFFF',
          dark: '#2A2A2A', // Dark gray
        },
        'text': {
          light: '#1F2937', // Gray-800
          dark: '#E5E5E5', // Light gray
        },
        'text-light': {
          light: '#4B5563', // Gray-600
          dark: '#A0A0A0', // Medium gray
        },
        'accent': '#10B981', // Emerald-500
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        // Keyframes for custom animations
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
        'dark-bg': '#1a1a1a', // or any other color code you prefer
      },
      fontSize: {
        'base': '1.0625rem', // Slightly increased from 1rem (17px)
      },
      spacing: {
        // Add some slightly larger spacing options
        '17': '4.25rem',
        '21': '5.25rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config