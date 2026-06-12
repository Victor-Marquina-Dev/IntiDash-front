'use client';

import Link from 'next/link';
import { landingColors } from './theme';

export function DemoBadge() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: landingColors.dark,
        color: '#C6D4C7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '8px 16px',
        fontSize: 13,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <span>
        <span style={{ color: landingColors.income, fontWeight: 700 }}>● Demo</span>
        {' '}Estás explorando IntiDash con datos de ejemplo
      </span>
      <Link
        href="/registro"
        style={{
          background: '#fff',
          color: landingColors.ink,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 8,
          fontSize: 12,
          textDecoration: 'none',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
      >
        Crear mi cuenta
      </Link>
    </div>
  );
}
