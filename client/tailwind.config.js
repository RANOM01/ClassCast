/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.02)',
          card: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          input: 'rgba(255, 255, 255, 0.04)',
        },
        primary: {
          DEFAULT: '#EBEBEB',
          muted: '#8E8E93',
          dim: '#636366',
        },
        accent: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)',
          hover: '#059669',
          light: '#34D399',
          dark: '#047857',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'cyber': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        morphBlob: {
          '0%, 100%': { borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%' },
          '50%': { borderRadius: '60% 40% 40% 60% / 30% 70% 30% 70%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 4s linear infinite',
        morph: 'morphBlob 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
