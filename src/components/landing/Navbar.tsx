'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogoMark } from './LogoMark';
import { CtaButton } from './CtaButton';

const links = [
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Metas', href: '#metas' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navBase = 'fixed top-0 left-0 right-0 z-50 transition-all duration-200';
  const navScrolled = 'bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[rgba(10,46,34,0.08)]';

  return (
    <>
      <nav className={`${navBase} ${scrolled ? navScrolled : 'bg-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="IntiDash - inicio">
            <LogoMark variant="dark" size="md" />
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[15px] text-[#5A6661] hover:text-[#171C1A] transition-colors duration-150 no-underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[15px] font-medium text-[#5A6661] hover:text-[#171C1A] transition-colors no-underline"
            >
              Iniciar sesión
            </Link>
            <CtaButton href="/registro" variant="primary" size="md">
              Crear cuenta
            </CtaButton>
          </div>

          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-[rgba(10,46,34,0.06)] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-5 h-0.5 bg-[#171C1A] transition-all duration-200"
              style={{ transform: menuOpen ? 'translateY(5.5px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-0.5 bg-[#171C1A] transition-all duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-[#171C1A] transition-all duration-200"
              style={{ transform: menuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </nav>

      <div
        className="fixed inset-0 z-40 bg-[#FAF8F4] flex flex-col pt-20 px-6 pb-8 md:hidden transition-all duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1 flex-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block py-4 text-[20px] font-medium text-[#171C1A] no-underline border-b border-[rgba(10,46,34,0.06)]"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 mt-8">
          <CtaButton href="/registro" variant="primary" size="lg" className="w-full justify-center">
            Crear cuenta
          </CtaButton>
          <CtaButton href="/login" variant="secondary" size="lg" className="w-full justify-center">
            Iniciar sesión
          </CtaButton>
        </div>
      </div>
    </>
  );
}
