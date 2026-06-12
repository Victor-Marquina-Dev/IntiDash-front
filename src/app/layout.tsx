import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'IntiDash - Dashboard financiero para Notion, Excel y workspaces',
  description: 'IntiDash organiza ingresos, gastos, deudas, cuentas y metas en un dashboard financiero que puedes sincronizar con Notion, exportar a Excel y compartir por workspace.',
  openGraph: {
    title: 'IntiDash - Dashboard financiero para Notion, Excel y workspaces',
    description: 'Controla ingresos, gastos y deudas con integraciones, reportes y espacios compartidos.',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntiDash - Dashboard financiero para Notion, Excel y workspaces',
    description: 'Controla ingresos, gastos y deudas con integraciones, reportes y espacios compartidos.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body style={{ fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
