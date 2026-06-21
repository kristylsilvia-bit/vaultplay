import type { Config } from 'tailwindcss';

/**
 * All design decisions (color, radius, type scale, shadow, motion) live here and in
 * src/app/globals.css. Components must consume these tokens — no raw hex / magic numbers.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          foreground: 'hsl(var(--success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          foreground: 'hsl(var(--warning-foreground) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'hsl(var(--error) / <alpha-value>)',
          foreground: 'hsl(var(--error-foreground) / <alpha-value>)',
        },
        brand: {
          1: 'hsl(var(--brand-1) / <alpha-value>)',
          2: 'hsl(var(--brand-2) / <alpha-value>)',
          3: 'hsl(var(--brand-3) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 6px)',
        md: 'calc(var(--radius) - 4px)',
        lg: 'calc(var(--radius) - 2px)',
        xl: 'var(--radius)',
        '2xl': 'calc(var(--radius) + 6px)',
        '3xl': 'calc(var(--radius) + 14px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      fontSize: {
        // Modular scale called out in the spec.
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.6rem' }],
        xl: ['1.25rem', { lineHeight: '1.7rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem' }],
        '3xl': ['2rem', { lineHeight: '2.3rem', letterSpacing: '-0.01em' }],
        '4xl': ['2.5rem', { lineHeight: '2.7rem', letterSpacing: '-0.02em' }],
        '5xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        '6xl': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
      },
      boxShadow: {
        xs: '0 1px 2px 0 hsl(240 30% 10% / 0.06)',
        sm: '0 1px 3px 0 hsl(240 30% 10% / 0.08), 0 1px 2px -1px hsl(240 30% 10% / 0.08)',
        md: '0 4px 12px -2px hsl(240 30% 10% / 0.10), 0 2px 6px -2px hsl(240 30% 10% / 0.06)',
        lg: '0 12px 28px -6px hsl(240 30% 10% / 0.16), 0 4px 10px -4px hsl(240 30% 10% / 0.08)',
        xl: '0 24px 56px -12px hsl(240 30% 10% / 0.24), 0 8px 20px -8px hsl(240 30% 10% / 0.12)',
        glow: '0 0 0 1px hsl(var(--primary) / 0.30), 0 12px 40px -8px hsl(var(--primary) / 0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        'spin-slow': 'spin-slow 1s linear infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
