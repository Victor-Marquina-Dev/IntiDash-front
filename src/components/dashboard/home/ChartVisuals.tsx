'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCompactCurrency } from '@/lib/format';

function fmtK(v: number): string {
  return formatCompactCurrency(v);
}

/** Polilínea recta entre puntos ordenados por x. */
function seriesPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  return `M ${points[0][0]} ${points[0][1]}` + points.slice(1).map(p => ` L ${p[0]} ${p[1]}`).join('');
}

const M3_LIGHT = {
  incLine:   '#3C7828',
  incFill:   'rgba(60,120,40,0.18)',
  expLine:   '#B43232',
  expFill:   'rgba(180,50,50,0.14)',
  debtLine:  '#D9A86C',
  incDotStroke: '#2F641F',
  expDotStroke: '#8F2727',
  debtDotStroke: '#A87332',
  grid:      'rgba(17,24,39,.07)',
  axisLine:  'rgba(17,24,39,0.55)',
  axisText:  '#6B7280',
};
const M3_DARK = {
  incLine:   '#3C7828',
  incFill:   'rgba(60,120,40,.24)',
  expLine:   '#B43232',
  expFill:   'rgba(180,50,50,.20)',
  debtLine:  '#D9A86C',
  incDotStroke: '#8FA88F',
  expDotStroke: '#CF9C9C',
  debtDotStroke: '#F0C285',
  grid:      'rgba(255,255,255,.07)',
  axisLine:  'rgba(255,255,255,.12)',
  axisText:  'rgba(255,255,255,0.30)',
};

const FONT = 'var(--font-ui),system-ui,sans-serif';

