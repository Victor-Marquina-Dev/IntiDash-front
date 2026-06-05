'use client';

import React from 'react';
import { C } from '@/lib/colors';

function fmtK(v: number): string {
  return v >= 1000 ? `S/${(v/1000).toFixed(1)}k` : `S/${v.toFixed(0)}`;
}

const M3_LIGHT = {
  incLine:   '#8FA88F',                 // verde sage suave — tono de la card Ingresos
  incFill:   'rgba(204,220,204,0.85)', // = #CCDCCC
  expLine:   '#CF9C9C',
  expFill:   'rgba(245,234,234,0.85)',  // = #F5EAEA con ligera transparencia (card Gastos bg)
  grid:      'rgba(17,24,39,.07)',
  axisLine:  'rgba(17,24,39,.14)',
  axisText:  '#9CA3AF',
  dotStroke: 'rgba(255,255,255,.92)',
};
const M3_DARK = {
  incLine:   '#0C5E3F',
  incFill:   'rgba(12,94,63,.20)',
  expLine:   '#872F2F',
  expFill:   'rgba(135,47,47,.20)',
  grid:      'rgba(255,255,255,.07)',
  axisLine:  'rgba(255,255,255,.12)',
  axisText:  'rgba(255,255,255,0.30)',
  dotStroke: 'rgba(13,15,18,.95)',
};

const FONT = 'var(--font-ui),system-ui,sans-serif';

