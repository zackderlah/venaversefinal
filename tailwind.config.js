/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      transitionDuration: { DEFAULT: '90ms' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        vv: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        vv: {
          bg: 'var(--vv-bg)',
          surface: 'var(--vv-surface)',
          raised: 'var(--vv-raised)',
          fg: 'var(--vv-fg)',
          muted: 'var(--vv-muted)',
          faint: 'var(--vv-faint)',
          line: 'var(--vv-line)',
          strong: 'var(--vv-line-strong)',
        },
      },
      maxWidth: {
        // 20% wider than max-w-4xl (56rem) for md+ layout shell
        layout: '67.2rem',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#333',
            a: {
              color: '#3182ce',
              '&:hover': {
                color: '#2c5282',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
} 