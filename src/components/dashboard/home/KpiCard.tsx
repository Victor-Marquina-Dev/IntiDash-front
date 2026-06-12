'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { formatCurrencyParts } from '@/lib/format';

type KpiTheme = 'green' | 'red' | 'neutral';

type ThemeTokens = {
  cardBg: string;
  cardBrdDef: string;
  cardBrdHov: string;
  cardShDef: string;
  cardShHov: string;
  accent: string;
  label: string;
  badgeBg: string;
  badgeBrd: string;
  badgeC: string;
  amtC: string;
  decC: string;
  subC: string;
  barHl: string;
  barNorm: string;
  btnBg: string;
  btnBrd: string;
  btnC: string;
  btnHovBg: string;
  btnHovC: string;
};

const THEMES: Record<KpiTheme, { dark: ThemeTokens; light: ThemeTokens }> = {
  green: {
    dark: {
      cardBg: '#7A9A7A',
      cardBrdDef: 'rgba(50,80,50,.30)',
      cardBrdHov: 'rgba(50,80,50,.55)',
      cardShDef: '0 4px 20px rgba(40,80,40,.20)',
      cardShHov: '0 12px 32px rgba(40,80,40,.35)',
      accent: '#2d5a2d',
      label: '#3a5a3a',
      badgeBg: 'rgba(255,255,255,.55)',
      badgeBrd: 'rgba(255,255,255,.80)',
      badgeC: '#2d5a2d',
      amtC: '#1a3a1a',
      decC: '#4a704a',
      subC: '#3a5a3a',
      barHl: 'rgba(30,60,30,.55)',
      barNorm: 'rgba(255,255,255,.35)',
      btnBg: 'rgba(255,255,255,.55)',
      btnBrd: 'rgba(255,255,255,.80)',
      btnC: '#2d5a2d',
      btnHovBg: '#2d5a2d',
      btnHovC: '#fff',
    },
    light: {
      cardBg: '#e8f0e8',
      cardBrdDef: '#d0e4d0',
      cardBrdHov: '#d0e4d0',
      cardShDef: '0 4px 20px rgba(40,100,40,.09)',
      cardShHov: '0 12px 32px rgba(40,100,40,.16)',
      accent: '#3a6a3a',
      label: '#4a6b4a',
      badgeBg: 'rgba(255,255,255,.6)',
      badgeBrd: 'rgba(255,255,255,.85)',
      badgeC: '#2d6a2d',
      amtC: '#1a3a1a',
      decC: '#7aA07a',
      subC: '#6a8f6a',
      barHl: 'rgba(35,80,35,.45)',
      barNorm: 'rgba(255,255,255,.4)',
      btnBg: 'rgba(255,255,255,.7)',
      btnBrd: 'rgba(255,255,255,.9)',
      btnC: '#2d5a2d',
      btnHovBg: '#2d6a2d',
      btnHovC: '#fff',
    },
  },
  red: {
    dark: {
      cardBg: '#BC9090',
      cardBrdDef: 'rgba(100,40,40,.25)',
      cardBrdHov: 'rgba(100,40,40,.50)',
      cardShDef: '0 4px 20px rgba(100,40,40,.20)',
      cardShHov: '0 12px 32px rgba(100,40,40,.35)',
      accent: '#6a2020',
      label: '#5a3030',
      badgeBg: 'rgba(255,255,255,.55)',
      badgeBrd: 'rgba(255,255,255,.80)',
      badgeC: '#6a2020',
      amtC: '#3a1a1a',
      decC: '#7a4040',
      subC: '#5a3030',
      barHl: 'rgba(100,30,30,.55)',
      barNorm: 'rgba(255,255,255,.35)',
      btnBg: 'rgba(255,255,255,.55)',
      btnBrd: 'rgba(255,255,255,.80)',
      btnC: '#6a2020',
      btnHovBg: '#6a2020',
      btnHovC: '#fff',
    },
    light: {
      cardBg: '#f5eaea',
      cardBrdDef: '#e4d0d0',
      cardBrdHov: '#e0c0c0',
      cardShDef: '0 4px 20px rgba(150,40,40,.09)',
      cardShHov: '0 12px 32px rgba(150,40,40,.16)',
      accent: '#8b2020',
      label: '#7a4040',
      badgeBg: 'rgba(255,255,255,.6)',
      badgeBrd: 'rgba(255,255,255,.85)',
      badgeC: '#8b2020',
      amtC: '#3a1a1a',
      decC: '#c07a7a',
      subC: '#8b6a6a',
      barHl: 'rgba(150,40,40,.4)',
      barNorm: 'rgba(255,255,255,.4)',
      btnBg: 'rgba(255,255,255,.7)',
      btnBrd: 'rgba(255,255,255,.9)',
      btnC: '#7a1a1a',
      btnHovBg: '#8b2020',
      btnHovC: '#fff',
    },
  },
  neutral: {
    dark: {
      cardBg: 'linear-gradient(145deg,#17181b,#101113)',
      cardBrdDef: '#26282c',
      cardBrdHov: 'rgba(255,255,255,.18)',
      cardShDef: '0 4px 20px rgba(0,0,0,.3)',
      cardShHov: '0 12px 32px rgba(0,0,0,.4)',
      accent: '#e8eaed',
      label: '#8b8f99',
      badgeBg: 'rgba(255,255,255,.08)',
      badgeBrd: 'rgba(255,255,255,.14)',
      badgeC: '#c8ccd4',
      amtC: '#e8eaed',
      decC: '#5a606c',
      subC: '#7a808c',
      barHl: 'rgba(255,255,255,.35)',
      barNorm: '#26282c',
      btnBg: 'rgba(255,255,255,.06)',
      btnBrd: 'rgba(255,255,255,.12)',
      btnC: '#c8ccd4',
      btnHovBg: 'rgba(255,255,255,.9)',
      btnHovC: '#111',
    },
    light: {
      cardBg: '#FFFFFF',
      cardBrdDef: 'rgba(17,24,39,0.08)',
      cardBrdHov: 'rgba(17,24,39,0.16)',
      cardShDef: '0 1px 2px rgba(17,24,39,.04)',
      cardShHov: '0 12px 32px rgba(17,24,39,.10)',
      accent: '#111827',
      label: '#6B7280',
      badgeBg: 'rgba(17,24,39,0.05)',
      badgeBrd: 'rgba(17,24,39,0.10)',
      badgeC: '#374151',
      amtC: '#111827',
      decC: '#9CA3AF',
      subC: '#6B7280',
      barHl: 'rgba(17,24,39,.35)',
      barNorm: 'rgba(17,24,39,.08)',
      btnBg: 'rgba(17,24,39,0.04)',
      btnBrd: 'rgba(17,24,39,0.10)',
      btnC: '#374151',
      btnHovBg: '#111827',
      btnHovC: '#fff',
    },
  },
};

