import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Florín - Dashboard de Finanzas',
  description: 'Dashboard de finanzas personales',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body style={{ fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
