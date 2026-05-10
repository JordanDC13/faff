/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDF6EC',
        orange: {
          DEFAULT: '#E8521A',
          light: '#F06B38',
          dark: '#C94213',
        },
        ink: '#2D2D2D',
        stone: '#C4B9A8',
        'stone-light': '#E8E0D5',
        'stone-dark': '#9E8E7A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 8px 32px rgba(45,45,45,0.12)',
        'card-hover': '0 16px 48px rgba(45,45,45,0.18)',
        swipe: '0 20px 60px rgba(45,45,45,0.2)',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(to top, rgba(45,45,45,0.95) 0%, rgba(45,45,45,0.6) 40%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
