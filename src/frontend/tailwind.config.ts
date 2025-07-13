import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0079BF',
          secondary: '#026AA7',
          accent: '#61BD4F',
        },
        ui: {
          background: '#FFFFFF',
          surface: '#F4F5F7',
          border: '#091E4221',
          overlay: 'rgba(0,0,0,0.64)',
        },
        text: {
          primary: '#172B4D',
          secondary: '#5E6C84',
          disabled: '#A5ADBA',
          inverse: '#FFFFFF',
        },
        states: {
          hover: 'rgba(9,30,66,0.08)',
          pressed: 'rgba(9,30,66,0.16)',
          focus: '#0079BF',
          error: '#EB5A46',
          success: '#61BD4F',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      animation: {
        'slide-in': 'slideIn 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        sm: '0 1px 0 rgba(9,30,66,0.25)',
        md: '0 4px 8px -2px rgba(9,30,66,0.25)',
        lg: '0 8px 16px -4px rgba(9,30,66,0.25)',
        overlay: '0 0 0 1px rgba(9,30,66,0.13)',
      },
      borderRadius: {
        sm: '3px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;