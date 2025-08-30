/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'karma-lime': '#A6FF00',
        'karma-success': '#00FF88',
        'karma-warning': '#FFB800',
        'karma-black': '#000000',
        'karma-white': '#FFFFFF',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-lime': 'pulse-lime 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #A6FF00' },
          '100%': { boxShadow: '0 0 20px #A6FF00, 0 0 30px #A6FF00' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-lime': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .8 },
        },
      },
      backgroundImage: {
        'karma-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #A6FF00 100%)',
        'karma-hero': 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
      }
    },
  },
  plugins: [],
}

