import tailwindForms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // LendSwift Official Brand Tokens
        primary: {
          50: '#E8F1F8',  // Soft background / focus tint
          100: '#D1E3F2',
          200: '#A4C8E5',
          300: '#76ACD8',
          400: '#4991CB',
          500: '#347BB6',
          600: '#276497',
          700: '#2C6DA4', // Secondary interactive / hover state
          800: '#1F4E79', // Official LendSwift Navy Primary
          900: '#153655',
          950: '#0C2236',
          DEFAULT: '#1F4E79',
        },
        // Regulatory & Financial Status Accents
        success: {
          50: '#EAF7EE',
          100: '#D4EFDF',
          500: '#27AE60', // Approved / Verified / CKYC Valid
          600: '#219653',
          700: '#1E824C',
          DEFAULT: '#27AE60',
        },
        danger: {
          50: '#FDEDEC',
          100: '#FADBD8',
          500: '#E74C3C', // Rejected / Invalid PAN / Risk Flag
          600: '#C0392B',
          700: '#962D22',
          DEFAULT: '#E74C3C',
        },
        warning: {
          50: '#FEF5E7',
          100: '#FDEBD0',
          500: '#F39C12', // Pending Verification / Manual Review
          600: '#D68910',
          700: '#B9770E',
          DEFAULT: '#F39C12',
        },
        // Neutral Slate Palette optimized for WCAG 2.1 AA 4.5:1 text contrast
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0', // Border subtle
          300: '#CBD5E1', // Border strong
          400: '#94A3B8', // Placeholder text
          500: '#64748B', // Secondary text (meets 3:1 on large text)
          600: '#475569', // Body text secondary (meets 4.68:1 contrast on white)
          700: '#334155', // Body text primary (meets 7.2:1 contrast on white)
          800: '#1E293B', // Headings
          900: '#0F172A', // High-contrast text (meets 16:1 contrast)
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(31, 78, 121, 0.08), 0 2px 6px -1px rgba(31, 78, 121, 0.04)',
        'card-hover': '0 10px 25px -3px rgba(31, 78, 121, 0.12), 0 4px 10px -2px rgba(31, 78, 121, 0.06)',
        'focus-ring': '0 0 0 3px rgba(44, 109, 164, 0.25)',
      },
      borderRadius: {
        fintech: '10px',
      },
    },
  },
  plugins: [
    tailwindForms({
      strategy: 'class',
    }),
  ],
};
