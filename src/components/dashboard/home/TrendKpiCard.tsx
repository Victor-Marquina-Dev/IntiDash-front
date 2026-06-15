'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCurrencyParts } from '@/lib/format';
import { RADIUS } from '@/lib/radius';
import { getKpiPalette, type KpiPalette } from './kpi-palette';

const CLIP_HIDDEN = 'circle(15px at calc(100% - 28px) 28px)';
const CLIP_SHOWN = 'circle(200% at calc(100% - 28px) 28px)';
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type Badge = KpiPalette['badgePos'];
type ButtonKind = 'plus' | 'minus';
type BadgePriority = 'positive' | 'negative';

interface TrendKpiCardProps {
  label: string;
  darkMode: boolean;
  amount: number | null;
  delta?: string;
  monthlyData?: number[];
  onCardClick?: () => void;
  onCreate?: () => void;
  buttonKind: ButtonKind;
  badgePriority: BadgePriority;
  compact?: boolean;
}

const fmtBar = (v: number) => v >= 1000 ? `S/ ${(v / 1000).toFixed(1)}k` : `S/ ${Math.round(v)}`;

function getBadge(delta: string, palette: KpiPalette, priority: BadgePriority): Badge {
  if (priority === 'positive') {
    if (delta.startsWith('+')) return palette.badgePos;
    if (delta.startsWith('-')) return palette.badgeNeg;
    return palette.badgeNeu;
  }

  if (delta.startsWith('-')) return palette.badgeNeg;
  if (delta.startsWith('+')) return palette.badgePos;
  return palette.badgeNeu;
}

function ActionIcon({ kind }: Readonly<{ kind: ButtonKind }>) {
  if (kind === 'minus') {
    return (
      <svg width="10" height="3" viewBox="0 0 10 3" fill="currentColor">
        <rect x="0" y="0.75" width="10" height="1.5" />
      </svg>
    );
  }

  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <rect x="4.25" y="0" width="1.5" height="10" />
      <rect x="0" y="4.25" width="10" height="1.5" />
    </svg>
  );
}

export function TrendKpiCard({
  label,
  darkMode,
  amount,
  delta = '+0%',
  monthlyData,
  onCardClick,
  onCreate,
  buttonKind,
  badgePriority,
  compact = false,
}: Readonly<TrendKpiCardProps>) {
  const palette = getKpiPalette(darkMode);
  const [btnHovered, setBtnHovered] = React.useState(false);
  const [hoveredBar, setHoveredBar] = React.useState<number | null>(null);

  const parts = amount != null ? formatCurrencyParts(Math.abs(amount)) : null;
  const formattedAmount = parts ? `S/ ${parts.integer}${parts.decimal}` : '—';
  const badge = getBadge(delta, palette, badgePriority);
  const accent = buttonKind === 'minus' ? palette.badgeNeg : badge;
  const bars = monthlyData?.length ? monthlyData : [];
  const maxBar = bars.length ? Math.max(...bars, 1) : 1;

  const now = new Date();
  const barMonths = bars.map((_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (bars.length - 1 - i), 1);
    return MONTHS[date.getMonth()];
  });

  const renderButton = (activeOverlay: boolean) => onCreate ? (
    <button
      onClick={event => { event.stopPropagation(); onCreate(); }}
      onMouseEnter={activeOverlay ? undefined : () => setBtnHovered(true)}
      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-125 active:scale-90 ${buttonKind === 'plus' ? 'hover:rotate-90' : ''}`}
      style={activeOverlay
        ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
        : buttonKind === 'minus'
          ? { background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }
          : { background: palette.border, color: palette.label }}
    >
      <ActionIcon kind={buttonKind} />
    </button>
  ) : null;

  const renderBody = (activeOverlay: boolean) => (
    <div
      className="flex flex-col w-full h-full rounded-lg"
      style={{
        background: activeOverlay ? accent.color : palette.innerBg,
        borderRadius: RADIUS.dashboardCard,
        padding: compact ? '14px 16px 12px' : 16,
        minHeight: compact ? 190 : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-black tracking-[2px] uppercase shrink-0"
          style={{ color: activeOverlay ? 'rgba(255,255,255,0.75)' : palette.label }}
        >
          {label}
        </span>
        <div className="flex-1" />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
          style={activeOverlay
            ? { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', color: 'white' }
            : { background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}
        >
          {delta}
        </span>
        {renderButton(activeOverlay)}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div
          className="font-extrabold tabular-nums tracking-tight"
          style={{
            color: activeOverlay ? 'white' : C.amount,
            fontSize: compact ? 34 : 36,
            lineHeight: 1,
          }}
        >
          {formattedAmount}
        </div>
      </div>

      {bars.length > 0 ? (
        <div>
          <div className="flex items-stretch gap-0.5" style={{ height: compact ? 46 : 56 }}>
            {bars.map((value, index) => {
              const barHeight = `${Math.max(6, (value / maxBar) * 100)}%`;
              const isLast = index === bars.length - 1;
              const isHovered = !activeOverlay && hoveredBar === index;
              return (
                <div
                  key={`${label}-${index}`}
                  className="flex-1 flex items-end"
                  style={{ position: 'relative' }}
                  onMouseEnter={!activeOverlay ? () => setHoveredBar(index) : undefined}
                  onMouseLeave={!activeOverlay ? () => setHoveredBar(null) : undefined}
                >
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: barHeight,
                      left: '50%',
                      transform: 'translateX(-50%) translateY(-4px)',
                      background: accent.color,
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
                      {fmtBar(value)}
                    </div>
                  )}
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: barHeight,
                      background: activeOverlay ? 'white' : accent.color,
                      opacity: isLast ? 1 : isHovered ? 0.72 : 0.28,
                      transition: 'opacity 0.12s',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5 mt-1">
            {barMonths.map((month, index) => (
              <div key={`${month}-${index}`} className="flex-1 text-center" style={{
                fontSize: 8,
                fontWeight: 600,
                color: activeOverlay ? 'rgba(255,255,255,0.50)' : (!activeOverlay && hoveredBar === index ? accent.color : palette.subtitle),
                opacity: index === bars.length - 1 ? 0.9 : !activeOverlay && hoveredBar === index ? 1 : 0.5,
                transition: 'color 0.12s, opacity 0.12s',
                letterSpacing: 0.2,
              }}>
                {month}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-px" style={{ background: activeOverlay ? 'rgba(255,255,255,0.30)' : palette.lineGrad }} />
      )}
    </div>
  );

  return (
    <div
      onClick={onCardClick}
      onMouseLeave={() => { setBtnHovered(false); setHoveredBar(null); }}
      style={{ background: palette.outerBg, borderRadius: RADIUS.dashboardCard }}
      className="relative rounded-xl overflow-hidden h-full cursor-pointer"
    >
      {renderBody(false)}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          borderRadius: RADIUS.dashboardCard,
          clipPath: btnHovered ? CLIP_SHOWN : CLIP_HIDDEN,
          transition: `clip-path ${btnHovered ? '0.6s' : '0.8s'} cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {renderBody(true)}
      </div>
    </div>
  );
}
