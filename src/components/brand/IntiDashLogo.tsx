'use client';

import React from 'react';

/**
 * Logo SVG de IntiDash — barras ascendentes + curva.
 *
 * variant="color"  → barras en el sage green cálido de la app (#8FA88F)
 * variant="white"  → barras en blanco (para fondos oscuros)
 */
export function IntiDashIcon({
  size = 28,
  variant = 'color',
}: Readonly<{ size?: number; variant?: 'color' | 'white' }>) {
  const bars = variant === 'white' ? '#fff'         : '#8FA88F';
  const arc  = variant === 'white' ? 'rgba(255,255,255,0.60)' : '#6B8C6B';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Curva ascendente */}
      <path
        d="M5 145 C 20 55, 95 15, 168 22"
        fill="none"
        stroke={arc}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Barra corta */}
      <rect x="18" y="120" width="30" height="50" rx="15" fill={bars} />
      {/* Barra media */}
      <rect x="60" y="80"  width="30" height="90" rx="15" fill={bars} />
      {/* Barra alta */}
      <rect x="102" y="40" width="30" height="130" rx="15" fill={bars} />
    </svg>
  );
}

/** Logo completo: icono + wordmark "INTIDASH" */
export function IntiDashWordmark({
  dark = false,
  size = 28,
}: Readonly<{ dark?: boolean; size?: number }>) {
  const fs   = Math.round(size * 0.50);
  const col  = dark ? '#f0f0ee' : '#0a120a';
  const font = 'var(--font-ui), system-ui, sans-serif';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <IntiDashIcon size={size} variant={dark ? 'white' : 'color'} />
      <span style={{ display: 'inline-flex', letterSpacing: '0.18em', lineHeight: 1, userSelect: 'none' }}>
        <span style={{ fontSize: fs, fontWeight: 700, color: col, fontFamily: font }}>INTI</span>
        <span style={{ fontSize: fs, fontWeight: 300, color: col, fontFamily: font }}>DASH</span>
      </span>
    </div>
  );
}
