import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/_components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      colors: {
        primary: {
          light: '#FF7247', // Ember
          dark: '#E63B00',  // Dark Ember
        },
        secondary: {
          light: '#FFA07A', // Light Salmon
          dark: '#FF4500',  // Orange Red
        },
        background: {
          light: '#FFFFFF', // White
          dark: '#000000',  // Black
        },
        surface: {
          light: '#F9FAFB', // Very Light Gray
          dark: '#121212',  // Very Dark Gray
        },
        text: {
          light: '#111827', // Very Dark Gray
          dark: '#E0E0E0',  // Light Gray
        },
        accent: {
          light: '#FF6347', // Tomato
          dark: '#FF4500',  // Orange Red
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