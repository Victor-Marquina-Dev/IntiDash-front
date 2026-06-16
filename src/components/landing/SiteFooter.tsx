import Link from 'next/link';
import { LogoMark } from './LogoMark';
import { landingColors } from './theme';

const columns = [
  {
    title: 'Producto',
    links: [
      { label: 'Características', href: '#caracteristicas' },
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Metas', href: '#metas' },
      { label: 'Precios', href: '#precios' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Demo', href: '/demo' },
      { label: 'Soporte', href: 'mailto:hola@intidash.app' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Términos', href: '/terminos' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{ background: landingColors.ink, borderTop: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
            <LogoMark variant="light" size="md" />
            <p className="mt-4 text-[14px] leading-[1.65]" style={{ color: landingColors.dove }}>
              Finanzas personales para quienes quieren entender su dinero de verdad.
            </p>
          </div>

          {/* Columnas */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: landingColors.graphite }}>
                {col.title}
              </p>
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-[#a3a6af] hover:text-white transition-colors no-underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: landingColors.graphite }}
        >
          <p>© 2026 IntiDash. Hecho con cuidado para tus finanzas.</p>
          <p>
            Cifrado AES-256 · Datos nunca vendidos · Exporta cuando quieras
          </p>
        </div>
      </div>
    </footer>
  );
}