const WE_NAMES: Record<number, string> = { 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
const WE_COLOR = '#d97706';

export function AreaLineChart({ months, income, expense, debt, width, height, darkMode = false, todayIndex, chartYear, chartMonth }: Readonly<{
  months: string[]; income: (number|null)[]; expense: (number|null)[]; debt?: (number|null)[]; width?: number; height: number; darkMode?: boolean; todayIndex?: number;
  chartYear?: number; chartMonth?: number;
}>) {
  const tk = darkMode ? M3_DARK : M3_LIGHT;
  const W = width && width > 0 ? width : 800, H = height;
  const padL = 48, padR = 20, padT = 50, padB = 36;
  const plotH = H - padT - padB;
  const base  = H - padB;

  const [on, setOn] = React.useState(false);
  const [hov, setHov] = React.useState<{ type: 'inc' | 'exp' | 'debt'; i: number; cx: number; cy: number; v: number } | null>(null);
  const [hovWe, setHovWe] = React.useState<number | null>(null);
  const uid = React.useId().replace(/:/g, '');
  React.useEffect(() => { const id = setTimeout(() => setOn(true), 80); return () => clearTimeout(id); }, []);

  const weekendMap = React.useMemo<Map<number, string>>(() => {
    if (chartYear === undefined || chartMonth === undefined || months.length <= 15) return new Map();
    const map = new Map<number, string>();
    months.forEach((_, i) => {
      const dow = new Date(chartYear, chartMonth, i + 1).getDay();
      if (dow in WE_NAMES) map.set(i, WE_NAMES[dow]);
    });
    return map;
  }, [chartYear, chartMonth, months]);

  const debtArr = debt ?? [];
  const all = [...income, ...expense, ...debtArr].filter((v): v is number => v != null && v > 0);
  if (!all.length) return null;
  const dataMax  = Math.ceil(Math.max(...all) / 1000) * 1000 || 1;
  const step     = Math.max(1000, Math.round(dataMax / 4 / 1000) * 1000);
  const max      = dataMax + Math.round(step / 2 / 1000) * 1000;
  const tickVals = [1, 2, 3, 4].map(i => i * step);
  const xs = months.map((_, i) => padL + (i / Math.max(months.length - 1, 1)) * (W - padL - padR));
  const y  = (v: number) => padT + (1 - v / max) * plotH;
  const cutoff = todayIndex !== undefined ? todayIndex : months.length - 1;
  // Línea y área solo hasta el cutoff (hoy); puntos futuros se renderizan sin línea
  const ptIncLine = income.map( (v, i) => (v == null || i > cutoff) ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const ptExpLine = expense.map((v, i) => (v == null || i > cutoff) ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const ptDebtLine = debtArr.map((v, i) => (v == null || i > cutoff) ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const incPath = seriesPath(ptIncLine);
  const expPath = seriesPath(ptExpLine);
  const debtPath = seriesPath(ptDebtLine);
  const incArea = incPath && ptIncLine.length > 1 ? `${incPath} L ${ptIncLine[ptIncLine.length-1][0]} ${base} L ${ptIncLine[0][0]} ${base} Z` : '';
  const expArea = expPath && ptExpLine.length > 1 ? `${expPath} L ${ptExpLine[ptExpLine.length-1][0]} ${base} L ${ptExpLine[0][0]} ${base} Z` : '';
  const debtArea = debtPath && ptDebtLine.length > 1 ? `${debtPath} L ${ptDebtLine[ptDebtLine.length-1][0]} ${base} L ${ptDebtLine[0][0]} ${base} Z` : '';

  const setHoverFromPoint = (i: number) => {
    const candidates = [
      { type: 'inc' as const, v: income[i] },
      { type: 'exp' as const, v: expense[i] },
      { type: 'debt' as const, v: debtArr[i] },
    ].filter((item): item is { type: 'inc' | 'exp' | 'debt'; v: number } => item.v != null && item.v > 0);
    if (!candidates.length) { setHov(null); return; }
    const top = candidates.reduce((best, item) => item.v > best.v ? item : best);
    setHov({ type: top.type, i, cx: xs[i], cy: y(top.v), v: top.v });
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * W;
    const my = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * H;
    if (mx < padL || mx > W - padR || my < padT || my > base) {
      setHov(null);
      return;
    }
    const nearest = xs.reduce((best, x, i) => {
      const distance = Math.abs(x - mx);
      return distance < best.distance ? { i, distance } : best;
    }, { i: 0, distance: Number.POSITIVE_INFINITY });
    setHoverFromPoint(nearest.i);
  };

  // Leyenda dinámica según series con datos
  const legendEntries = [
    income.some(v => v != null)  ? { label: 'Ingresos', color: tk.incLine }  : null,
    expense.some(v => v != null) ? { label: 'Gastos',   color: tk.expLine }  : null,
    debtArr.some(v => v != null) ? { label: 'Deudas',   color: tk.debtLine } : null,
  ].filter((e): e is { label: string; color: string } => e !== null);

  const svgEl = (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHov(null)}>
      <defs>
        <style>{`
          @keyframes fzGuideIn {
            from { transform: scaleY(0); opacity: 0; }
            to { transform: scaleY(1); opacity: 0.5; }
          }
          @keyframes fzTooltipIn {
            from { transform: translateY(3px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <linearGradient id={`ig-${uid}`} x1="0" y1={padT} x2="0" y2={base} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={tk.incLine} stopOpacity="0.32" />
          <stop offset="100%" stopColor={tk.incLine} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id={`eg-${uid}`} x1="0" y1={padT} x2="0" y2={base} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={tk.expLine} stopOpacity="0.24" />
          <stop offset="100%" stopColor={tk.expLine} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id={`dg-${uid}`} x1="0" y1={padT} x2="0" y2={base} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={tk.debtLine} stopOpacity="0.24" />
          <stop offset="100%" stopColor={tk.debtLine} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Leyenda superior-izquierda (solo series con datos) */}
      {legendEntries.map((e, k) => {
        const x = padL + legendEntries.slice(0, k).reduce((s, p) => s + p.label.length * 6.5 + 28, 0);
        return (
          <g key={e.label}>
            <circle cx={x} cy={18} r="5" fill={e.color} />
            <text x={x + 10} y={23} fontSize="11" fontWeight="700" fill={e.color} fontFamily={FONT}>{e.label}</text>
          </g>
        );
      })}

      {/* Grid + etiquetas eje Y */}
      {tickVals.map((val, i) => {
        const yy = y(val);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 5" />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>
              {formatCompactCurrency(val, 0)}
            </text>
          </g>
        );
      })}

      {/* Eje Y (línea vertical) */}
      <line x1={padL} x2={padL} y1={padT} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Eje X (línea horizontal) */}
      <line x1={padL} x2={W - padR} y1={base} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Etiquetas eje X (meses / días) */}
      {months.map((m, i) => {
        if (months.length > 15) {
          const d    = parseInt(m);
          const major = d === 1 || d % 5 === 0;
          return (
            <text key={`xl${i}`} x={xs[i]} y={H - 10}
              textAnchor="middle"
              fontSize={major ? '9' : '7'}
              fontWeight={major ? '500' : '400'}
              opacity={major ? 1 : 0.38}
              fill={tk.axisText} fontFamily={FONT}>
              {m}
            </text>
          );
        }
        return (
          <text key={`xl${i}`} x={xs[i]} y={H - 10} textAnchor="middle" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>{m}</text>
        );
      })}

      {/* Tick marks eje X */}
      {xs.map((x, i) => (
        <line key={`tx${i}`} x1={x} x2={x} y1={base} y2={base + 4} stroke={tk.axisLine} strokeWidth="1.5" />
      ))}

      {/* Relleno degradado */}
      {incArea && <path d={incArea} fill={`url(#ig-${uid})`} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.35s' }} />}
      {expArea && <path d={expArea} fill={`url(#eg-${uid})`} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.5s' }} />}
      {debtArea && <path d={debtArea} fill={`url(#dg-${uid})`} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.5s' }} />}

      {/* Líneas */}
      {incPath && <path d={incPath} fill="none" stroke={tk.incLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }} />}
      {expPath && <path d={expPath} fill="none" stroke={tk.expLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) 0.15s' }} />}
      {debtPath && <path d={debtPath} fill="none" stroke={tk.debtLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) 0.15s' }} />}

      {/* Puntos — ingresos */}
      {income.map((v, i) => {
        if (v == null) return null;
        const cx      = xs[i], cy = y(v);
        const ly      = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay   = `${0.7 + i * 0.1}s`;
        const isZero  = v === 0;
        const isFuture = todayIndex !== undefined && i > todayIndex;
        const isHov   = hov?.i === i;
        const opacity = on ? (isFuture ? 0.42 : isZero ? 0.28 : 1) : 0;
        return (
          <g key={`i${i}`}
            style={{ opacity, transition: `opacity 0.3s ease ${delay}` }}
            onMouseEnter={() => !isZero && setHov({ type: 'inc', i, cx, cy, v })}
          >
            <circle cx={cx} cy={cy} r={isFuture ? '2.5' : isZero ? '1.8' : '3'}
              fill={tk.incLine} stroke={tk.incDotStroke} strokeWidth="1.5"
              style={{
                transform: on ? (isHov ? 'scale(1.65)' : 'scale(1)') : 'scale(0)',
                transformBox: 'fill-box', transformOrigin: 'center',
                transition: on ? 'transform 0.18s cubic-bezier(.4,0,.2,1)' : `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}`,
                cursor: isZero ? 'default' : 'pointer',
              }} />
            {!isZero && !isHov && !isFuture && (
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.incLine} fontFamily={FONT}>{fmtK(v)}</text>
            )}
          </g>
        );
      })}

      {/* Puntos — gastos */}
      {expense.map((v, i) => {
        if (v == null) return null;
        const cx      = xs[i], cy = y(v);
        const ly      = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay   = `${0.75 + i * 0.1}s`;
        const isZero  = v === 0;
        const isFuture = todayIndex !== undefined && i > todayIndex;
        const isHov   = hov?.i === i;
        const opacity = on ? (isFuture ? 0.42 : isZero ? 0.28 : 1) : 0;
        return (
          <g key={`e${i}`}
            style={{ opacity, transition: `opacity 0.3s ease ${delay}` }}
            onMouseEnter={() => !isZero && setHov({ type: 'exp', i, cx, cy, v })}
          >
            <circle cx={cx} cy={cy} r={isFuture ? '2.5' : isZero ? '1.8' : '3'}
              fill={tk.expLine} stroke={tk.expDotStroke} strokeWidth="1.5"
              style={{
                transform: on ? (isHov ? 'scale(1.65)' : 'scale(1)') : 'scale(0)',
                transformBox: 'fill-box', transformOrigin: 'center',
                transition: on ? 'transform 0.18s cubic-bezier(.4,0,.2,1)' : `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}`,
                cursor: isZero ? 'default' : 'pointer',
              }} />
            {!isZero && !isHov && !isFuture && (
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.expLine} fontFamily={FONT}>{fmtK(v)}</text>
            )}
          </g>
        );
      })}

      {/* Puntos — deudas */}
      {debtArr.map((v, i) => {
        if (v == null) return null;
        const cx      = xs[i], cy = y(v);
        const ly      = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay   = `${0.75 + i * 0.1}s`;
        const isZero  = v === 0;
        const isFuture = todayIndex !== undefined && i > todayIndex;
        const isHov   = hov?.i === i;
        const opacity = on ? (isFuture ? 0.42 : isZero ? 0.28 : 1) : 0;
        return (
          <g key={`d${i}`}
            style={{ opacity, transition: `opacity 0.3s ease ${delay}` }}
            onMouseEnter={() => !isZero && setHov({ type: 'debt', i, cx, cy, v })}
          >
            <circle cx={cx} cy={cy} r={isFuture ? '2.5' : isZero ? '1.8' : '3'}
              fill={tk.debtLine} stroke={tk.debtDotStroke} strokeWidth="1.5"
              style={{
                transform: on ? (isHov ? 'scale(1.65)' : 'scale(1)') : 'scale(0)',
                transformBox: 'fill-box', transformOrigin: 'center',
                transition: on ? 'transform 0.18s cubic-bezier(.4,0,.2,1)' : `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}`,
                cursor: isZero ? 'default' : 'pointer',
              }} />
            {!isZero && !isHov && !isFuture && (
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.debtLine} fontFamily={FONT}>{fmtK(v)}</text>
            )}
          </g>
        );
      })}

      {/* Indicadores fin de semana */}
      {on && Array.from(weekendMap.entries()).map(([i, name]) => {
        const cx = xs[i];
        const cy = H - 24;
        const isHov = hovWe === i;
        const tw = name.length * 5.6 + 14;
        const tx = Math.max(padL + tw / 2 + 2, Math.min(W - padR - tw / 2 - 2, cx));
        return (
          <g key={`we${i}`}
            onMouseEnter={() => setHovWe(i)}
            onMouseLeave={() => setHovWe(null)}
            style={{ cursor: 'default' }}
          >
            <circle cx={cx} cy={cy} r="3.5" fill={WE_COLOR} opacity={0.75}
              style={{
                transform: isHov ? 'scale(1.6)' : 'scale(1)',
                transformBox: 'fill-box', transformOrigin: 'center',
                transition: 'transform 0.15s cubic-bezier(.4,0,.2,1)',
              }}
            />
            {isHov && (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={tx - tw / 2} y={H - 44} width={tw} height={15} rx="5" fill={WE_COLOR} />
                <text x={tx} y={H - 33} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily={FONT}>{name}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Indicador "HOY" */}
      {todayIndex !== undefined && todayIndex >= 0 && todayIndex < xs.length && on && (() => {
        const tx = xs[todayIndex];
        const bw = 28;
        const bx = Math.max(padL + bw / 2 + 2, Math.min(W - padR - bw / 2 - 2, tx));
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={tx} x2={tx} y1={padT + 2} y2={base}
              stroke={WE_COLOR} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
            <rect x={bx - bw / 2} y={padT - 14} width={bw} height={15} rx="5" fill={WE_COLOR} />
            <text x={bx} y={padT - 4} textAnchor="middle" fontSize="8" fontWeight="800"
              fill="white" fontFamily={FONT}>HOY</text>
          </g>
        );
      })()}

      {/* Hit-areas verticales: el tooltip aparece al pasar por la columna del punto */}
      {on && months.map((_, i) => {
        const slotW = (W - padL - padR) / Math.max(months.length - 1, 1);
        const x0 = i === 0 ? padL : xs[i] - slotW / 2;
        const x1 = i === months.length - 1 ? W - padR : xs[i] + slotW / 2;
        return (
          <rect key={`hit${i}`} x={x0} y={padT} width={Math.max(x1 - x0, 0)} height={base - padT}
            fill="transparent"
            onMouseEnter={() => setHoverFromPoint(i)}
          />
        );
      })}

      {/* Tooltip al hover — muestra las series con valor del mismo punto */}
      {hov && on && (() => {
        const rows = ([
          { v: income[hov.i],  color: tk.incLine },
          { v: expense[hov.i], color: tk.expLine },
          { v: debtArr[hov.i], color: tk.debtLine },
        ] as { v: number | null | undefined; color: string }[])
          .filter((r): r is { v: number; color: string } => r.v != null && r.v > 0)
          .map(r => ({ ...r, lbl: fmtK(r.v) }));
        if (!rows.length) return null;

        const tw   = Math.max(...rows.map(r => r.lbl.length * 7 + 22), 48);
        const th   = rows.length === 1 ? 22 : rows.length * 18 + 4;
        const tx   = Math.max(padL + tw / 2 + 4, Math.min(W - padR - tw / 2 - 4, hov.cx));
        const above = hov.cy - th - 14 >= padT + 6;
        const ty    = above ? hov.cy - th / 2 - 14 : hov.cy + th / 2 + 14;
        const dotX  = tx - tw / 2 + 10;
        const lblX  = tx - tw / 2 + 18;
        const guideColor = hov.type === 'inc' ? tk.incLine : hov.type === 'exp' ? tk.expLine : tk.debtLine;

        return (
          <g key={`${hov.type}-${hov.i}`} style={{ pointerEvents: 'none' }}>
            <line x1={hov.cx} x2={hov.cx} y1={padT} y2={base}
              stroke={guideColor} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5"
              style={{
                transform: 'scaleY(1)',
                transformBox: 'fill-box',
                transformOrigin: 'bottom',
                animation: 'fzGuideIn 0.18s ease-out both',
              }}
            />
            <rect x={tx - tw / 2} y={ty - th / 2} width={tw} height={th} rx="7"
              fill="rgba(17,24,39,0.92)"
              style={{ animation: 'fzTooltipIn 0.16s ease-out both' }}
            />
            {rows.map((r, k) => {
              const ly = ty - ((rows.length - 1) * 18) / 2 + k * 18;
              return (
                <g key={k}>
                  <circle cx={dotX} cy={ly} r="3" fill={r.color} />
                  <text x={lblX} y={ly + 4} textAnchor="start" fontSize="10" fontWeight="700"
                    fill={r.color} fontFamily={FONT}>{r.lbl}</text>
                </g>
              );
            })}
          </g>
        );
      })()}
    </svg>
  );

  return svgEl;
}

// ── Modelo 2: Barras Apiladas ────────────────────────────────────────────
export function StackedBarsChart({ months, income, expense, height, darkMode = false }: Readonly<{
  months: string[]; income: number[]; expense: number[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode
    ? { incFill: 'rgba(45,138,45,.65)',  expFill: 'rgba(224,85,85,.65)',   grid: 'rgba(255,255,255,.06)', axis: '#9aba9a', lastAxis: '#2d8a2d' }
    : { incFill: 'rgba(45,138,45,.65)',  expFill: 'rgba(224,85,85,.65)',   grid: 'rgba(255,255,255,.55)', axis: '#9aba9a', lastAxis: '#2d8a2d' };
  const W = 600, H = height;
  const padL = 10, padR = 10, padT = 24, padB = 26;
  const availH = H - padT - padB;
  const baseline = H - padB;
  const totals = months.map((_, i) => (income[i] ?? 0) + (expense[i] ?? 0));
  const max = Math.max(...totals, 1);
  const slotW = (W - padL - padR) / Math.max(months.length, 1);
  const barW = Math.min(36, slotW * 0.55);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs><style>{`
        @keyframes fzBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        .fz-bar{transform-box:fill-box;transform-origin:bottom;animation:fzBar .55s cubic-bezier(.4,0,.2,1) forwards}
      `}</style></defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => {
        const yy = padT + (1 - f) * availH;
        return <line key={i} x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 4" />;
      })}
      {months.map((m, i) => {
        const cx = padL + i * slotW + slotW / 2;
        const inc = income[i] ?? 0, exp = expense[i] ?? 0;
        const incH = Math.max((inc / max) * availH, inc > 0 ? 3 : 0);
        const expH = Math.max((exp / max) * availH, exp > 0 ? 3 : 0);
        const incY = baseline - incH;
        const expY = incY - expH;
        const isLast = i === months.length - 1;
        return (
          <g key={m}>
            {incH > 0 && <rect className="fz-bar" x={cx - barW / 2} y={incY} width={barW} height={incH} rx="6" ry="6" fill={tk.incFill} style={{ animationDelay: `${i * 0.07}s` }} />}
            {expH > 0 && <rect className="fz-bar" x={cx - barW / 2} y={expY} width={barW} height={expH} rx="6" ry="6" fill={tk.expFill} style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />}
            {isLast && (inc + exp) > 0 && (
              <text x={cx} y={(expH > 0 ? expY : incY) - 5} textAnchor="middle" fontSize="9" fontWeight="800" fill={tk.lastAxis} fontFamily="var(--font-ui),system-ui,sans-serif">{fmtK(inc + exp)}</text>
            )}
            <text x={cx} y={H - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill={isLast ? tk.lastAxis : tk.axis} fontFamily="var(--font-ui),system-ui,sans-serif">{m}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Modelo 5: Barras Pill (colores sólidos) ──────────────────────────────
export function PillBarsChart({ months, income, expense, height, darkMode = false }: Readonly<{
  months: string[]; income: number[]; expense: number[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode
    ? { incFill: '#4f46e5', expFill: '#f43f5e', grid: 'rgba(99,102,241,.15)', axis: '#6366f1', lastAxis: '#4f46e5' }
    : { incFill: '#4f46e5', expFill: '#f43f5e', grid: 'rgba(99,102,241,.15)', axis: '#6366f1', lastAxis: '#4f46e5' };
  const W = 600, H = height;
  const padL = 10, padR = 10, padT = 24, padB = 26;
  const availH = H - padT - padB;
  const baseline = H - padB;
  const max = Math.max(...income, ...expense, 1);
  const slotW = (W - padL - padR) / Math.max(months.length, 1);
  const barW = Math.min(14, slotW * 0.26);
  const gap = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs><style>{`
        @keyframes fzBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        .fz-bar{transform-box:fill-box;transform-origin:bottom;animation:fzBar .55s cubic-bezier(.4,0,.2,1) forwards}
      `}</style></defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => {
        const yy = padT + (1 - f) * availH;
        return <line key={i} x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 4" />;
      })}
      {months.map((m, i) => {
        const cx = padL + i * slotW + slotW / 2;
        const inc = income[i] ?? 0, exp = expense[i] ?? 0;
        const incH = Math.max((inc / max) * availH, inc > 0 ? 4 : 0);
        const expH = Math.max((exp / max) * availH, exp > 0 ? 4 : 0);
        const rx = barW / 2;
        const isLast = i === months.length - 1;
        return (
          <g key={m}>
            {incH > 0 && <rect className="fz-bar" x={cx - gap / 2 - barW} y={baseline - incH} width={barW} height={incH} rx={rx} ry={rx} fill={tk.incFill} style={{ animationDelay: `${i * 0.07}s` }} />}
            {expH > 0 && <rect className="fz-bar" x={cx + gap / 2}         y={baseline - expH} width={barW} height={expH} rx={rx} ry={rx} fill={tk.expFill} style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />}
            <text x={cx} y={H - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill={isLast ? tk.lastAxis : tk.axis} fontFamily="var(--font-ui),system-ui,sans-serif">{m}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Modelo 6: Barras Minimalistas ────────────────────────────────────────
export function MinimalBarsChart({ months, income, height, darkMode = false }: Readonly<{
  months: string[]; income: number[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode
    ? { barFull: '#d97706', barMid: 'rgba(217,119,6,.42)',  barLow: 'rgba(217,119,6,.26)',  line: 'rgba(217,119,6,.50)',  dot: '#d97706', ring: 'rgba(217,119,6,.20)',  grid: 'rgba(255,255,255,.07)', axis: '#b08040', lastAxis: '#d97706' }
    : { barFull: '#d97706', barMid: 'rgba(217,119,6,.42)',  barLow: 'rgba(217,119,6,.26)',  line: 'rgba(217,119,6,.50)',  dot: '#d97706', ring: 'rgba(217,119,6,.20)',  grid: 'rgba(0,0,0,.07)',       axis: '#b08040', lastAxis: '#d97706' };
  const W = 600, H = height;
  const padL = 10, padR = 10, padT = 28, padB = 26;
  const availH = H - padT - padB;
  const baseline = H - padB;
  const max = Math.max(...income, 1);
  const slotW = (W - padL - padR) / Math.max(months.length, 1);
  const barW = Math.min(34, slotW * 0.55);
  const topPts: [number, number][] = income.map((v, i) => {
    const cx = padL + i * slotW + slotW / 2;
    return [cx, baseline - Math.max((v / max) * availH, v > 0 ? 3 : 0)];
  });
  const linePath = topPts.length < 2 ? '' :
    `M ${topPts[0][0]} ${topPts[0][1]} ` + topPts.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ');
  const lastI = income.length - 1;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs><style>{`
        @keyframes fzBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        .fz-bar{transform-box:fill-box;transform-origin:bottom;animation:fzBar .55s cubic-bezier(.4,0,.2,1) forwards}
      `}</style></defs>
      {[0.33, 0.66, 1].map((f, i) => {
        const yy = padT + (1 - f) * availH;
        return <line key={i} x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" />;
      })}
      {income.map((v, i) => {
        const cx = padL + i * slotW + slotW / 2;
        const h = Math.max((v / max) * availH, v > 0 ? 3 : 0);
        const barY = baseline - h;
        const isLast = i === lastI;
        const ratio = h / availH;
        const fill = isLast ? tk.barFull : (ratio > 0.4 ? tk.barMid : tk.barLow);
        return (
          <g key={i}>
            <rect className="fz-bar" x={cx - barW / 2} y={barY} width={barW} height={h} rx="4" ry="4" fill={fill} style={{ animationDelay: `${i * 0.07}s` }} />
            {isLast && v > 0 && <text x={cx} y={barY - 5} textAnchor="middle" fontSize="9" fontWeight="800" fill={tk.lastAxis} fontFamily="var(--font-ui),system-ui,sans-serif">{fmtK(v)}</text>}
            <text x={cx} y={H - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill={isLast ? tk.lastAxis : tk.axis} fontFamily="var(--font-ui),system-ui,sans-serif">{months[i]}</text>
          </g>
        );
      })}
      {linePath && <path d={linePath} fill="none" stroke={tk.line} strokeWidth="1.5" strokeDasharray="4 2" />}
      {topPts[lastI] && (
        <>
          <circle cx={topPts[lastI][0]} cy={topPts[lastI][1]} r="6" fill={tk.ring} />
          <circle cx={topPts[lastI][0]} cy={topPts[lastI][1]} r="3.5" fill={tk.dot} />
        </>
      )}
    </svg>
  );
}

// ── Gráfico vacío: solo ejes X/Y sin datos ───────────────────────────────
export function EmptyLineChart({ months, width, height, darkMode = false, legendItems }: Readonly<{
  months: string[]; width?: number; height: number; darkMode?: boolean; legendItems?: { label: string; color: string }[];
}>) {
  const tk = darkMode ? M3_DARK : M3_LIGHT;
  const W = width && width > 0 ? width : 800, H = height;
  const padL = 48, padR = 20, padT = 50, padB = 36;
  const plotH = H - padT - padB;
  const base  = H - padB;
  const ticks = 4;
  const xs = months.length > 1
    ? months.map((_, i) => padL + (i / (months.length - 1)) * (W - padL - padR))
    : [padL, W - padR];
  const legend = legendItems ?? [
    { label: 'Ingresos', color: tk.incLine },
    { label: 'Gastos',   color: tk.expLine },
  ];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {/* Leyenda */}
      {legend.map((e, k) => {
        const x = padL + legend.slice(0, k).reduce((s, p) => s + p.label.length * 6.5 + 28, 0);
        return (
          <g key={e.label}>
            <circle cx={x} cy={18} r="5" fill={e.color} opacity={0.5} />
            <text x={x + 10} y={23} fontSize="11" fontWeight="700" fill={e.color} opacity={0.5} fontFamily={FONT}>{e.label}</text>
          </g>
        );
      })}

      {/* Grid horizontal */}
      {Array.from({ length: ticks }, (_, i) => {
        const yy = padT + ((i + 1) / (ticks + 1)) * plotH;
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 5" />
          </g>
        );
      })}

      {/* Eje Y */}
      <line x1={padL} x2={padL} y1={padT} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Eje X */}
      <line x1={padL} x2={W - padR} y1={base} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Etiquetas X */}
      {months.map((m, i) => (
        <text key={i} x={xs[i]} y={H - 10} textAnchor="middle" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>{m}</text>
      ))}

      {/* Ticks X */}
      {xs.map((x, i) => (
        <line key={i} x1={x} x2={x} y1={base} y2={base + 4} stroke={tk.axisLine} strokeWidth="1.5" />
      ))}

      {/* Mensaje central */}
      <text x={W / 2} y={padT + plotH / 2 - 8} textAnchor="middle" fontSize="13" fontWeight="600"
        fill={darkMode ? 'rgba(255,255,255,0.28)' : 'rgba(17,24,39,0.28)'} fontFamily={FONT}>
        Sin datos para este período
      </text>
      <text x={W / 2} y={padT + plotH / 2 + 14} textAnchor="middle" fontSize="10" fontWeight="500"
        fill={darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.18)'} fontFamily={FONT}>
        Sincroniza Notion para ver el historial
      </text>
    </svg>
  );
}

const M3_NET_LIGHT = {
  posLine: '#3C7828',
  negLine: '#B43232',
  posDotStroke: '#2F641F',
  negDotStroke: '#8F2727',
  grid: 'rgba(17,24,39,.07)',
  zeroLine: 'rgba(17,24,39,.40)',
  axisLine: 'rgba(17,24,39,0.55)',
  axisText: '#6B7280',
};
const M3_NET_DARK = {
  posLine: '#3C7828',
  negLine: '#B43232',
  posDotStroke: '#8FA88F',
  negDotStroke: '#CF9C9C',
  grid: 'rgba(255,255,255,.07)',
  zeroLine: 'rgba(255,255,255,.20)',
  axisLine: 'rgba(255,255,255,.12)',
  axisText: 'rgba(255,255,255,0.30)',
};

export function NetLineChart({ months, net, width, height, darkMode = false, todayIndex }: Readonly<{
  months: string[]; net: (number|null)[]; width?: number; height: number; darkMode?: boolean; todayIndex?: number;
}>) {
  const tk = darkMode ? M3_NET_DARK : M3_NET_LIGHT;
  const W = width && width > 0 ? width : 800, H = height;
  const padL = 48, padR = 20, padT = 50, padB = 36;
  const plotH = H - padT - padB;
  const base = H - padB;
  const [on, setOn] = React.useState(false);
  const [hov, setHov] = React.useState<{ i: number; cx: number; cy: number; v: number } | null>(null);

  React.useEffect(() => { const id = setTimeout(() => setOn(true), 80); return () => clearTimeout(id); }, []);

  const valid = net.filter((v): v is number => v != null);
  if (!valid.length) return null;

  const rawMax = Math.max(...valid, 0);
  const rawMin = Math.min(...valid, 0);
  const absMax = Math.max(Math.abs(rawMax), Math.abs(rawMin), 1);
  const roundedAbs = Math.ceil(absMax / 1000) * 1000 || 1;
  const max = roundedAbs;
  const min = -roundedAbs;
  const range = max - min;
  const xs = months.map((_, i) => padL + (i / Math.max(months.length - 1, 1)) * (W - padL - padR));
  const y = (v: number) => padT + ((max - v) / range) * plotH;
  const cutoff = todayIndex !== undefined ? todayIndex : months.length - 1;
  const pts = net
    .map((v, i) => (v == null || i > cutoff) ? null : [xs[i], y(v), v] as [number, number, number])
    .filter((p): p is [number, number, number] => p !== null);
  const linePath = seriesPath(pts.map(p => [p[0], p[1]] as [number, number]));
  const currentNet = pts.length ? pts[pts.length - 1][2] : 0;
  const lineColor = currentNet >= 0 ? tk.posLine : tk.negLine;
  const tickVals = [max, max / 2, 0, min / 2, min].filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }} onMouseLeave={() => setHov(null)}>
      <g>
        <circle cx={padL} cy={18} r="5" fill={tk.posLine} />
        <text x={padL + 10} y={23} fontSize="11" fontWeight="700" fill={tk.posLine} fontFamily={FONT}>Neto positivo</text>
        <circle cx={padL + 112} cy={18} r="5" fill={tk.negLine} />
        <text x={padL + 122} y={23} fontSize="11" fontWeight="700" fill={tk.negLine} fontFamily={FONT}>Neto negativo</text>
      </g>

      {tickVals.map((val) => {
        const yy = y(val);
        const isZero = val === 0;
        return (
          <g key={val}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={isZero ? tk.zeroLine : tk.grid} strokeWidth={isZero ? '1.5' : '1'} strokeDasharray={isZero ? undefined : '3 5'} />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>
              {val < 0 ? '-' : ''}{formatCompactCurrency(Math.abs(val), 0)}
            </text>
          </g>
        );
      })}

      <line x1={padL} x2={padL} y1={padT} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />
      <line x1={padL} x2={W - padR} y1={base} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {months.map((m, i) => (
        <text key={`xl${i}`} x={xs[i]} y={H - 10} textAnchor="middle" fontSize={months.length > 15 ? '8' : '9'} fontWeight="500" fill={tk.axisText} fontFamily={FONT} opacity={months.length > 15 && i % 5 !== 0 && i !== 0 ? 0.38 : 1}>
          {m}
        </text>
      ))}
      {xs.map((x, i) => (
        <line key={`tx${i}`} x1={x} x2={x} y1={base} y2={base + 4} stroke={tk.axisLine} strokeWidth="1.5" />
      ))}

      {linePath && (
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
        />
      )}

      {net.map((v, i) => {
        if (v == null) return null;
        const cx = xs[i], cy = y(v);
        const isFuture = todayIndex !== undefined && i > todayIndex;
        const isZero = v === 0;
        const color = v >= 0 ? tk.posLine : tk.negLine;
        const dotStroke = v >= 0 ? tk.posDotStroke : tk.negDotStroke;
        const isHov = hov?.i === i;
        const ly = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay = `${0.7 + i * 0.08}s`;
        return (
          <g key={`n${i}`} style={{ opacity: on ? (isFuture ? 0.42 : isZero ? 0.32 : 1) : 0, transition: `opacity 0.3s ease ${delay}` }} onMouseEnter={() => !isZero && !isFuture && setHov({ i, cx, cy, v })}>
            <circle cx={cx} cy={cy} r={isFuture ? '2.5' : isZero ? '2' : '3.5'} fill={color} stroke={dotStroke} strokeWidth="1.5"
              style={{
                transform: on ? (isHov ? 'scale(1.65)' : 'scale(1)') : 'scale(0)',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transition: on ? 'transform 0.18s cubic-bezier(.4,0,.2,1)' : `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}`,
                cursor: isZero || isFuture ? 'default' : 'pointer',
              }}
            />
            {!isZero && !isHov && !isFuture && (
              <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily={FONT}>
                {v < 0 ? '-' : ''}{fmtK(Math.abs(v))}
              </text>
            )}
          </g>
        );
      })}

      {/* Hit-areas verticales: el tooltip aparece al pasar por la columna del punto */}
      {on && months.map((_, i) => {
        const v = net[i];
        if (v == null) return null;
        const slotW = (W - padL - padR) / Math.max(months.length - 1, 1);
        const x0 = i === 0 ? padL : xs[i] - slotW / 2;
        const x1 = i === months.length - 1 ? W - padR : xs[i] + slotW / 2;
        return (
          <rect key={`hit${i}`} x={x0} y={padT} width={Math.max(x1 - x0, 0)} height={base - padT}
            fill="transparent"
            onMouseEnter={() => setHov({ i, cx: xs[i], cy: y(v), v })}
          />
        );
      })}

      {hov && on && (() => {
        const label = `${hov.v < 0 ? '-' : ''}${fmtK(Math.abs(hov.v))}`;
        const tw = Math.max(label.length * 7 + 24, 58);
        const th = 24;
        const tx = Math.max(padL + tw / 2 + 4, Math.min(W - padR - tw / 2 - 4, hov.cx));
        const above = hov.cy - th - 14 >= padT + 6;
        const ty = above ? hov.cy - th / 2 - 14 : hov.cy + th / 2 + 14;
        const color = hov.v >= 0 ? tk.posLine : tk.negLine;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={hov.cx} x2={hov.cx} y1={padT} y2={base} stroke={color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
            <rect x={tx - tw / 2} y={ty - th / 2} width={tw} height={th} rx="7" fill="rgba(17,24,39,0.92)" />
            <circle cx={tx - tw / 2 + 11} cy={ty} r="3" fill={color} />
            <text x={tx - tw / 2 + 20} y={ty + 4} textAnchor="start" fontSize="10" fontWeight="700" fill={color} fontFamily={FONT}>{label}</text>
          </g>
        );
      })()}
    </svg>
  );
}

const M3_DEBT_LIGHT = { line: '#d97706', fill: 'rgba(217,119,6,.11)', grid: 'rgba(220,200,160,.80)', axisLine: 'rgba(17,24,39,0.5)', axisText: '#6B7280', dotStroke: 'rgba(255,255,255,.92)' };
const M3_DEBT_DARK  = { line: '#d97706', fill: 'rgba(217,119,6,.14)', grid: 'rgba(255,255,255,.07)', axisLine: 'rgba(217,119,6,.30)', axisText: '#c4a96a', dotStroke: 'rgba(13,15,18,.95)' };

export function DebtLineChart({ months, remaining, width, height, darkMode = false }: Readonly<{
  months: string[]; remaining: (number|null)[]; width?: number; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode ? M3_DEBT_DARK : M3_DEBT_LIGHT;
  const W = width && width > 0 ? width : 800, H = height;
  const padL = 48, padR = 20, padT = 50, padB = 36;
  const plotH = H - padT - padB;
  const base  = H - padB;

  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const id = setTimeout(() => setOn(true), 80); return () => clearTimeout(id); }, []);

  const valid = remaining.filter((v): v is number => v !== null);
  if (!valid.length) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.axisText, fontSize: 12 }}>
      Sin datos de deuda
    </div>
  );
  const dataMax  = Math.ceil(Math.max(...valid) / 1000) * 1000 || 1;
  const step     = Math.max(1000, Math.round(dataMax / 4 / 1000) * 1000);
  const halfStep = Math.round(step / 2 / 1000) * 1000;
  const max      = dataMax + halfStep;
  const tickVals = [1, 2, 3, 4].map(i => i * step);
  const xs  = months.map((_, i) => padL + (i / Math.max(months.length - 1, 1)) * (W - padL - padR));
  const y   = (v: number) => padT + (1 - v / max) * plotH;
  const pts: [number,number][] = remaining.map((v, i) => v == null ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const linePath = seriesPath(pts);
  const areaPath = linePath && pts.length > 1 ? `${linePath} L ${pts[pts.length-1][0]} ${base} L ${pts[0][0]} ${base} Z` : '';
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>

      {/* Leyenda superior-izquierda */}
      <circle cx={padL} cy={18} r="5" fill={tk.line} />
      <text x={padL + 10} y={23} fontSize="11" fontWeight="700" fill={tk.line} fontFamily={FONT}>Deuda restante</text>

      {/* Grid + etiquetas eje Y */}
      {tickVals.map((val, i) => {
        const yy = y(val);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 5" />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>
              {formatCompactCurrency(val, 0)}
            </text>
          </g>
        );
      })}

      {/* Eje Y */}
      <line x1={padL} x2={padL} y1={padT} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Eje X */}
      <line x1={padL} x2={W - padR} y1={base} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Etiquetas eje X */}
      {months.map((m, i) => (
        <text key={m} x={xs[i]} y={H - 10} textAnchor="middle" fontSize="9" fontWeight="500" fill={tk.axisText} fontFamily={FONT}>{m}</text>
      ))}

      {/* Tick marks eje X */}
      {xs.map((x, i) => (
        <line key={`tx${i}`} x1={x} x2={x} y1={base} y2={base + 4} stroke={tk.axisLine} strokeWidth="1.5" />
      ))}

      {/* Relleno sólido */}
      {areaPath && <path d={areaPath} fill={tk.fill} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.35s' }} />}

      {/* Línea */}
      {linePath && <path d={linePath} fill="none" stroke={tk.line} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }} />}

      {/* Puntos + valores */}
      {remaining.map((v, i) => {
        if (v == null) return null;
        const cx = xs[i], cy = y(v);
        const ly = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay = `${0.7 + i * 0.1}s`;
        return (
          <g key={i} style={{ opacity: on ? 1 : 0, transition: `opacity 0.3s ease ${delay}` }}>
            <circle cx={cx} cy={cy} r="4.5" fill={tk.line} stroke={tk.dotStroke} strokeWidth="2"
              style={{ transform: on ? 'scale(1)' : 'scale(0)', transformBox: 'fill-box', transformOrigin: 'center', transition: `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}` }} />
            <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.line} fontFamily={FONT}>{fmtK(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ChartTabRow({ items, active, onSelect, accentMap, secondary = false }: Readonly<{
  items: { id: string; label: string; badge: string }[];
  active: string;
  onSelect: (id: string) => void;
  accentMap: Record<string, string>;
  secondary?: boolean;
}>) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}` }}>
      {items.map(t => {
        const isActive  = active === t.id;
        const ac        = accentMap[t.id] ?? C.olive;
        const pillBg    = isActive ? `${ac}22` : C.border;
        const pillColor = isActive ? ac : C.textMute;
        const indicator = isActive ? ac : 'transparent';
        const fs        = secondary ? 11.5 : 13;
        const pb        = secondary ? 9 : 10;
        const mr        = secondary ? 26 : 20;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: `0 4px ${pb}px`, marginRight: mr, marginBottom: -1,
            background: 'none', border: 'none',
            borderBottom: `2px solid ${indicator}`,
            color: isActive ? C.text : C.textMute,
            fontSize: fs, fontWeight: isActive ? 600 : (secondary ? 400 : 500),
            cursor: 'pointer', transition: 'color .14s, border-color .14s',
            fontFamily: 'var(--font-ui), system-ui, sans-serif', letterSpacing: -0.1,
          }}>
            {t.label}
            <span style={{ fontSize: 9, fontWeight: 600, color: pillColor, background: pillBg, borderRadius: 10, padding: '1px 5px', transition: 'all .14s' }}>
              {t.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
