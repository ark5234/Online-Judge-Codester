/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // all components/pages
    "./public/index.html",         // optional: include your index.html
  ],
  darkMode: 'class', // enables `dark:` variants with class-based toggling
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          dark: '#4f46e5',    // darker indigo for hover
        },
        background: {
          light: '#f9fafb',
          dark: '#111827',
        },
        foreground: {
          light: '#111827',
          dark: '#f9fafb',
        },
        brand: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          gradientStart: '#e0f2fe',
          gradientEnd: '#ede9fe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.06)',
        smooth: '0 2px 8px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'hero-pattern': 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
        'dark-hero': 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      },
      animation: {
        fade: 'fadeIn 0.5s ease-in-out',
        slide: 'slideUp 0.4s ease-in-out',
        bounceSlow: 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active'],
      scale: ['group-hover'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),        // for better form styling
    require('@tailwindcss/typography'),   // for prose/content styling
    require('@tailwindcss/aspect-ratio'), // for image/video aspect ratios
    require('tailwind-scrollbar'),        // optional: custom scrollbars
    require('tailwindcss-animate'),       // animation utility classes
  ],
}
