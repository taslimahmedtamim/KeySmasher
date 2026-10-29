/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          DEFAULT: '#111726',
          muted: '#182135',
          border: '#23304b',
        },
        brand: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#9d4edd',
          amber: '#f59e0b',
        },
        typing: {
          correct: '#10b981',
          error: '#f43f5e',
          current: '#38bdf8',
          pending: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.4)',
        'neon-purple': '0 0 20px -3px rgba(157, 78, 221, 0.4)',
        'neon-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
