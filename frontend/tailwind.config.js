/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          base:    '#f0f4f8',
          card:    '#ffffff',
          subtle:  '#f8fafc',
          border:  'rgba(0,0,0,0.06)',
        },
        risk: {
          critical: '#dc2626',
          high:     '#ea580c',
          moderate: '#d97706',
          low:      '#16a34a',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'lg':   '16px',
        'xl':   '12px',
      },
      boxShadow: {
        'card':  '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'float': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'hover': '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'blue':  '0 4px 14px rgba(37,99,235,0.3)',
        'blue-lg': '0 8px 24px rgba(37,99,235,0.25)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)',
      },
    },
  },
  plugins: [],
}
