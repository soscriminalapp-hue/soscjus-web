import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade oficial SOSC JUS — dourado fosco/sólido, sem gradiente metálico.
        dourado: '#D8A631',
        'dourado-dark': '#B8891F',
        preto: '#000000',
        'preto-card': '#0E0E0E',
        'preto-elev': '#161616',
        'linha': '#242424',
        'texto-sec': '#9A9A9A',
        // Vermelho dos disclaimers 190/192/193.
        alerta: '#E5484D',
        verde: '#22C55E',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