interface MiniBarsProps {
  data: number[];
  labels?: string[];
  darkMode: boolean;
  theme: KpiTheme;
  invertPct?: boolean;
}

export function MiniBars({ data, labels, darkMode, theme, invertPct = false }: Readonly<MiniBarsProps>) {
  const t = THEMES[theme][darkMode ? 'dark' : 'light'];

  const nonZero = data.filter(v => v > 0);
  const barMin = nonZero.length > 0 ? Math.min(...nonZero) : 1;
  const barRange = (nonZero.length > 0 ? Math.max(...nonZero) - barMin : 0) || 1;
  const barH = data.map(v => v > 0 ? 25 + ((v - barMin) / barRange) * 65 : 5);
  const barPct = data.map((v, i) => {
    if (i === 0 || v === 0) return null;
    const prev = data[i - 1];
    if (!prev || prev === 0 || !Number.isFinite(prev)) return null;
    const pct = Math.round(((v - prev) / prev) * 100);
    return Number.isFinite(pct) ? pct : null;
  });

  const posC = darkMode ? 'rgba(255,255,255,0.82)' : '#1e5e1e';
  const negC = darkMode ? 'rgba(255,255,255,0.82)' : '#8b1a1a';

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44, marginBottom: 3 }}>
        {barH.map((height, i) => {
          const pct = barPct[i];
          const isLast = i === barH.length - 1;
          const pctColor = isLast
            ? t.accent
            : pct == null ? 'transparent'
              : invertPct
                ? (pct >= 0 ? negC : posC)
                : (pct >= 0 ? posC : negC);

          return (
            <div key={`${labels?.[i] ?? 'bar'}-${i}`} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${height}%`, background: isLast ? t.barHl : t.barNorm, position: 'relative' }}>
                {(pct != null || i === 0) && (
                  <span style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9,
                    fontWeight: 700,
                    color: pctColor,
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                    marginBottom: 3,
                    pointerEvents: 'none',
                  }}>
                    {pct != null ? `${Math.abs(pct)}%` : '-'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {data.map((_, i) => (
          <div key={`${labels?.[i] ?? 'label'}-${i}`} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: 0.2, color: i === data.length - 1 ? t.accent : t.subC }}>
              {labels?.[i] ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KpiCardProps {
  darkMode: boolean;
  theme: KpiTheme;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  amount: number | null;
  subtitle: string;
  onDetail?: () => void;
  onCreate?: () => void;
  onCardClick?: () => void;
  detailTitle?: string;
  createTitle?: string;
  createSign?: 'plus' | 'minus';
  detailIcon?: (props: { size?: number; strokeWidth?: number }) => React.ReactNode;
  footer?: React.ReactNode;
  centerAmount?: boolean;
}

export function KpiCard({
  darkMode,
  theme,
  icon,
  label,
  badge,
  amount,
  subtitle,
  onDetail,
  onCreate,
  onCardClick,
  detailTitle = 'Ver historial',
  createTitle = 'Nuevo',
  createSign = 'plus',
  detailIcon: DetailIcon = Icon.chart,
  footer,
  centerAmount = false,
}: Readonly<KpiCardProps>) {
  const [hovered, setHovered] = React.useState(false);
  const [btnHov, setBtnHov] = React.useState<'detail' | 'create' | null>(null);

  // Animación de conteo al montar o cambiar el monto
  const [displayed, setDisplayed] = React.useState(0);
  React.useEffect(() => {
    if (amount == null) return;
    const target = Math.abs(amount);
    let rafId: number;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setDisplayed(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [amount]);

  const t = THEMES[theme][darkMode ? 'dark' : 'light'];
  const amountParts = amount != null ? formatCurrencyParts(displayed) : null;
  const fmtMain = amountParts ? `S/ ${amountParts.integer}` : '-';
  const fmtDec  = amountParts ? amountParts.decimal : '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onCardClick}
      style={{
        background: t.cardBg,
        borderRadius: 16,
        padding: '14px 16px 12px',
        border: `1px solid ${hovered ? t.cardBrdHov : t.cardBrdDef}`,
        boxShadow: hovered
          ? `${t.cardShHov}, inset 0 0 0 1000px rgba(17,24,39,0.13)`
          : t.cardShDef,
        transition: 'box-shadow .25s, border-color .25s',
        cursor: onCardClick ? 'pointer' : 'default',
        fontFamily: 'var(--font-ui), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', color: t.accent }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: t.label, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {badge != null && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: t.badgeBg,
                border: `1px solid ${t.badgeBrd}`,
                color: t.badgeC,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {badge}
              </div>
            )}
            {onDetail && (
              <button
                onClick={e => { e.stopPropagation(); onDetail(); }}
                aria-label={detailTitle}
                onMouseEnter={() => setBtnHov('detail')}
                onMouseLeave={() => setBtnHov(null)}
                title={detailTitle}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${t.btnBrd}`,
                  background: btnHov === 'detail' ? t.btnHovBg : t.btnBg,
                  color: btnHov === 'detail' ? t.btnHovC : t.btnC,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all .2s',
                  flexShrink: 0,
                }}
              >
                <DetailIcon size={12} strokeWidth={1.7} />
              </button>
            )}
            {onCreate && (
              <button
                onClick={e => { e.stopPropagation(); onCreate(); }}
                aria-label={createTitle}
                onMouseEnter={() => setBtnHov('create')}
                onMouseLeave={() => setBtnHov(null)}
                title={createTitle}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${t.btnBrd}`,
                  background: btnHov === 'create' ? t.btnHovBg : t.btnBg,
                  color: btnHov === 'create' ? t.btnHovC : t.btnC,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {createSign === 'minus'
                  ? <span style={{ fontSize: 18, lineHeight: '28px', fontWeight: 300, display: 'block', marginTop: -1 }}>−</span>
                  : <Icon.plus size={12} strokeWidth={2} />
                }
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, color: t.amtC, letterSpacing: -1.2, lineHeight: 1, marginBottom: 3, fontVariantNumeric: 'tabular-nums', textAlign: centerAmount ? 'center' : 'left' }}>
          {fmtMain}<span style={{ fontSize: 17, color: t.decC, fontWeight: 600 }}>{fmtDec}</span>
        </div>

        <div style={{ fontSize: 11, color: t.subC, fontWeight: 500, textAlign: centerAmount ? 'center' : 'left' }}>
          {subtitle}
        </div>
      </div>

      {footer}
    </div>
  );
}
