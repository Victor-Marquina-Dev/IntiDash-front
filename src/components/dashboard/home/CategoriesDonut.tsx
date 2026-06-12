'use client';

import React from 'react';
import { useDashboardCategories, type CategoryTab } from '@/shared/hooks/use-dashboard-categories';
import { CategoriasModal, NewCategoriaModal } from './CategoryModals';
import { CardHeaderSection, type CardTab } from './CardHeaderSection';
import { Icon } from '@/components/icons';
import { formatCompactCurrency, formatIntegerCurrency } from '@/lib/format';

const DARK_TOKENS = {
  cardBg: 'linear-gradient(145deg,#1A1D21,#16181C)',
  cardBrd: 'rgba(255,255,255,0.08)',
  itemBrd: 'rgba(255,255,255,.06)',
  barBg: 'rgba(255,255,255,.05)',
  nameC: 'rgba(255,255,255,0.85)',
  pctC: 'rgba(255,255,255,0.35)',
  hiAmtC: 'rgba(255,255,255,0.85)',
  normAmtC: 'rgba(255,255,255,0.85)',
  boxShadow: '0 4px 24px rgba(0,0,0,.5)',
  trackC: 'rgba(255,255,255,.06)',
  centerBg: 'rgba(13,15,18,.95)',
  centerAmtC: 'rgba(255,255,255,0.90)',
  centerSubC: 'rgba(255,255,255,0.35)',
  arrowBg: 'rgba(255,255,255,0.06)',
  arrowBrd: 'rgba(255,255,255,0.12)',
  arrowC: 'rgba(255,255,255,0.65)',
  arrowHovBg: 'rgba(255,255,255,0.14)',
  arrowHovC: '#fff',
};

const LIGHT_TOKENS = {
  cardBg: '#FFFFFF',
  cardBrd: 'rgba(17,24,39,0.08)',
  itemBrd: 'rgba(17,24,39,0.06)',
  barBg: 'rgba(17,24,39,0.06)',
  nameC: '#111827',
  pctC: '#9CA3AF',
  hiAmtC: '#111827',
  normAmtC: '#111827',
  boxShadow: '0 1px 2px rgba(17,24,39,.04)',
  trackC: 'rgba(17,24,39,0.06)',
  centerBg: '#FFFFFF',
  centerAmtC: '#111827',
  centerSubC: '#9CA3AF',
  arrowBg: 'rgba(17,24,39,0.04)',
  arrowBrd: 'rgba(17,24,39,0.10)',
  arrowC: '#374151',
  arrowHovBg: '#111827',
  arrowHovC: '#fff',
};

type Tokens = typeof LIGHT_TOKENS;

function fmtTotal(v: number) {
  return formatCompactCurrency(v);
}

function initials(name: string) {
  return name.split(/[\s-]+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '??';
}

// ── Donut chart con etiquetas y flechas punteadas ─────────────────────────

interface DonutViewProps {
  rows: { nombre: string; value: number; pct: number; barPct: number; color: string }[];
  tokens: Tokens;
  tabs: CardTab[];
  activeTab: string;
}

// El color de cada categoría viene del hook (escala roja=egreso / verde=ingreso).
// "Otros" usa una tonalidad baja del mismo color familiar.
const OTROS_ING = '#B8CCBA';
const OTROS_EG  = '#DDBFBF';

function useCounter(target: number, duration = 900) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!target) {
      const timeoutId = window.setTimeout(() => setVal(0), 0);
      return () => window.clearTimeout(timeoutId);
    }
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return val;
}

function buildDonutRows(rows: DonutViewProps['rows'], tab: string) {
  const active = rows.filter(r => r.value > 0);
  const sorted = [...active].sort((a, b) => b.value - a.value);
  const top4   = sorted.slice(0, 4);  // conserva r.color (escala por tipo del hook)
  if (sorted.length <= 4) return top4;
  const rest     = sorted.slice(4);
  const total    = active.reduce((s, r) => s + r.value, 0);
  const otrosVal = rest.reduce((s, r) => s + r.value, 0);
  const top4Pct  = top4.reduce((s, r) => s + r.pct, 0);
  const otrosPct = Math.max(0, 100 - top4Pct);
  const otrosColor = tab === 'egreso' ? OTROS_EG : OTROS_ING;
  return [
    ...top4,
    { nombre: 'Otros', value: otrosVal, pct: otrosPct, barPct: total > 0 ? (otrosVal / total) * 100 : 0, color: otrosColor },
  ];
}

