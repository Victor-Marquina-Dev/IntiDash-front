'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { AreaLineChart, EmptyLineChart } from '../dashboard/home/ChartVisuals';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import type {
  IngresoRow,
  GastoUnicoRow,
  GastoDeudaRow,
  CuentaBancariaRow,
  MonthlyChartData,
} from '@/shared/types/finance.types';

// ── Context de modo oscuro (para sub-componentes sin prop drilling) ───────────
const DarkCtx = React.createContext(false);

// ── Constantes ────────────────────────────────────────────────────────────────
const MONTHS      = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Escalas de color semánticas (igual que el dashboard home)
const GAS_COLORS  = ['#CF9C9C','#BC9090','#D4AAAA','#A87878','#E0BFBF','#B87070'];
const ING_COLORS  = ['#CCDCCC','#BBD0BB','#A8C0A8','#8FA88F','#7A9A7A','#6B8B6B'];
const CUENTA_COLORS = ['#8FA88F','#BC9090','#7A9A7A','#CF9C9C','#6B8B6B','#A87878','#A8C0A8','#E0BFBF'];

const OTROS_ING = '#B8CCBA';
const OTROS_EG  = '#DDBFBF';
const FONT        = 'var(--font-ui),system-ui,sans-serif';

type Period = 'year' | 'q1' | 'q2' | 'q3' | 'q4';

const QUARTER_MONTHS: Record<Period, number[]> = {
  year: [0,1,2,3,4,5,6,7,8,9,10,11],
  q1: [0,1,2], q2: [3,4,5], q3: [6,7,8], q4: [9,10,11],
};
const PERIOD_LABELS: Record<Period, string> = {
  year: 'Año', q1: 'T1', q2: 'T2', q3: 'T3', q4: 'T4',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return formatCurrency(v);
}
function fmtK(v: number) {
  return formatCompactCurrency(v);
}
function getYear(f: string | null)  { return f ? new Date(f).getFullYear() : null; }
function getMonth(f: string | null) { return f ? new Date(f).getMonth()    : null; }

function filterByPeriod<T extends { fecha: string | null }>(
  rows: T[], year: number, period: Period,
): T[] {
  const ms = QUARTER_MONTHS[period];
  return rows.filter(r => getYear(r.fecha) === year && ms.includes(getMonth(r.fecha) ?? -1));
}

function filterByMonth<T extends { fecha: string | null }>(
  rows: T[], year: number, month: number,
): T[] {
  return rows.filter(r => getYear(r.fecha) === year && getMonth(r.fecha) === month);
}

function groupByCategory<T>(
  rows: T[], getKey: (r: T) => string, getVal: (r: T) => number,
  palette: string[],
): { label: string; value: number; pct: number; color: string }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = getKey(r) || 'Sin categoría';
    map.set(k, (map.get(k) ?? 0) + getVal(r));
  }
  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label, value,
      pct:   total > 0 ? (value / total) * 100 : 0,
      color: palette[Math.min(i, palette.length - 1)],
    }));
}

function isCredit(c: CuentaBancariaRow) {
  const t = (c.tipo ?? '').toLowerCase();
  return t.includes('crédit') || t.includes('credit');
}

