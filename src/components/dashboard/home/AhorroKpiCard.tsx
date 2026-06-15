'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCurrencyParts } from '@/lib/format';
import { RADIUS } from '@/lib/radius';
import { getKpiPalette } from './kpi-palette';

const CLIP_HIDDEN = 'circle(0px at 50% 55%)';
const CLIP_SHOWN  = 'circle(200% at 50% 55%)';

interface AhorroKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  delta: string;
  accounts: { nombre: string; banco: string; balance: number | null }[];
  onDetail?: () => void;
  compact?: boolean;
}

export function AhorroKpiCard({ darkMode, amount, delta, accounts, onDetail, compact = false }: Readonly<AhorroKpiCardProps>) {
  const t = getKpiPalette(darkMode);
  const [btnHovered, setBtnHovered] = React.useState(false);

  const subtitle = accounts.length === 0
    ? 'Sin cuentas de ahorro'
    : `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} de ahorro`;

  const parts = amount != null ? formatCurrencyParts(Math.abs(amount)) : null;
  const fmtValue = parts ? `S/ ${parts.integer}${parts.decimal}` : '—';
  const badge = delta.startsWith('+') ? t.badgePos
              : delta.startsWith('-') ? t.badgeNeg
              : t.badgeNeu;

  const accentColor = darkMode ? '#9C805E' : '#7D6347';

  const renderBody = (a: boolean) => (
    <div className="flex flex-col w-full h-full rounded-lg"
      style={{
        background: a ? accentColor : t.innerBg,
        borderRadius: RADIUS.dashboardCard,
        padding: compact ? '14px 16px 12px' : 16,
        minHeight: compact ? 150 : undefined,
      }}>

      <div className="flex items-center gap-2">
        <span className="text-xs font-black tracking-[2px] uppercase shrink-0"
          style={{ color: a ? 'rgba(255,255,255,0.75)' : t.label }}>
          Ahorro
        </span>
        <div className="flex-1" />
        {delta && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
            style={a
              ? { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', color: 'white' }
              : { background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}
          >
            {delta}
          </span>
        )}
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center py-2"
        onMouseEnter={a ? undefined : () => setBtnHovered(true)}
      >
        <div
          className="font-extrabold tabular-nums tracking-tight"
          style={a
            ? { color: 'white', fontSize: compact ? 34 : 36, lineHeight: 1 }
            : { color: C.amount, fontSize: compact ? 34 : 36, lineHeight: 1 }}
        >
          {fmtValue}
        </div>
        <div className="mt-2 text-[11px] tracking-wide"
          style={{ color: a ? 'rgba(255,255,255,0.65)' : t.subtitle }}>
          {subtitle}
        </div>
      </div>

    </div>
  );

  return (
    <div
      onClick={onDetail}
      onMouseLeave={() => setBtnHovered(false)}
      style={{ background: t.outerBg, borderRadius: RADIUS.dashboardCard }}
      className="relative rounded-xl overflow-hidden h-full cursor-pointer"
    >
      {renderBody(false)}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          borderRadius: RADIUS.dashboardCard,
          clipPath: btnHovered ? CLIP_SHOWN : CLIP_HIDDEN,
          transition: `clip-path ${btnHovered ? '1.2s' : '1.6s'} cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {renderBody(true)}
      </div>
    </div>
  );
}