function DonutView({ rows, tokens, tabs: _tabs, activeTab }: Readonly<DonutViewProps>) {
  const CX = 210, CY = 133, R = 110, SW = 44;
  const CIRC = 2 * Math.PI * R;
  const FONT = 'var(--font-ui),system-ui,sans-serif';

  const [anim, setAnim]           = React.useState(false);
  const [selectedSeg, setSelected] = React.useState<number | null>(null);
  React.useEffect(() => {
    const id = setTimeout(() => setAnim(true), 60);
    return () => clearTimeout(id);
  }, []);

  const total     = rows.reduce((s, r) => s + r.value, 0);
  const displayRows = buildDonutRows(rows, activeTab);

  const segs = displayRows.map((row, i) => {
    const startPct = displayRows.slice(0, i).reduce((sum, item) => sum + item.pct, 0);
    const dashLen  = (row.pct / 100) * CIRC;
    const offset   = -(startPct / 100) * CIRC;
    return { ...row, i, dashLen, offset, startPct };
  });

  const selSeg     = selectedSeg !== null ? segs[selectedSeg] ?? null : null;
  const centerVal  = selSeg ? selSeg.value : total;
  const animTotal  = useCounter(anim ? centerVal : 0);

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (420 / rect.width);
    const my = (e.clientY - rect.top)  * (278 / rect.height);
    const dx = mx - CX, dy = my - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < R - SW / 2 || dist > R + SW / 2) { setSelected(null); return; }
    let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    angle = ((angle % 360) + 360) % 360;
    let acc = 0;
    for (const seg of segs) {
      if (angle >= acc * 3.6 && angle < (acc + seg.pct) * 3.6) {
        setSelected(prev => prev === seg.i ? null : seg.i);
        return;
      }
      acc += seg.pct;
    }
    setSelected(null);
  }

  const visible = displayRows;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      {/* Donut SVG */}
      <svg width="100%" viewBox="0 0 420 278" style={{ display: 'block', cursor: 'pointer' }}
        onClick={handleSvgClick}
      >
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={tokens.trackC} strokeWidth={SW}
          style={{ opacity: selectedSeg !== null ? 0.15 : 1, transition: 'opacity 0.25s ease' }}
        />
        {segs.map(seg => {
          const isSel = selectedSeg === seg.i;
          const sw      = isSel ? SW - 14 : SW;
          const opacity = selectedSeg === null ? 1 : isSel ? 1 : 0.15;
          return (
            <circle key={seg.i} cx={CX} cy={CY} r={R} fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeDasharray={`${anim ? seg.dashLen : 0} ${CIRC}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{
                opacity,
                transition: `stroke-dasharray ${0.6 + seg.i * 0.15}s cubic-bezier(.4,0,.2,1), stroke-width 0.3s ease, opacity 0.25s ease`,
              }}
            />
          );
        })}
        {/* Etiquetas % encima de todos los arcos */}
        {anim && segs.map(seg => {
          if (seg.pct < 8) return null;
          const midAngle = -Math.PI / 2 + ((seg.startPct + seg.pct / 2) / 100) * 2 * Math.PI;
          const lx = CX + R * Math.cos(midAngle);
          const ly = CY + R * Math.sin(midAngle);
          const opacity = selectedSeg === null ? 1 : selectedSeg === seg.i ? 1 : 0;
          return (
            <text key={`pct-${seg.i}`} x={lx} y={ly}
              textAnchor="middle" dominantBaseline="central"
              fontSize="11" fontWeight="800" fill="white" fontFamily={FONT}
              style={{ opacity, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}
            >
              {seg.pct}%
            </text>
          );
        })}
        <circle cx={CX} cy={CY} r={R - SW / 2 - 4} fill={tokens.centerBg} />
        <text x={CX} y={selSeg ? CY - 4 : CY + 9} textAnchor="middle" fontSize="28" fontWeight="900"
          fill={selSeg ? selSeg.color : tokens.centerAmtC} fontFamily={FONT}
          style={{ transition: 'all 0.25s ease' }}>
          {fmtTotal(animTotal)}
        </text>
        {selSeg && (
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={selSeg.color} fontFamily={FONT} style={{ opacity: 0.8 }}>
            {selSeg.nombre}
          </text>
        )}
      </svg>

      {/* Leyenda en 2 columnas, sin porcentajes */}
      {visible.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 20px',
          padding: '10px 16px 12px',
          margin: '0 16px 12px',
          borderRadius: 10,
          background: tokens.centerBg,
          border: `1px solid ${tokens.trackC}`,
        }}>
          {visible.map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%',
                background: row.color, flexShrink: 0,
              }} />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: tokens.nameC,
                fontFamily: 'var(--font-ui),system-ui,sans-serif',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {row.nombre}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export function CategoriesDonut({ darkMode, canWrite = true }: Readonly<{ darkMode?: boolean; canWrite?: boolean }>) {
  const [tab, setTab]             = React.useState<CategoryTab>('ingreso');
  const [showTable, setShowTable] = React.useState(false);
  const [showNew, setShowNew]     = React.useState(false);
  const [showDonut, setShowDonut] = React.useState(true);
  const [hovered, setHovered]     = React.useState(false);
  const isDark  = darkMode ?? false;
  const tokens  = isDark ? DARK_TOKENS : LIGHT_TOKENS;
  const { loading, refresh, gastos, ingresos, rows } = useDashboardCategories(tab, isDark);
  const emptyMessage = canWrite ? 'Sin datos. Sincroniza desde Ajustes.' : 'Sin datos para mostrar.';

  const tabs: CardTab[] = [
    { id: 'ingreso', label: 'Ingreso', badge: loading ? '...' : ingresos.length },
    { id: 'egreso',  label: 'Egreso',  badge: loading ? '...' : gastos.length },
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
      borderRadius: 22, overflow: 'hidden',
      background: tokens.cardBg,
      border: `1px solid ${hovered ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : tokens.cardBrd}`,
      boxShadow: hovered ? (isDark ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : tokens.boxShadow,
      fontFamily: 'var(--font-ui),system-ui,sans-serif',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'transform .25s, box-shadow .25s, border-color .25s',
      flexDirection: 'column',
    }}>
      <CardHeaderSection
        icon={<Icon.filter size={16} strokeWidth={2.2} />}
        label="Categorias"
        tabs={tabs}
        activeTab={tab}
        onTabChange={id => setTab(id as CategoryTab)}
        onDetail={() => setShowTable(true)}
        onChart={() => setShowDonut(d => !d)}
        chartActive={showDonut}
        chartTitle={showDonut ? 'Ver lista' : 'Ver gráfico'}
        onCreate={canWrite ? () => setShowNew(true) : undefined}
        detailTitle="Ver tabla"
        createTitle="Nueva categoría"
        darkMode={isDark}
      />

      {showDonut ? (
        <div key={tab} className="fz-tab-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <DonutView rows={rows} tokens={tokens} tabs={tabs} activeTab={tab} />
        </div>
      ) : (
        <div key={tab} className="fz-tab-content" style={{ maxHeight: 374, overflowY: 'auto', padding: '0 16px 8px' }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 12, width: `${50 + i * 10}%`, borderRadius: 6 }} />
                    <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 4, width: '100%', borderRadius: 4 }} />
                  </div>
                  <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 13, width: 48, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          )}
          {!loading && rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: tokens.pctC }}>
              {emptyMessage}
            </div>
          )}
          {!loading && rows.map((row, index) => {
            const amountColor = row.pct >= 50 ? tokens.hiAmtC : tokens.normAmtC;
            return (
              <div key={`${row.nombre}-${index}`} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 0', borderBottom: `1px solid ${tokens.itemBrd}`,
              }}>
                <div style={{
                  fontSize: 10, flexShrink: 0, width: 24, height: 24,
                  borderRadius: 8, display: 'grid', placeItems: 'center',
                  lineHeight: 1, fontWeight: 900, color: '#fff', background: row.color,
                }}>
                  {initials(row.nombre)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: tokens.nameC, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.nombre}
                  </div>
                  <div style={{ height: 4, background: tokens.barBg, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.barPct}%`, borderRadius: 10, background: row.color }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 68, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: -0.5, color: amountColor, fontVariantNumeric: 'tabular-nums' }}>
                    {formatIntegerCurrency(row.value)}
                  </div>
                  <div style={{ fontSize: 10, color: tokens.pctC, fontWeight: 700, marginTop: 2 }}>
                    {row.pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTable && <CategoriasModal onClose={() => setShowTable(false)} canWrite={canWrite} />}
      {canWrite && showNew && <NewCategoriaModal defaultTab={tab} onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); refresh(); }} />}
    </div>
  );
}
