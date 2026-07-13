import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Inter_Tight({
  subsets: ['latin'],
  variable: '--f-sans',
  display: 'swap',
});
const serif = Fraunces({
  subsets: ['latin'],
  variable: '--f-serif',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--f-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SOSC JUS — Estação do Advogado',
  description: 'Seus processos, prazos e clientes. Na tela grande.',
  icons: { icon: '/sosc_jus_logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#0A0B0D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