// ── DashCard ──────────────────────────────────────────────────────────────────
function DashCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 22, overflow: 'hidden',
        background: D ? 'linear-gradient(145deg,#1A1D21,#16181C)' : '#FFFFFF',
        border: `1px solid ${hov ? (D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : (D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)')}`,
        boxShadow: hov
          ? (D ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)')
          : (D ? '0 4px 24px rgba(0,0,0,.4)' : '0 1px 2px rgba(17,24,39,.04)'),
        fontFamily: FONT,
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ active, onClick, children, small = false, current = false }: {
  active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean; current?: boolean;
}) {
  const bg    = active ? (current ? '#d97706' : C.primary) : current ? '#d9770618' : 'rgba(17,24,39,0.04)';
  const bdr   = active ? (current ? '#d97706' : C.primary) : current ? '#d9770650' : 'rgba(17,24,39,0.08)';
  const col   = active ? '#fff' : current ? '#b45309' : C.textDim;
  return (
    <button onClick={onClick} style={{
      height: small ? 26 : 30,
      padding: small ? '0 9px' : '0 12px',
      borderRadius: 20,
      fontSize: small ? 11 : 12,
      fontWeight: 700,
      border: `1px solid ${bdr}`,
      background: bg,
      color: col,
      cursor: 'pointer', fontFamily: FONT, transition: 'all .15s', flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

// ── KpiCard compacto: icon izquierda, label+valor derecha, badge delta ────────
function KpiCard({ label, value, color, I, delta, deltaInverted = false, compareYear }: {
  label: string; value: string; color: string;
  I: (props: { size?: number; strokeWidth?: number }) => React.ReactNode;
  delta?: number | null; deltaInverted?: boolean; compareYear?: number;
}) {
  const D = React.useContext(DarkCtx);
  const showDelta = delta != null && isFinite(delta) && Math.abs(delta) <= 250;
  const positive  = showDelta && (deltaInverted ? delta! <= 0 : delta! >= 0);
  const labelC = D ? 'rgba(255,255,255,0.40)' : undefined;
  return (
    <DashCard>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(145deg, ${color}22 0%, ${color}0d 100%)`,
          border: `1.5px solid ${color}38`,
          color,
          display: 'grid', placeItems: 'center',
          boxShadow: `0 4px 14px ${color}28, 0 1px 4px ${color}18`,
        }}>
          <I size={21} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'var(--font-ui)', color: labelC ?? C.textDim }}>{label}</div>
            {showDelta && (
              <span
                title={compareYear ? `vs ${compareYear}` : 'vs año anterior'}
                style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.1,
                  color: positive ? C.pos : C.neg,
                  background: positive ? `${C.pos}18` : `${C.neg}18`,
                  padding: '1px 5px', borderRadius: 20, cursor: 'default', flexShrink: 0,
                }}
              >
                {delta! >= 0 ? '↑' : '↓'}{Math.abs(delta!).toFixed(0)}%
              </span>
            )}
          </div>
          <div style={{
            fontSize: 19, fontWeight: 800, color,
            fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6,
            lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {value}
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ── Donut animado estilo dashboard ────────────────────────────────────────────
interface DonutItem { label: string; value: number; color: string }

function useCounter(target: number, duration = 900) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!target) return;
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
  return target ? val : 0;
}

function AnalyticsDonut({ items, title, subtitle, compact = false, otrosColor = '#9ca3af' }: {
  items: DonutItem[]; title: string; subtitle: string; compact?: boolean; otrosColor?: string;
}) {
  const D = React.useContext(DarkCtx);
  // compact: anillo más grande y grueso, leyenda columna a la derecha
  const CX   = compact ? 110  : 210;
  const CY   = compact ? 110  : 133;
  const R    = compact ? 88   : 110;
  const SW   = compact ? 36   : 44;
  const VW   = compact ? 220  : 420;
  const VH   = compact ? 220  : 278;
  const CIRC = 2 * Math.PI * R;

  const [anim, setAnim]            = React.useState(false);
  const [selectedSeg, setSelected] = React.useState<number | null>(null);

  React.useEffect(() => {
    const resetId = setTimeout(() => {
      setAnim(false);
      setSelected(null);
    }, 0);
    const startId = setTimeout(() => setAnim(true), 60);
    return () => {
      clearTimeout(resetId);
      clearTimeout(startId);
    };
  }, [items]);

  const sorted = [...items].filter(r => r.value > 0).sort((a, b) => b.value - a.value);
  const total  = sorted.reduce((s, r) => s + r.value, 0);
  const top4   = sorted.slice(0, 4);
  const displayItems: DonutItem[] = sorted.length <= 4 ? top4 : [
    ...top4,
    { label: 'Otros', value: sorted.slice(4).reduce((s, r) => s + r.value, 0), color: otrosColor },
  ];
  const displayWithPct = displayItems.map(r => ({
    ...r, pct: total > 0 ? Math.round((r.value / total) * 100) : 0,
  }));

  const segs = displayWithPct.map((row, i) => {
    const startPct = displayWithPct.slice(0, i).reduce((sum, x) => sum + x.pct, 0);
    const dashLen  = (row.pct / 100) * CIRC;
    const offset   = -(startPct / 100) * CIRC;
    return { ...row, i, dashLen, offset, startPct };
  });

  const selSeg    = selectedSeg !== null ? segs[selectedSeg] ?? null : null;
  const centerVal = selSeg ? selSeg.value : total;
  const animated  = useCounter(anim ? centerVal : 0);

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (VW / rect.width);
    const my = (e.clientY - rect.top)  * (VH / rect.height);
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

  const ringEl = (
    <svg
      width={compact ? 185 : '100%'}
      height={compact ? 185 : undefined}
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ display: 'block', cursor: 'pointer', flexShrink: 0 }}
      onClick={handleSvgClick}
    >
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(17,24,39,0.06)" strokeWidth={SW}
        style={{ opacity: selectedSeg !== null ? 0.15 : 1, transition: 'opacity 0.25s ease' }}
      />
      {segs.map(seg => {
        const isSel   = selectedSeg === seg.i;
        const sw      = isSel ? SW - (compact ? 8 : 14) : SW;
        const opacity = selectedSeg === null ? 1 : isSel ? 1 : 0.15;
        return (
          <circle key={seg.i} cx={CX} cy={CY} r={R} fill="none"
            stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${anim ? seg.dashLen : 0} ${CIRC}`}
            strokeDashoffset={seg.offset} strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              opacity,
              transition: `stroke-dasharray ${0.6 + seg.i * 0.15}s cubic-bezier(.4,0,.2,1), stroke-width 0.3s ease, opacity 0.25s ease`,
            }}
          />
        );
      })}
      {anim && segs.map(seg => {
        if (seg.pct < (compact ? 15 : 8)) return null;
        const midAngle = -Math.PI / 2 + ((seg.startPct + seg.pct / 2) / 100) * 2 * Math.PI;
        const lx = CX + R * Math.cos(midAngle);
        const ly = CY + R * Math.sin(midAngle);
        const opacity = selectedSeg === null ? 1 : selectedSeg === seg.i ? 1 : 0;
        return (
          <text key={`pct-${seg.i}`} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="central"
            fontSize={compact ? "11" : "11"} fontWeight="800" fill="white" fontFamily={FONT}
            style={{ opacity, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}>
            {seg.pct}%
          </text>
        );
      })}
      <circle cx={CX} cy={CY} r={R - SW / 2 - 4} fill={D ? '#1A1D21' : '#FFFFFF'} />
      <text x={CX} y={selSeg ? CY - 4 : CY + (compact ? 7 : 9)} textAnchor="middle"
        fontSize={compact ? "18" : "26"} fontWeight="900"
        fill={selSeg ? selSeg.color : (D ? 'rgba(255,255,255,0.88)' : C.text)} fontFamily={FONT}
        style={{ transition: 'all 0.25s ease' }}>
        {fmtK(animated)}
      </text>
      {selSeg && (
        <text x={CX} y={CY + (compact ? 14 : 16)} textAnchor="middle"
          fontSize={compact ? "9" : "10"} fontWeight="700"
          fill={selSeg.color} fontFamily={FONT} style={{ opacity: 0.8 }}>
          {selSeg.label}
        </text>
      )}
    </svg>
  );

  const sepC = D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.06)';
  const txtC = D ? 'rgba(255,255,255,0.88)' : C.text;
  const subC = D ? 'rgba(255,255,255,0.38)' : C.textMute;

  if (items.length === 0 || total === 0) {
    return (
      <DashCard>
        <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${sepC}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: txtC }}>{title}</div>
          <div style={{ fontSize: 11, color: subC, marginTop: 1 }}>{subtitle}</div>
        </div>
        <div style={{ padding: '40px 0', textAlign: 'center', color: subC, fontSize: 13 }}>
          Sin datos en el período
        </div>
      </DashCard>
    );
  }

  if (compact) {
    return (
      <DashCard>
        <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${sepC}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: txtC }}>{title}</div>
          <div style={{ fontSize: 11, color: subC, marginTop: 1 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 12px', gap: 14 }}>
          {ringEl}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
            {displayWithPct.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: 12, fontWeight: 600, color: txtC, fontFamily: FONT,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>
                  {row.label}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: row.color, fontFamily: FONT, flexShrink: 0 }}>
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <div style={{ padding: '18px 20px 10px', borderBottom: `1px solid ${sepC}` }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: txtC }}>{title}</div>
        <div style={{ fontSize: 11.5, color: subC, marginTop: 2 }}>{subtitle}</div>
      </div>
      {ringEl}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '6px 20px', padding: '10px 16px 16px',
        margin: '0 16px 12px', borderRadius: 10,
        background: D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.025)',
        border: `1px solid ${sepC}`,
      }}>
        {displayWithPct.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
            <span style={{
              fontSize: 13, fontWeight: 600, color: txtC, fontFamily: FONT,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────────
interface AnalyticsScreenProps { accent: string; darkMode?: boolean }

export function AnalyticsScreen({ accent: _accent, darkMode = false }: Readonly<AnalyticsScreenProps>) {
  const now          = React.useMemo(() => new Date(), []);
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay   = now.getDate();

  const [viewMode,       setViewMode]       = React.useState<'year' | 'month'>('month');
  const [year,           setYear]           = React.useState(currentYear);
  const [period,         setPeriod]         = React.useState<Period>('year');
  const [selectedMonth,  setSelectedMonth]  = React.useState(currentMonth);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const yearBtnRef  = React.useRef<HTMLDivElement>(null);
  const yearListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!yearPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (yearBtnRef.current && !yearBtnRef.current.contains(e.target as Node))
        setYearPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [yearPickerOpen]);

  React.useEffect(() => {
    if (!yearPickerOpen || !yearListRef.current) return;
    const active = yearListRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ block: 'center' });
  }, [yearPickerOpen]);

  const [ingresos,     setIngresos]     = React.useState<IngresoRow[]>([]);
  const [gastos,       setGastos]       = React.useState<GastoUnicoRow[]>([]);
  const [gastosDeudas, setGastosDeudas] = React.useState<GastoDeudaRow[]>([]);
  const [cuentas,      setCuentas]      = React.useState<CuentaBancariaRow[]>([]);
  const [chart,        setChart]        = React.useState<MonthlyChartData | null>(null);
  const [loading,      setLoading]      = React.useState(true);
  const [chartTab,     setChartTab]     = React.useState<'ig' | 'deudas'>('ig');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getCuentasBancarias(),
      notionPaymentsService.getMonthlyChart(),
    ]).then(([ing, gas, gd, cue, ch]) => {
      setIngresos(ing); setGastos(gas); setGastosDeudas(gd); setCuentas(cue); setChart(ch);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useDataSyncedRefresh(loadData);

  // Años disponibles
  const _availableYears = React.useMemo(() => {
    const ys = new Set<number>([currentYear]);
    if (chart?.year) ys.add(chart.year);
    for (const r of ingresos) { const y = getYear(r.fecha); if (y) ys.add(y); }
    for (const r of gastos)   { const y = getYear(r.fecha); if (y) ys.add(y); }
    return Array.from(ys).sort((a, b) => b - a);
  }, [ingresos, gastos, chart, currentYear]);

  // Filtrado del período actual
  const filtIng = React.useMemo(() =>
    viewMode === 'year' ? filterByPeriod(ingresos, year, period) : filterByMonth(ingresos, year, selectedMonth),
    [ingresos, year, period, viewMode, selectedMonth],
  );
  const filtGas = React.useMemo(() =>
    viewMode === 'year' ? filterByPeriod(gastos, year, period) : filterByMonth(gastos, year, selectedMonth),
    [gastos, year, period, viewMode, selectedMonth],
  );

  // KPIs actuales
  const totalIngresos = filtIng.reduce((s, r) => s + (r.ingreso ?? 0), 0);
  const totalGastos   = filtGas.reduce((s, r) => s + (r.monto   ?? 0), 0);
  const ahorro        = totalIngresos - totalGastos;
  const pctGastado    = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

  const cuentasReg   = React.useMemo(() => cuentas.filter(c => !isCredit(c)), [cuentas]);
  const balanceTotal = cuentasReg.reduce((s, c) => s + (c.balance ?? c.balanceInicial ?? 0), 0);

  // Filtrado del período ANTERIOR (mismo período, año anterior) para deltas en KPIs
  const prevYear    = year - 1;
  const prevFiltIng = React.useMemo(() =>
    viewMode === 'year' ? filterByPeriod(ingresos, prevYear, period) : filterByMonth(ingresos, prevYear, selectedMonth),
    [ingresos, prevYear, period, viewMode, selectedMonth],
  );
  const prevFiltGas = React.useMemo(() =>
    viewMode === 'year' ? filterByPeriod(gastos, prevYear, period) : filterByMonth(gastos, prevYear, selectedMonth),
    [gastos, prevYear, period, viewMode, selectedMonth],
  );
  const prevIng = prevFiltIng.reduce((s, r) => s + (r.ingreso ?? 0), 0);
  const prevGas = prevFiltGas.reduce((s, r) => s + (r.monto   ?? 0), 0);
  const prevAhorro = prevIng - prevGas;

  const deltaIng    = prevIng    > 0 ? ((totalIngresos - prevIng)    / prevIng)            * 100 : null;
  const deltaGas    = prevGas    > 0 ? ((totalGastos   - prevGas)    / prevGas)            * 100 : null;
  const deltaAhorro = Math.abs(prevAhorro) > 0 ? ((ahorro - prevAhorro) / Math.abs(prevAhorro)) * 100 : null;

  // Categorías → donuts
  const catGasItems = React.useMemo<DonutItem[]>(() =>
    groupByCategory(filtGas, r => r.categoriaGasto,  r => r.monto ?? 0, GAS_COLORS)
      .map(c => ({ label: c.label, value: c.value, color: c.color })),
    [filtGas],
  );
  const catIngItems = React.useMemo<DonutItem[]>(() =>
    groupByCategory(filtIng, r => r.categoriaIngreso, r => r.ingreso ?? 0, ING_COLORS)
      .map(c => ({ label: c.label, value: c.value, color: c.color })),
    [filtIng],
  );
  const cuentaItems = React.useMemo<DonutItem[]>(() =>
    cuentasReg
      .map((c, i) => ({
        label: c.nombre,
        value: Math.abs(c.balance ?? c.balanceInicial ?? 0),
        color: CUENTA_COLORS[i % CUENTA_COLORS.length],
      }))
      .filter(c => c.value > 0),
    [cuentasReg],
  );

  // Gráfico mensual (vista año)
  const chartMonthIdxs = QUARTER_MONTHS[period];
  const chartIncome    = chart ? chartMonthIdxs.map(m => chart.income[m]  ?? null) : [];
  const chartExpense   = chart ? chartMonthIdxs.map(m => chart.expense[m] ?? null) : [];
  const chartLabels    = chartMonthIdxs.map(m => MONTHS[m]);

  // Serie de deudas por mes (vista año) — pagos de deudas locales agrupados
  const chartDebt = React.useMemo(() => {
    const arr: number[] = Array(12).fill(0);
    for (const r of gastosDeudas) {
      if (getYear(r.fecha) === year) {
        const m = getMonth(r.fecha);
        if (m != null) arr[m] += r.montoGastado ?? 0;
      }
    }
    // Meses futuros → null (igual que income/expense del API)
    return arr.map((v, m) =>
      (year === currentYear && m > currentMonth) || year > currentYear ? null : v
    );
  }, [gastosDeudas, year, currentYear, currentMonth]);
  const chartDebtPeriod = chartMonthIdxs.map(m => chartDebt[m]);

  // Gráfico diario (vista mes): agrupa transacciones por día del mes
  const dailyChartData = React.useMemo(() => {
    if (viewMode !== 'month') return null;
    const daysInMonth  = new Date(year, selectedMonth + 1, 0).getDate();
    const isCurrent    = year === currentYear && selectedMonth === currentMonth;
    const lastVisibleD = isCurrent ? currentDay - 1 : daysInMonth - 1; // índice 0-based hasta hoy

    // Días futuros → null (sin punto ni línea); días pasados/hoy → 0 por defecto
    const incByDay:  (number|null)[] = Array.from({ length: daysInMonth }, (_, i) => i > lastVisibleD ? null : 0);
    const expByDay:  (number|null)[] = Array.from({ length: daysInMonth }, (_, i) => i > lastVisibleD ? null : 0);
    const debtByDay: (number|null)[] = Array.from({ length: daysInMonth }, (_, i) => i > lastVisibleD ? null : 0);

    for (const r of ingresos) {
      if (getYear(r.fecha) === year && getMonth(r.fecha) === selectedMonth && r.fecha) {
        const d = new Date(r.fecha).getDate() - 1;
        if (d >= 0 && d < daysInMonth) incByDay[d] = (incByDay[d] ?? 0) + (r.ingreso ?? 0);
      }
    }
    for (const r of gastos) {
      if (getYear(r.fecha) === year && getMonth(r.fecha) === selectedMonth && r.fecha) {
        const d = new Date(r.fecha).getDate() - 1;
        if (d >= 0 && d < daysInMonth) expByDay[d] = (expByDay[d] ?? 0) + (r.monto ?? 0);
      }
    }
    for (const r of gastosDeudas) {
      if (getYear(r.fecha) === year && getMonth(r.fecha) === selectedMonth && r.fecha) {
        const d = new Date(r.fecha).getDate() - 1;
        if (d >= 0 && d < daysInMonth) debtByDay[d] = (debtByDay[d] ?? 0) + (r.montoGastado ?? 0);
      }
    }
    const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    return { labels, income: incByDay, expense: expByDay, debt: debtByDay };
  }, [ingresos, gastos, gastosDeudas, year, selectedMonth, viewMode, currentYear, currentMonth, currentDay]);

  const activeChartLabels  = viewMode === 'month' && dailyChartData ? dailyChartData.labels   : chartLabels;
  const activeChartIncome  = viewMode === 'month' && dailyChartData ? dailyChartData.income   : chartIncome;
  const activeChartExpense = viewMode === 'month' && dailyChartData ? dailyChartData.expense  : chartExpense;
  const activeChartDebt    = viewMode === 'month' && dailyChartData ? dailyChartData.debt     : chartDebtPeriod;
  const hasChartData = activeChartIncome.some(v => v != null && (v as number) > 0)
                    || activeChartExpense.some(v => v != null && (v as number) > 0);
  const hasDebtData = activeChartDebt.some(v => v != null && (v as number) > 0);

  // Tabla mensual: solo meses con actividad o pasados (no mostrar meses futuros)
  const tableData = React.useMemo(() => {
    const months = viewMode === 'year' ? QUARTER_MONTHS[period] : [selectedMonth];
    const visibleMonths = year < currentYear
      ? months
      : months.filter(m => m <= currentMonth);

    return visibleMonths.map(m => {
      const ingM = ingresos.filter(r => getYear(r.fecha) === year && getMonth(r.fecha) === m)
        .reduce((s, r) => s + (r.ingreso ?? 0), 0);
      const gasM = gastos.filter(r => getYear(r.fecha) === year && getMonth(r.fecha) === m)
        .reduce((s, r) => s + (r.monto ?? 0), 0);
      return {
        mesFull: MONTHS_FULL[m], month: m,
        ing: ingM, gas: gasM,
        ahorro: ingM - gasM,
        pctGastado: ingM > 0 ? (gasM / ingM) * 100 : null,
        hasData: ingM > 0 || gasM > 0,
      };
    });
  }, [ingresos, gastos, year, period, viewMode, selectedMonth, currentYear, currentMonth]);

  const periodLabel = viewMode === 'month'
    ? MONTHS_FULL[selectedMonth]
    : PERIOD_LABELS[period];

  const periodDesc = viewMode === 'month'
    ? `${year} · ${MONTHS_FULL[selectedMonth]}`
    : period === 'year'
      ? `${year} · año completo`
      : `${year} · ${PERIOD_LABELS[period]} (${QUARTER_MONTHS[period].map(m => MONTHS[m]).join(', ')})`;

  const D = darkMode;

  if (loading) {
    return (
      <DarkCtx.Provider value={D}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontSize: 14, fontFamily: FONT }}>
          Cargando análisis...
        </div>
      </DarkCtx.Provider>
    );
  }

  return (
    <DarkCtx.Provider value={D}>
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: FONT }}>

      {/* ── Header con filtros ── */}
      <div style={{
        padding: '20px 32px 16px', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border}`,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: D ? 'rgba(255,255,255,0.90)' : C.text, letterSpacing: -0.4 }}>Análisis</div>
          <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 2 }}>{periodDesc}</div>
        </div>
        {/* Toggle Año / Mes */}
        <div style={{
          display: 'flex', background: D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.06)', borderRadius: 22, padding: 3, gap: 2,
        }}>
          {(['year', 'month'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              height: 26, padding: '0 14px', borderRadius: 18, fontSize: 12, fontWeight: 700,
              background: viewMode === m ? C.primary : 'transparent',
              color: viewMode === m ? '#fff' : (D ? 'rgba(255,255,255,0.55)' : C.textDim),
              border: 'none', cursor: 'pointer', fontFamily: FONT, transition: 'all .15s',
            }}>
              {m === 'year' ? 'Año' : 'Mes'}
            </button>
          ))}
        </div>

        {/* Selector de año */}
        <div ref={yearBtnRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setYearPickerOpen(o => !o)}
            style={{
              height: 26, padding: '0 10px', borderRadius: 20,
              fontSize: 11, fontWeight: 700, fontFamily: FONT,
              border: `1px solid ${C.primary}`, background: C.primary, color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all .15s',
            }}
          >
            {year}
            <div style={{ transform: yearPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'grid', placeItems: 'center', transition: 'transform .2s' }}>
              <Icon.chevron size={10} strokeWidth={2.5} />
            </div>
          </button>

          {yearPickerOpen && (
            <div ref={yearListRef} style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
              zIndex: 300,
              background: D ? '#1E2128' : '#fff',
              borderRadius: 14,
              border: `1px solid ${D ? 'rgba(255,255,255,0.12)' : C.border}`,
              boxShadow: D ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.13)',
              padding: 4, width: 88,
              maxHeight: 220, overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              {Array.from({ length: 21 }, (_, i) => year - 10 + i).map(y => (
                <button
                  key={y}
                  data-active={y === year ? 'true' : undefined}
                  onClick={() => { setYear(y); setYearPickerOpen(false); }}
                  style={{
                    height: 32, borderRadius: 8, border: 'none', width: '100%',
                    background: y === year ? C.primary : y === currentYear ? `${C.primary}18` : 'transparent',
                    color: y === year ? '#fff' : y === currentYear ? C.primary : (D ? 'rgba(255,255,255,0.65)' : C.textDim),
                    cursor: 'pointer', fontSize: 12,
                    fontWeight: y === year || y === currentYear ? 700 : 500,
                    fontFamily: FONT, transition: 'background .1s',
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selector de período o mes */}
        {viewMode === 'year' ? (
          <div style={{ display: 'flex', gap: 4 }}>
            {(['year','q1','q2','q3','q4'] as Period[]).map(p => (
              <Pill key={p} active={period === p} onClick={() => setPeriod(p)}>{PERIOD_LABELS[p]}</Pill>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {MONTHS.map((m, i) => (
              <Pill key={i} small active={selectedMonth === i} current={year === currentYear && i === currentMonth} onClick={() => setSelectedMonth(i)}>{m}</Pill>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Fila 1: 5 KPIs — Balance Total primero ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          <KpiCard label="Balance total" value={fmt(balanceTotal)} color="#d97706" I={Icon.wallet} />
          <KpiCard
            label="Ingresos" value={fmt(totalIngresos)} color={C.pos}
            I={Icon.trendUp} delta={deltaIng} compareYear={prevYear}
          />
          <KpiCard
            label="Gastos" value={fmt(totalGastos)} color={C.neg}
            I={Icon.trendDown} delta={deltaGas} deltaInverted compareYear={prevYear}
          />
          <KpiCard
            label="Ahorro neto"
            value={fmt(Math.abs(ahorro))}
            color={ahorro >= 0 ? C.pos : C.neg}
            I={ahorro >= 0 ? Icon.shield : Icon.alert}
            delta={deltaAhorro} compareYear={prevYear}
          />
          <KpiCard
            label="% Gastado"
            value={`${pctGastado.toFixed(1)}%`}
            color={pctGastado <= 30 ? C.pos : pctGastado <= 60 ? C.goal : C.neg}
            I={Icon.gauge}
          />
        </div>

        {/* ── Fila 2: Gráfico izquierda + 2 donuts apilados derecha ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, alignItems: 'stretch' }}>
          {/* Gráfico */}
          <DashCard style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px 10px', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.06)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>
                  {chartTab === 'deudas' ? 'Pagos de Deudas' : 'Ingresos vs Gastos'}
                </div>
                <div style={{ fontSize: 11.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute }}>
                  {year} · {viewMode === 'month' ? `${MONTHS_FULL[selectedMonth]} · por día` : period === 'year' ? '12 meses' : PERIOD_LABELS[period]}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <Pill small active={chartTab === 'ig'} onClick={() => setChartTab('ig')}>Ingresos vs Gastos</Pill>
                <Pill small active={chartTab === 'deudas'} current onClick={() => setChartTab('deudas')}>Deudas</Pill>
              </div>
            </div>
            <div style={{ padding: '8px 14px 14px', width: '100%', boxSizing: 'border-box' }}>
              {(chartTab === 'ig' ? hasChartData : hasDebtData) ? (
                <AreaLineChart
                  key={chartTab}
                  months={activeChartLabels}
                  income={chartTab === 'ig' ? activeChartIncome : []}
                  expense={chartTab === 'ig' ? activeChartExpense : []}
                  debt={chartTab === 'deudas' ? activeChartDebt : undefined}
                  height={300}
                  darkMode={D}
                  todayIndex={
                    viewMode === 'month' && year === currentYear && selectedMonth === currentMonth
                      ? currentDay - 1
                      : undefined
                  }
                  chartYear={viewMode === 'month' ? year : undefined}
                  chartMonth={viewMode === 'month' ? selectedMonth : undefined}
                />
              ) : (
                <EmptyLineChart
                  months={viewMode === 'year' ? MONTHS.filter((_, i) => QUARTER_MONTHS[period].includes(i)) : MONTHS}
                  height={300}
                  darkMode={D}
                  legendItems={chartTab === 'deudas' ? [{ label: 'Deudas', color: '#D9A86C' }] : undefined}
                />
              )}
            </div>
          </DashCard>
          {/* 2 donuts apilados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnalyticsDonut
              title="Gastos por categoría"
              subtitle={`${filtGas.length} transacciones · ${periodLabel}`}
              items={catGasItems}
              otrosColor={OTROS_EG}
              compact
            />
            <AnalyticsDonut
              title="Ingresos por categoría"
              subtitle={`${filtIng.length} transacciones · ${periodLabel}`}
              items={catIngItems}
              otrosColor={OTROS_ING}
              compact
            />
          </div>
        </div>

        {/* ── Fila 3: Tabla izquierda + Donut cuentas derecha ── */}
        {tableData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, alignItems: 'start' }}>
          {/* Tabla */}
          <DashCard>
            <div style={{ padding: '18px 22px 12px', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.06)'}`, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>Comparativa mensual</div>
              <div style={{ fontSize: 11.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute }}>{periodDesc}</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '26%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {[
                      { label: 'Mes',       align: 'left'   },
                      { label: 'Ingresos',  align: 'right'  },
                      { label: 'Gastos',    align: 'right'  },
                      { label: '% Gas.',    align: 'center' },
                      { label: 'Ahorro',    align: 'right'  },
                    ].map(h => (
                      <th key={h.label} style={{
                        padding: '8px 14px', textAlign: h.align as React.CSSProperties['textAlign'],
                        fontSize: 10, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute,
                        textTransform: 'uppercase', letterSpacing: 0.8,
                        borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)'}`,
                        background: D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.02)',
                        whiteSpace: 'nowrap', fontFamily: FONT,
                      }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => {
                    const isCurrent = row.month === currentMonth && year === currentYear;
                    const pct       = row.pctGastado;
                    const hasPct    = pct != null && pct > 0;
                    const pctColor  = !hasPct ? (D ? 'rgba(255,255,255,0.25)' : C.textMute) : pct! <= 30 ? C.pos : pct! <= 60 ? C.goal : C.neg;
                    const rowSep    = `1px solid ${D ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.05)'}`;
                    return (
                      <tr key={row.mesFull} style={{
                        background: isCurrent
                          ? `${C.info}08`
                          : idx % 2 === 0 ? 'transparent' : (D ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.012)'),
                      }}>
                        <td style={{
                          padding: '8px 14px',
                          borderLeft: isCurrent ? `3px solid ${C.info}` : '3px solid transparent',
                          fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? C.info : (D ? 'rgba(255,255,255,0.85)' : C.text),
                          borderBottom: rowSep, whiteSpace: 'nowrap',
                        }}>
                          {row.mesFull}
                          {isCurrent && (
                            <span style={{ fontSize: 9, marginLeft: 6, color: C.info, fontWeight: 800, letterSpacing: 0.5, verticalAlign: 'middle', background: `${C.info}18`, padding: '1px 5px', borderRadius: 10 }}>HOY</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 13, color: row.ing > 0 ? C.pos : (D ? 'rgba(255,255,255,0.28)' : C.textMute), fontVariantNumeric: 'tabular-nums', borderBottom: rowSep }}>
                          {row.ing > 0 ? fmtK(row.ing) : '—'}
                        </td>
                        <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 13, color: row.gas > 0 ? C.neg : (D ? 'rgba(255,255,255,0.28)' : C.textMute), fontVariantNumeric: 'tabular-nums', borderBottom: rowSep }}>
                          {row.gas > 0 ? fmtK(row.gas) : '—'}
                        </td>
                        <td style={{ padding: '8px 14px', textAlign: 'center', borderBottom: rowSep }}>
                          {hasPct ? (
                            <span style={{
                              display: 'inline-block', fontSize: 11, fontWeight: 700,
                              color: pctColor, background: `${pctColor}1A`,
                              padding: '2px 8px', borderRadius: 20,
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {pct!.toFixed(0)}%
                            </span>
                          ) : (
                            <span style={{ color: D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.18)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 13, fontWeight: row.hasData ? 600 : 400, color: row.hasData ? (row.ahorro >= 0 ? C.pos : C.neg) : (D ? 'rgba(255,255,255,0.28)' : C.textMute), fontVariantNumeric: 'tabular-nums', borderBottom: rowSep }}>
                          {row.hasData ? fmtK(Math.abs(row.ahorro)) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totales */}
                <tfoot>
                  <tr style={{ background: D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)' }}>
                    <td style={{ padding: '8px 14px', borderLeft: '3px solid transparent', fontSize: 12, fontWeight: 700, color: D ? 'rgba(255,255,255,0.85)' : C.text, borderTop: `2px solid ${D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}` }}>
                      Total
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.pos, fontVariantNumeric: 'tabular-nums', borderTop: `2px solid ${D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}` }}>
                      {fmtK(totalIngresos)}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums', borderTop: `2px solid ${D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}` }}>
                      {fmtK(totalGastos)}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center', borderTop: `2px solid ${D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}` }}>
                      {totalGastos > 0 && (
                        <span style={{
                          display: 'inline-block', fontSize: 11, fontWeight: 700,
                          color: pctGastado <= 30 ? C.pos : pctGastado <= 60 ? C.goal : C.neg,
                          background: `${pctGastado <= 30 ? C.pos : pctGastado <= 60 ? C.goal : C.neg}1A`,
                          padding: '2px 8px', borderRadius: 20, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {pctGastado.toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: ahorro >= 0 ? C.pos : C.neg, fontVariantNumeric: 'tabular-nums', borderTop: `2px solid ${D ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}` }}>
                      {fmtK(Math.abs(ahorro))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </DashCard>
          {/* Donut distribución por cuenta */}
          <AnalyticsDonut
            title="Distribución por cuenta"
            subtitle="Saldo actual · cuentas y ahorro"
            items={cuentaItems}
            otrosColor={OTROS_EG}
            compact
          />
        </div>
        )}

      </div>
    </div>
    </DarkCtx.Provider>
  );
}
