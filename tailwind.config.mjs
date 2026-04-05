/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // A2AL design system
        background: '#0a0f0e',
        surface: '#131c19',
        border: '#243028',
        accent: '#00d4aa',
        'text-primary': '#ffffff',
        'text-secondary': '#8aa89e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      spacing: {
        section: '5rem', // 80px section gap
      },
    },
  },
  plugins: [],
}
