/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0edff',
          100: '#e1daff',
          200: '#c3b5ff',
          300: '#a590ff',
          400: '#876bff',
          500: '#6947ff',
          600: '#5536e0',
          700: '#4127bc',
          800: '#2e1a98',
          900: '#1c0e74',
        },
        accent: {
          50:  '#fdf0ff',
          100: '#fbe1ff',
          200: '#f7c3ff',
          300: '#f3a5ff',
          400: '#ef87ff',
          500: '#eb69ff',
          600: '#c054e0',
          700: '#9440bc',
          800: '#692d98',
          900: '#3f1b74',
        },
        surface: {
          900: '#0a0812',
          800: '#110e1f',
          700: '#19152d',
          600: '#211c3c',
          500: '#2d2654',
        },
        glass: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'moonlit': "radial-gradient(ellipse at 20% 10%, #1a0533 0%, #060411 40%, #0a0219 70%, #000510 100%)",
        'card-glow': 'radial-gradient(ellipse at top, rgba(105,71,255,0.15), transparent 70%)',
        'purple-glow': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(105,71,255,0.35) 0%, transparent 100%)',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(105,71,255,0.15), 0 1px 0 0 rgba(255,255,255,0.1) inset',
        'glass-lg': '0 20px 60px 0 rgba(105,71,255,0.25), 0 1px 0 0 rgba(255,255,255,0.12) inset',
        'purple-glow': '0 0 40px rgba(105,71,255,0.4)',
        'purple-glow-sm': '0 0 20px rgba(105,71,255,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'nav': '4px 0 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(105,71,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(105,71,255,0.6)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
