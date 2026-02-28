import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F5EE',
        slate: '#4E5A63',
        teal: {
          50: '#EDFAF8',
          100: '#D3F3ED',
          200: '#A7E6DD',
          300: '#72D4C7',
          400: '#42BFB0',
          500: '#2CA89A',
          600: '#21877C',
          700: '#1D6C64',
          800: '#1D5651',
          900: '#1A4743'
        }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(22, 72, 72, 0.12)'
      },
      backgroundImage: {
        clinical: 'radial-gradient(circle at 20% 0%, rgba(44,168,154,0.18), transparent 45%), radial-gradient(circle at 80% 20%, rgba(78,90,99,0.14), transparent 40%)'
      }
    }
  },
  plugins: []
};

export default config;
