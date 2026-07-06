import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './src/**/*.{js,html}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)',
          muted: 'var(--color-ink-muted)',
        },
        line: {
          DEFAULT: 'var(--color-line)',
          soft: 'var(--color-line-soft)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
        },
        page: {
          DEFAULT: 'var(--color-page)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          text: 'var(--color-accent-text)',
        },
      },
      boxShadow: {
        soft: '0 16px 48px var(--color-shadow)',
        card: '0 2px 16px var(--color-shadow)',
      },
      animation: {
        'fade-up': 'fadeUp 0.55s ease-out forwards',
        bounce: 'bounceY 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bounceY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
    },
  },
  plugins: [flowbite],
};
