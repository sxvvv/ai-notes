/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0a0a0a',
        'bg-surface': '#141414',
        'bg-elevated': '#1e1e1e',
        'bg-overlay': '#282828',
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
        'accent-primary': '#3b82f6',
        'accent-hover': '#60a5fa',
        'success': '#22c55e',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#06b6d4',
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
        'border-moderate': 'rgba(255, 255, 255, 0.15)',
        'syntax-keyword': '#ff7b72',
        'syntax-string': '#a5d6ff',
        'syntax-comment': '#8b949e',
        'syntax-function': '#d2a8ff',
        'syntax-variable': '#ffa657',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
