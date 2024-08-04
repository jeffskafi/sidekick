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
          light: '#FF7247', // More vibrant amber
          dark: '#E63B00', // Darker amber
        },
        'secondary': {
          light: '#FFA07A', // Light salmon
          dark: '#FF4500', // Orange-red
        },
        'background': {
          light: '#FFF5EB', // Very light amber
          dark: '#1A0F00', // Very dark amber
        },
        'surface': {
          light: '#FFE4B5', // Moccasin
          dark: '#2A1A00', // Dark amber
        },
        'text': {
          light: '#4A3000', // Dark amber for text on light background
          dark: '#FFD700', // Gold for text on dark background
        },
        'text-light': {
          light: '#8B4500', // Darker amber for light text on light background
          dark: '#FFB347', // Light orange for light text on dark background
        },
        'accent': {
          light: '#FF8C00', // Dark orange
          dark: '#FFA500', // Orange
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