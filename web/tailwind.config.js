/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'logo': ['"Maiden Crimes"', 'Bebas Neue', 'sans-serif'],
      },
      colors: {
        void: '#050505',
        surface: '#0A0A0A',
        dark: {
          900: '#080808',
          800: '#0F0F0F',
          700: '#1A1A1A',
          600: '#262626',
        },
        neon: {
          red: '#FF0033',
          pink: '#FF00FF',
          acid: '#CCFF00',
        },
        chrome: '#E8E8E8',
        red: {
          dark: '#990022',
          vibrant: '#FF0033',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'glitch-loop': 'glitch 2s infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #FF0033',
        'brutal-sm': '2px 2px 0px 0px #FF0033',
        'brutal-lg': '8px 8px 0px 0px #FF0033',
        'brutal-acid': '4px 4px 0px 0px #CCFF00',
        'neon': '0 0 20px rgba(255, 0, 51, 0.5), 0 0 40px rgba(255, 0, 51, 0.3)',
        'neon-acid': '0 0 20px rgba(204, 255, 0, 0.5), 0 0 40px rgba(204, 255, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
