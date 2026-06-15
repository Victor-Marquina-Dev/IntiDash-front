'use client';

import Image from 'next/image';
import React from 'react';
import { C } from '@/lib/colors';
import { formatIntegerCurrency } from '@/lib/format';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';
import { isCreditAccount } from './utils';

const BANK_LOGOS: Record<string, string> = {
  yape:       '/Yape.png',
  falabella:  '/Falabella.png',
  interbank:  '/Interbank.png',
  bbva:       '/BBVA.png',
  bcp:        '/BCP.jpg',
};

function getBankLogo(banco?: string | null): string | null {
  if (!banco) return null;
  return BANK_LOGOS[banco.trim().toLowerCase()] ?? null;
}

export function AccountItem({ cuenta, active, onSelect, darkMode = false }: Readonly<{
  cuenta: CuentaBancariaRow;
  active: boolean;
  onSelect: () => void;
  darkMode?: boolean;
}>) {
  const D = darkMode;
  const [hovered, setHovered] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const saldo = cuenta.balance ?? cuenta.balanceInicial ?? 0;
  const logoSrc = getBankLogo(cuenta.banco);
  const isCredito = isCreditAccount(cuenta);
  const credito = cuenta.credito ?? 0;
  const util = isCredito && credito > 0 ? Math.min(100, Math.round((Math.abs(saldo) / credito) * 100)) : 0;
  const utilColor = util > 80 ? C.neg : util > 50 ? C.goal : C.pos;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 20px 13px 16px',
        cursor: 'pointer', position: 'relative',
        background: active ? (D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.06)') : hovered ? (D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)') : 'transparent',
        borderLeft: `3px solid ${active ? C.primary : 'transparent'}`,
        boxShadow: hovered && !active ? '0 2px 10px rgba(17,24,39,0.07)' : 'none',
        transform: hovered && !active ? 'translateX(3px)' : 'translateX(0)',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: logoSrc && !imgError ? '#fff' : (active ? C.primary : '#3C7828'),
        color: '#fff',
        display: 'grid', placeItems: 'center',
        fontSize: 12, fontWeight: 900, letterSpacing: 0.3,
        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
        transform: active ? 'scale(1.08)' : hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: active ? '0 4px 14px rgba(143,168,143,0.50)' : hovered ? '0 3px 10px rgba(143,168,143,0.35)' : 'none',
        overflow: 'hidden',
      }}>
        {logoSrc && !imgError
          ? <Image src={logoSrc} alt={cuenta.banco ?? ''} width={44} height={44} onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : (cuenta.banco ?? cuenta.nombre ?? '?')[0].toUpperCase()
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: D ? 'rgba(255,255,255,0.88)' : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cuenta.nombre || '—'}
        </div>
        <div style={{ fontSize: 10, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cuenta.banco || '—'}
        </div>
        {isCredito && credito > 0 && (
          <div style={{ height: 5, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
            <div style={{
              height: '100%', borderRadius: 10, width: `${util}%`,
              background: util > 80
                ? `linear-gradient(90deg,${utilColor}88,${utilColor})`
                : util > 50
                  ? `linear-gradient(90deg,${C.goal}88,${C.goal})`
                  : `linear-gradient(90deg,${C.pos}88,${C.pos})`,
              transition: 'width 0.4s',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        {cuenta.tipo && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            background: isCredito ? `${C.neg}12` : (cuenta.tipo ?? '').toLowerCase().includes('ahorro') ? `${C.info}12` : (D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)'),
            color: isCredito ? C.neg : (cuenta.tipo ?? '').toLowerCase().includes('ahorro') ? C.info : (D ? 'rgba(255,255,255,0.50)' : C.textDim),
            border: `1px solid ${isCredito ? `${C.neg}20` : (cuenta.tipo ?? '').toLowerCase().includes('ahorro') ? `${C.info}20` : (D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)')}`,
          }}>
            {cuenta.tipo}
          </span>
        )}
        <div style={{ fontSize: 13, fontWeight: 900, color: isCredito ? C.neg : (D ? 'rgba(255,255,255,0.88)' : C.text), fontVariantNumeric: 'tabular-nums' }}>
          {isCredito ? `−${formatIntegerCurrency(Math.abs(saldo))}` : formatIntegerCurrency(Math.abs(saldo))}
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: D ? 'rgba(255,255,255,0.28)' : 'rgba(17,24,39,0.28)', letterSpacing: 0.2 }}>
          Mes actual
        </div>
        {isCredito && credito > 0 && (
          <div style={{ fontSize: 10, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            lím. {formatIntegerCurrency(credito)}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Panel derecho: transacciones filtradas ─────────────────────────────────

