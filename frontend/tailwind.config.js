/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transit: {
          navy: '#0f172a',      // Primary dark text & headers
          charcoal: '#1e293b',  // Secondary headers / dark surfaces
          muted: '#64748b',     // Secondary helper text
          border: '#e2e8f0',    // Muted slate border
          bg: '#f8fafc',        // Light background
          card: '#ffffff',      // Pure white cards
          teal: {
            DEFAULT: '#0f766e', // Signage teal accent (Indian Railway / Suburban signage)
            hover: '#115e59',
            light: '#f0fdfa',
            border: '#99f6e4',
          },
          railway: {
            red: '#b91c1c',     // Central Railway maroon/red
            blue: '#1d4ed8',    // Harbour Royal Blue
            yellow: '#b45309',  // Fast indicator amber
            green: '#15803d',   // Safe/Low crowd
          },
          crowd: {
            low: '#15803d',     // Green
            lowBg: '#f0fdf4',
            lowBorder: '#bbf7d0',
            med: '#d97706',     // Amber
            medBg: '#fffbeb',
            medBorder: '#fde68a',
            high: '#dc2626',    // Red / SDCL
            highBg: '#fef2f2',
            highBorder: '#fecaca',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'card': '0 1px 4px 0 rgba(15, 23, 42, 0.06), 0 2px 8px -1px rgba(15, 23, 42, 0.04)',
        'elevated': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        'transit': '6px',
        'card': '8px',
      }
    },
  },
  plugins: [],
}
