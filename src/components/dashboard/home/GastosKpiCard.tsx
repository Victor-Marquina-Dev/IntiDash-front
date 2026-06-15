'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCurrencyParts } from '@/lib/format';
import { RADIUS } from '@/lib/radius';
import { getKpiPalette } from './kpi-palette';

interface GastosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  delta?: string;
  monthlyData?: number[];
  onCardClick?: () => void;
  onCreate?: () => void;
}

const CLIP_HIDDEN = 'circle(15px at calc(100% - 28px) 28px)';
const CLIP_SHOWN  = 'circle(200% at calc(100% - 28px) 28px)';
const MONTHS      = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmtBar = (v: number) => v >= 1000 ? `S/ ${(v / 1000).toFixed(1)}k` : `S/ ${Math.round(v)}`;

export function GastosKpiCard({ darkMode, amount, delta = '+0%', monthlyData, onCardClick, onCreate }: Readonly<GastosKpiCardProps>) {
  const t = getKpiPalette(darkMode);
  const [btnHovered, setBtnHovered] = React.useState(false);
  const [hoveredBar, setHoveredBar] = React.useState<number | null>(null);

  const parts = amount != null ? formatCurrencyParts(Math.abs(amount)) : null;
  const fmtValue = parts ? `S/ ${parts.integer}${parts.decimal}` : '—';
  const badge = delta.startsWith('-') ? t.badgeNeg
              : delta.startsWith('+') ? t.badgePos
              : t.badgeNeu;
  const red = t.badgeNeg;

  const bars = monthlyData?.length ? monthlyData : [];
  const maxBar = bars.length ? Math.max(...bars, 1) : 1;

  const now = new Date();
  const barMonths = bars.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (bars.length - 1 - i), 1);
    return MONTHS[d.getMonth()];
  });

  const renderButton = (a: boolean) => onCreate ? (
    <button
      onClick={e => { e.stopPropagation(); onCreate(); }}
      onMouseEnter={a ? undefined : () => setBtnHovered(true)}
      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-125 active:scale-90"
      style={a ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
               : { background: red.bg, border: `1px solid ${red.border}`, color: red.color }}
    >
      <svg width="10" height="3" viewBox="0 0 10 3" fill="currentColor">
        <rect x="0" y="0.75" width="10" height="1.5" />
      </svg>
    </button>
  ) : null;

  const renderBody = (a: boolean) => (
    <div className="flex flex-col w-full h-full rounded-lg p-4"
      style={{ background: a ? red.color : t.innerBg, borderRadius: RADIUS.dashboardCard }}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-black tracking-[2px] uppercase shrink-0"
          style={{ color: a ? 'rgba(255,255,255,0.75)' : t.label }}>
          Gastos
        </span>
        <div className="flex-1" />
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
          style={a
            ? { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', color: 'white' }
            : { background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
          {delta}
        </span>
        {renderButton(a)}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="text-3xl font-extrabold tabular-nums tracking-tight"
          style={a ? { color: 'white' }
                   : { color: C.amount }}>
          {fmtValue}
        </div>
      </div>

      {bars.length > 0 ? (
        <div>
          {/* Barras */}
          <div className="flex items-stretch gap-0.5 h-14">
            {bars.map((v, i) => {
              const barH = `${Math.max(6, (v / maxBar) * 100)}%`;
              const isLast = i === bars.length - 1;
              const isHov = !a && hoveredBar === i;
              return (
                <div
                  key={i}
                  className="flex-1 flex items-end"
                  style={{ position: 'relative' }}
                  onMouseEnter={!a ? () => setHoveredBar(i) : undefined}
                  onMouseLeave={!a ? () => setHoveredBar(null) : undefined}
                >
                  {isHov && (
                    <div style={{
                      position: 'absolute',
                      bottom: barH,
                      left: '50%',
                      transform: 'translateX(-50%) translateY(-4px)',
                      background: red.color,
                      color: 'white',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 5px',
                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 10,
                      letterSpacing: -0.2,
                    }}>
                      {fmtBar(v)}
                    </div>
                  )}
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: barH,
                      background: a ? 'white' : red.color,
                      opacity: isLast ? 1 : isHov ? 0.72 : 0.28,
                      transition: 'opacity 0.12s',
                    }}
                  />
                </div>
              );
            })}
          </div>
          {/* Labels de mes */}
          <div className="flex gap-0.5 mt-1">
            {barMonths.map((m, i) => (
              <div key={i} className="flex-1 text-center" style={{
                fontSize: 8,
                fontWeight: 600,
                color: a ? 'rgba(255,255,255,0.50)' : (!a && hoveredBar === i ? red.color : t.subtitle),
                opacity: i === bars.length - 1 ? 0.9 : !a && hoveredBar === i ? 1 : 0.5,
                transition: 'color 0.12s, opacity 0.12s',
                letterSpacing: 0.2,
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-px" style={{ background: a ? 'rgba(255,255,255,0.30)' : t.lineGrad }} />
      )}
    </div>
  );

  return (
    <div onClick={onCardClick} onMouseLeave={() => { setBtnHovered(false); setHoveredBar(null); }}
      style={{ background: t.outerBg, borderRadius: RADIUS.dashboardCard }}
      className="relative rounded-xl overflow-hidden h-full cursor-pointer">
      {renderBody(false)}
      <div className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          borderRadius: RADIUS.dashboardCard,
          clipPath: btnHovered ? CLIP_SHOWN : CLIP_HIDDEN,
          transition: `clip-path ${btnHovered ? '0.6s' : '0.8s'} cubic-bezier(0.16, 1, 0.3, 1)`,
        }}>
        {renderBody(true)}
      </div>
    </div>
  );
}