export function AreaLineChart({ months, income, expense, height, darkMode = false }: Readonly<{
  months: string[]; income: (number|null)[]; expense: (number|null)[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode ? M3_DARK : M3_LIGHT;
  const W = 800, H = height;
  const padL = 48, padR = 20, padT = 50, padB = 36;
  const plotH = H - padT - padB;
  const base  = H - padB;

  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const id = setTimeout(() => setOn(true), 80); return () => clearTimeout(id); }, []);

  const all = [...income, ...expense].filter((v): v is number => v != null);
  if (!all.length) return null;
  const dataMax  = Math.ceil(Math.max(...all) / 1000) * 1000 || 1;
  const step     = Math.max(1000, Math.round(dataMax / 4 / 1000) * 1000);
  const max      = dataMax + Math.round(step / 2 / 1000) * 1000;
  const tickVals = [1, 2, 3, 4].map(i => i * step);
  const xs = months.map((_, i) => padL + (i / Math.max(months.length - 1, 1)) * (W - padL - padR));
  const y  = (v: number) => padT + (1 - v / max) * plotH;
  const ptInc = income.map( (v, i) => v == null ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const ptExp = expense.map((v, i) => v == null ? null : [xs[i], y(v)] as [number,number]).filter((p): p is [number,number] => p !== null);
  const seg = (pts: [number,number][]) => pts.length < 2 ? '' : `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ');
  const incPath = seg(ptInc);
  const expPath = seg(ptExp);
  const incArea = incPath && ptInc.length > 1 ? `${incPath} L ${ptInc[ptInc.length-1][0]} ${base} L ${ptInc[0][0]} ${base} Z` : '';
  const expArea = expPath && ptExp.length > 1 ? `${expPath} L ${ptExp[ptExp.length-1][0]} ${base} L ${ptExp[0][0]} ${base} Z` : '';

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>

      {/* Leyenda superior-izquierda */}
      <circle cx={padL} cy={18} r="5" fill={tk.incLine} />
      <text x={padL + 10} y={23} fontSize="11" fontWeight="700" fill={tk.incLine} fontFamily={FONT}>Ingresos</text>
      <circle cx={padL + 85} cy={18} r="5" fill={tk.expLine} />
      <text x={padL + 95} y={23} fontSize="11" fontWeight="700" fill={tk.expLine} fontFamily={FONT}>Gastos</text>

      {/* Grid + etiquetas eje Y */}
      {tickVals.map((val, i) => {
        const yy = y(val);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 5" />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="10" fontWeight="600" fill={tk.axisText} fontFamily={FONT}>
              {val >= 1000 ? `S/${(val / 1000).toFixed(0)}k` : `S/${val}`}
            </text>
          </g>
        );
      })}

      {/* Eje Y (línea vertical) */}
      <line x1={padL} x2={padL} y1={padT} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Eje X (línea horizontal) */}
      <line x1={padL} x2={W - padR} y1={base} y2={base} stroke={tk.axisLine} strokeWidth="1.5" />

      {/* Etiquetas eje X (meses) */}
      {months.map((m, i) => (
        <text key={m} x={xs[i]} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={tk.axisText} fontFamily={FONT}>{m}</text>
      ))}

      {/* Tick marks eje X */}
      {xs.map((x, i) => (
        <line key={`tx${i}`} x1={x} x2={x} y1={base} y2={base + 4} stroke={tk.axisLine} strokeWidth="1.5" />
      ))}

      {/* Relleno sólido */}
      {incArea && <path d={incArea} fill={tk.incFill} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.35s' }} />}
      {expArea && <path d={expArea} fill={tk.expFill} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.9s ease 0.5s' }} />}

      {/* Líneas */}
      {incPath && <path d={incPath} fill="none" stroke={tk.incLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }} />}
      {expPath && <path d={expPath} fill="none" stroke={tk.expLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={2500} strokeDashoffset={on ? 0 : 2500}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) 0.15s' }} />}

      {/* Puntos + valores — ingresos */}
      {income.map((v, i) => {
        if (v == null) return null;
        const cx = xs[i], cy = y(v);
        const ly = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay = `${0.7 + i * 0.1}s`;
        return (
          <g key={`i${i}`} style={{ opacity: on ? 1 : 0, transition: `opacity 0.3s ease ${delay}` }}>
            <circle cx={cx} cy={cy} r="4.5" fill={tk.incLine} stroke={tk.dotStroke} strokeWidth="2"
              style={{ transform: on ? 'scale(1)' : 'scale(0)', transformBox: 'fill-box', transformOrigin: 'center', transition: `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}` }} />
            <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.incLine} fontFamily={FONT}>{fmtK(v)}</text>
          </g>
        );
      })}

      {/* Puntos + valores — gastos */}
      {expense.map((v, i) => {
        if (v == null) return null;
        const cx = xs[i], cy = y(v);
        const ly = cy - 16 < padT + 5 ? cy + 20 : cy - 16;
        const delay = `${0.75 + i * 0.1}s`;
        return (
          <g key={`e${i}`} style={{ opacity: on ? 1 : 0, transition: `opacity 0.3s ease ${delay}` }}>
            <circle cx={cx} cy={cy} r="4.5" fill={tk.expLine} stroke={tk.dotStroke} strokeWidth="2"
              style={{ transform: on ? 'scale(1)' : 'scale(0)', transformBox: 'fill-box', transformOrigin: 'center', transition: `transform 0.35s cubic-bezier(.4,0,.2,1) ${delay}` }} />
            <text x={cx} y={ly} textAnchor="middle" fontSize="9" fontWeight="700" fill={tk.expLine} fontFamily={FONT}>{fmtK(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Modelo 2: Barras Apiladas ────────────────────────────────────────────
export function StackedBarsChart({ months, income, expense, height, darkMode = false }: Readonly<{
  months: string[]; income: number[]; expense: number[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode
    ? { incFill: 'rgba(16,185,129,.65)', expFill: 'rgba(248,113,113,.70)', grid: 'rgba(255,255,255,.06)', axis: '#5a3a3a', lastAxis: '#f87171' }
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
    ? { incFill: '#818cf8', expFill: '#fb7185', grid: 'rgba(99,102,241,.10)', axis: '#3a3880', lastAxis: '#818cf8' }
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
    ? { barFull: '#fbbf24', barMid: 'rgba(251,191,36,.42)', barLow: 'rgba(251,191,36,.28)', line: 'rgba(251,191,36,.50)', dot: '#fbbf24', ring: 'rgba(251,191,36,.20)', grid: '#1e1c10', axis: '#4a4020', lastAxis: '#fbbf24' }
    : { barFull: '#d97706', barMid: 'rgba(217,119,6,.42)',  barLow: 'rgba(217,119,6,.26)',  line: 'rgba(217,119,6,.50)',  dot: '#d97706', ring: 'rgba(217,119,6,.20)',  grid: 'rgba(0,0,0,.07)', axis: '#b08040', lastAxis: '#d97706' };
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

const M3_DEBT_LIGHT = { line: '#d97706', fill: 'rgba(217,119,6,.11)', grid: 'rgba(220,200,160,.80)', axisLine: 'rgba(217,119,6,.30)', axisText: '#c4a96a', dotStroke: 'rgba(255,255,255,.92)' };
const M3_DEBT_DARK  = { line: '#fbbf24', fill: 'rgba(251,191,36,.12)', grid: 'rgba(255,255,255,.07)', axisLine: 'rgba(251,191,36,.22)', axisText: '#7a6a3a', dotStroke: '#0f1a0f' };

export function DebtLineChart({ months, remaining, height, darkMode = false }: Readonly<{
  months: string[]; remaining: (number|null)[]; height: number; darkMode?: boolean;
}>) {
  const tk = darkMode ? M3_DEBT_DARK : M3_DEBT_LIGHT;
  const W = 800, H = height;
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
  const linePath = pts.length < 2 ? '' : `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ');
  const areaPath = linePath ? `${linePath} L ${pts[pts.length-1][0]} ${base} L ${pts[0][0]} ${base} Z` : '';
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>

      {/* Leyenda superior-izquierda */}
      <circle cx={padL} cy={18} r="5" fill={tk.line} />
      <text x={padL + 10} y={23} fontSize="11" fontWeight="700" fill={tk.line} fontFamily={FONT}>Deuda restante</text>

      {/* Grid + etiquetas eje Y */}
      {tickVals.map((val, i) => {
        const yy = y(val);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={tk.grid} strokeWidth="1" strokeDasharray="3 5" />
            <text x={padL - 6} y={yy + 4} textAnchor="end" fontSize="10" fontWeight="600" fill={tk.axisText} fontFamily={FONT}>
              {val >= 1000 ? `S/${(val / 1000).toFixed(0)}k` : `S/${val}`}
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
        <text key={m} x={xs[i]} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={tk.axisText} fontFamily={FONT}>{m}</text>
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
