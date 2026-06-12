'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PresupuestoLimiteRow, GastoUnicoRow, GastoDeudaRow } from '@/shared/types/finance.types';

const FONT = 'var(--font-ui),system-ui,sans-serif';

const MONTHS      = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const COLOR_OPTS = [
  '#8FA88F','#CF9C9C','#CA8A04','#2563EB',
  '#7C3AED','#DB2777','#0891B2','#F97316',
];

const DarkCtx = React.createContext(false);

interface DeudaScreenProps { accent: string; canWrite?: boolean; darkMode?: boolean }

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const fmt = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function barColor(pct: number): string {
  if (pct >= 100) return C.neg;
  if (pct >= 75)  return C.warn;
  return C.pos;
}

function gastoDelMes(
  gastosU: GastoUnicoRow[],
  gastosD: GastoDeudaRow[],
  year: number,
  month: number,
): Map<string, number> {
  const map = new Map<string, number>();
  const add = (cat: string, amt: number) => map.set(cat, (map.get(cat) ?? 0) + amt);
  for (const r of gastosU) {
    if (!r.fecha || !r.monto) continue;
    const d = new Date(r.fecha);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month)
      add(r.categoriaGasto || 'Sin categorÃ­a', r.monto);
  }
  for (const r of gastosD) {
    if (!r.fecha || !r.montoGastado) continue;
    const d = new Date(r.fecha);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month)
      add(r.categoriaGasto || 'Sin categorÃ­a', r.montoGastado);
  }
  return map;
}

function getSugerencias(
  gastosU: GastoUnicoRow[],
  gastosD: GastoDeudaRow[],
  budgetedCats: Set<string>,
): Array<{ categoria: string; promedioMensual: number; mesesConGasto: number; sugerido: number }> {
  const monthly = new Map<string, Map<string, number>>();
  const addEntry = (cat: string, fecha: string | null, amt: number) => {
    if (!fecha || !amt || budgetedCats.has(cat)) return;
    const d = new Date(fecha);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!monthly.has(cat)) monthly.set(cat, new Map());
    const m = monthly.get(cat)!;
    m.set(key, (m.get(key) ?? 0) + amt);
  };
  for (const r of gastosU) addEntry(r.categoriaGasto || 'Sin categorÃ­a', r.fecha, r.monto ?? 0);
  for (const r of gastosD) addEntry(r.categoriaGasto || 'Sin categorÃ­a', r.fecha, r.montoGastado ?? 0);
  return [...monthly.entries()]
    .map(([categoria, byMonth]) => {
      const mesesConGasto = byMonth.size;
      const total = [...byMonth.values()].reduce((s, v) => s + v, 0);
      const promedioMensual = total / mesesConGasto;
      const sugerido = Math.ceil(promedioMensual / 50) * 50;
      return { categoria, promedioMensual, mesesConGasto, sugerido };
    })
    .sort((a, b) => b.promedioMensual - a.promedioMensual)
    .slice(0, 5);
}

// â”€â”€ Sub-componentes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Pill({ active, onClick, children, current = false, dot = false, dimmed = false }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
  current?: boolean; dot?: boolean; dimmed?: boolean;
}) {
  const bg  = active ? (current ? '#d97706' : C.primary) : current ? '#d9770618' : 'rgba(17,24,39,0.04)';
  const bdr = active ? (current ? '#d97706' : C.primary) : current ? '#d9770650' : 'rgba(17,24,39,0.08)';
  const col = active ? '#fff' : current ? '#b45309' : dimmed ? 'rgba(17,24,39,0.22)' : C.textDim;
  const dotColor = active ? (current ? '#fde68a' : 'rgba(255,255,255,0.7)') : current ? '#d97706' : C.pos;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <button onClick={onClick} style={{
        height: 26, padding: '0 9px', borderRadius: 20,
        fontSize: 11, fontWeight: 700,
        border: `1px solid ${bdr}`, background: bg, color: col,
        cursor: 'pointer', fontFamily: FONT, transition: 'all .15s',
        opacity: dimmed && !active ? 0.5 : 1,
      }}>
        {children}
      </button>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot ? dotColor : 'transparent', transition: 'background .15s' }} />
    </div>
  );
}

interface KpiCardProps { label: string; value: number; color: string; sub?: string; icon?: React.ReactNode }
function KpiCard({ label, value, color, sub, icon }: KpiCardProps) {
  const D   = React.useContext(DarkCtx);
  const int = Math.floor(Math.abs(value)).toLocaleString('es-PE');
  const dec = (Math.abs(value) % 1).toFixed(2).slice(1);
  const neg = value < 0;
  const effectiveColor = neg ? C.neg : color;
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, padding: '16px 20px', borderRadius: 18,
      border: `1px solid ${D ? `${effectiveColor}28` : `${effectiveColor}22`}`,
      background: D ? `${effectiveColor}0E` : `${effectiveColor}07`,
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: `0 2px 8px ${effectiveColor}08`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 10.5, color: D ? 'rgba(255,255,255,0.42)' : C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.9, fontFamily: FONT, lineHeight: 1.3 }}>
          {label}
        </div>
        {icon && (
          <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: `${effectiveColor}16`, color: effectiveColor, display: 'grid', placeItems: 'center', border: `1px solid ${effectiveColor}20` }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: D ? `${effectiveColor}cc` : `${effectiveColor}99`, fontFamily: FONT }}>S/</span>
        <span style={{ fontSize: 28, fontWeight: 900, color: effectiveColor, letterSpacing: -1.2, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, lineHeight: 1 }}>
          {neg && 'âˆ’'}{int}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: D ? 'rgba(255,255,255,0.20)' : `${effectiveColor}55`, fontFamily: FONT }}>{dec}</span>
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: effectiveColor, fontFamily: FONT, fontWeight: 600, opacity: 0.72, marginTop: -2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

interface Transaccion { id: string; nombre: string; fecha: string | null; monto: number; }

const fmtDate = (fecha: string | null): string => {
  if (!fecha) return 'â€”';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', timeZone: 'UTC' });
};

interface BudgetRowProps {
  limite: PresupuestoLimiteRow;
  gastado: number;
  transacciones: Transaccion[];
  onEdit: (l: PresupuestoLimiteRow) => void;
  onDelete: (id: string) => void;
}
function BudgetRow({ limite, gastado, transacciones, onEdit, onDelete }: BudgetRowProps) {
  const D = React.useContext(DarkCtx);
  const [expanded,    setExpanded]    = React.useState(false);
  const [hov,        setHov]        = React.useState(false);
  const [hovEdit,    setHovEdit]    = React.useState(false);
  const [hovDel,     setHovDel]     = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [deleting,   setDeleting]   = React.useState(false);

  const pct       = limite.limite > 0 ? Math.round((gastado / limite.limite) * 100) : 0;
  const color     = barColor(pct);
  const initial   = (limite.categoria || '?').charAt(0).toUpperCase();
  const canExpand = transacciones.length > 0;

  const del = async () => {
    setDeleting(true);
    try {
      await notionPaymentsService.deletePresupuestoLimite(limite.id);
      onDelete(limite.id);
    } catch { /* ignore */ }
    setDeleting(false);
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirmDel(false); }}
      style={{
        borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${expanded ? `${limite.color}55` : hov ? C.borderHi : C.border}`,
        transition: 'border-color 0.15s',
      }}
    >
      {/* â”€â”€ Fila principal â”€â”€ */}
      <div
        onClick={() => canExpand && setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: expanded ? `${limite.color}08` : hov ? (D ? 'rgba(255,255,255,0.04)' : '#FAFAFA') : (D ? 'rgba(255,255,255,0.02)' : '#fff'),
          cursor: canExpand ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}
      >
        {/* Badge */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: limite.color, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 14, fontWeight: 900, fontFamily: FONT,
          boxShadow: `0 3px 8px ${limite.color}45`,
        }}>
          {initial}
        </div>

        {/* Info + barra */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {limite.categoria}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0, marginLeft: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', fontFamily: FONT }}>
                {fmt(gastado)}
              </span>
              <span style={{ fontSize: 11, color: C.textMute, fontFamily: FONT }}>
                / {fmt(limite.limite)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 6, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.07)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 6,
                background: color, transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, color, flexShrink: 0,
              fontVariantNumeric: 'tabular-nums', fontFamily: FONT, minWidth: 36, textAlign: 'right',
            }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Chevron */}
        {canExpand && (
          <div style={{
            color: C.textMute, flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon.chevron size={15} strokeWidth={2} />
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          {!confirmDel ? (
            <>
              <button
                onClick={() => onEdit(limite)}
                onMouseEnter={() => setHovEdit(true)}
                onMouseLeave={() => setHovEdit(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${hovEdit ? `${C.pos}cc` : `${C.pos}30`}`,
                  background: hovEdit ? `${C.pos}22` : `${C.pos}0D`,
                  color: C.pos, cursor: 'pointer', display: 'grid', placeItems: 'center',
                  transition: 'all .15s',
                }}
              >
                <Icon.edit size={13} strokeWidth={2.2} />
              </button>
              <button
                onClick={() => setConfirmDel(true)}
                onMouseEnter={() => setHovDel(true)}
                onMouseLeave={() => setHovDel(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${hovDel ? `${C.neg}70` : `${C.neg}25`}`,
                  background: hovDel ? `${C.neg}18` : `${C.neg}08`,
                  color: C.neg, cursor: 'pointer', display: 'grid', placeItems: 'center',
                  transition: 'all .15s',
                }}
              >
                <Icon.trash size={13} strokeWidth={2.2} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={() => setConfirmDel(false)}
                style={{ height: 28, padding: '0 10px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 11.5, fontFamily: FONT }}
              >
                No
              </button>
              <button
                onClick={del}
                disabled={deleting}
                style={{ height: 28, padding: '0 10px', borderRadius: 7, border: 'none', background: C.neg, color: '#fff', cursor: 'pointer', fontSize: 11.5, fontFamily: FONT, opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Tabla de transacciones â”€â”€ */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${limite.color}25`, background: D ? 'rgba(255,255,255,0.03)' : `${limite.color}05` }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 120px',
            padding: '7px 18px 7px 72px', gap: 12,
            borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border}`,
          }}>
            {(['Fecha', 'DescripciÃ³n', 'Monto'] as const).map((h, i) => (
              <span key={h} style={{
                fontSize: 10.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute,
                textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT,
                textAlign: i === 2 ? 'right' : 'left',
              }}>{h}</span>
            ))}
          </div>
          {transacciones.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 120px',
                padding: '8px 18px 8px 72px', gap: 12,
                borderBottom: idx < transacciones.length - 1 ? `1px solid ${D ? 'rgba(255,255,255,0.05)' : `${C.border}20`}` : 'none',
              }}
            >
              <span style={{ fontSize: 11.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT }}>{fmtDate(t.fecha)}</span>
              <span style={{ fontSize: 12.5, color: D ? 'rgba(255,255,255,0.85)' : C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.65)' : C.textDim, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, textAlign: 'right' }}>{fmt(t.monto)}</span>
            </div>
          ))}
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 120px',
            padding: '7px 18px 9px 72px', gap: 12,
            borderTop: `1px solid ${limite.color}25`,
          }}>
            <span />
            <span style={{ fontSize: 11, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT }}>
              {transacciones.length} {transacciones.length === 1 ? 'transacciÃ³n' : 'transacciones'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, textAlign: 'right' }}>{fmt(gastado)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function catColor(cat: string): string {
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
  return COLOR_OPTS[h % COLOR_OPTS.length];
}

function UnbudgetedRow({ categoria, gastado, onAssign }: { categoria: string; gastado: number; onAssign?: () => void }) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState(false);
  const [hovBtn, setHovBtn] = React.useState(false);
  const color = catColor(categoria);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '11px 16px', borderRadius: 12,
        border: `1px solid ${hov ? (D ? 'rgba(255,255,255,0.12)' : C.borderHi) : (D ? 'rgba(255,255,255,0.07)' : C.border)}`,
        background: hov ? (D ? 'rgba(255,255,255,0.04)' : '#FAFAFA') : (D ? 'rgba(255,255,255,0.02)' : '#fff'),
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, color,
        display: 'grid', placeItems: 'center',
        fontSize: 12, fontWeight: 900, fontFamily: FONT,
        border: `1.5px solid ${color}35`,
      }}>
        {(categoria || '?').charAt(0).toUpperCase()}
      </div>
      <span style={{ flex: 1, fontSize: 13, color: D ? 'rgba(255,255,255,0.80)' : C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {categoria}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.65)' : C.textDim, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, flexShrink: 0 }}>
        {fmt(gastado)}
      </span>
      {onAssign ? (
        <button
          onClick={onAssign}
          onMouseEnter={() => setHovBtn(true)}
          onMouseLeave={() => setHovBtn(false)}
          style={{
            height: 26, padding: '0 10px', borderRadius: 7, flexShrink: 0,
            border: `1px solid ${hovBtn ? `${color}cc` : `${color}40`}`,
            background: hovBtn ? color : `${color}10`,
            color: hovBtn ? '#fff' : color,
            fontSize: 11, fontWeight: 600, fontFamily: FONT,
            cursor: 'pointer', transition: 'all .15s',
          }}
        >
          + Asignar lÃ­mite
        </button>
      ) : (
        <span style={{
          fontSize: 10, fontWeight: 600, color: C.textMute, fontFamily: FONT, flexShrink: 0,
          padding: '3px 8px', borderRadius: 6, background: D ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.05)',
          border: `1px solid ${D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)'}`,
        }}>
          sin lÃ­mite
        </span>
      )}
    </div>
  );
}

function SuggestionRow({ categoria, promedioMensual, mesesConGasto, sugerido, colorIdx, onAdd }: {
  categoria: string; promedioMensual: number; mesesConGasto: number; sugerido: number; colorIdx: number; onAdd: () => void;
}) {
  const D = React.useContext(DarkCtx);
  const [hov,    setHov]    = React.useState(false);
  const [hovBtn, setHovBtn] = React.useState(false);
  const color = COLOR_OPTS[colorIdx % COLOR_OPTS.length];
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px', borderRadius: 14,
        border: `1px solid ${hov ? (D ? 'rgba(255,255,255,0.15)' : C.borderHi) : (D ? 'rgba(255,255,255,0.08)' : C.border)}`,
        background: hov ? (D ? 'rgba(255,255,255,0.05)' : '#FAFAFA') : (D ? 'rgba(255,255,255,0.02)' : '#fff'),
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${color}22`, color,
        display: 'grid', placeItems: 'center',
        fontSize: 13, fontWeight: 900, fontFamily: FONT,
        border: `1.5px solid ${color}40`,
      }}>
        {(categoria || '?').charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {categoria}
        </div>
        <div style={{ fontSize: 11, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT, marginTop: 2 }}>
          Promedio mensual: <strong style={{ color: D ? 'rgba(255,255,255,0.65)' : C.textDim }}>{fmt(promedioMensual)}</strong> Â· {mesesConGasto} {mesesConGasto === 1 ? 'mes' : 'meses'} de historial
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            LÃ­mite sugerido
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: FONT, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(sugerido)}
          </div>
        </div>
        <button
          onClick={onAdd}
          onMouseEnter={() => setHovBtn(true)}
          onMouseLeave={() => setHovBtn(false)}
          style={{
            height: 30, padding: '0 12px', borderRadius: 8,
            border: `1px solid ${hovBtn ? `${color}cc` : `${color}50`}`,
            background: hovBtn ? color : `${color}14`,
            color: hovBtn ? '#fff' : color,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT,
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all .15s',
          }}
        >
          <Icon.plus size={12} strokeWidth={2.5} /> Agregar
        </button>
      </div>
    </div>
  );
}

// Formulario de crear / editar
interface LimiteFormProps {
  initial?: PresupuestoLimiteRow;
  quickPreset?: { categoria: string; limite: number; color: string };
  categoriasDisponibles: string[];
  onSaved: (row: PresupuestoLimiteRow) => void;
  onCancel: () => void;
}
function LimiteForm({ initial, quickPreset, categoriasDisponibles, onSaved, onCancel }: LimiteFormProps) {
  const [categoria, setCategoria] = React.useState(initial?.categoria ?? quickPreset?.categoria ?? '');
  const [limite,    setLimite]    = React.useState(initial?.limite != null ? String(initial.limite) : quickPreset?.limite != null ? String(quickPreset.limite) : '');
  const [color,     setColor]     = React.useState(initial?.color ?? quickPreset?.color ?? COLOR_OPTS[0]);
  const [saving,    setSaving]    = React.useState(false);
  const [error,     setError]     = React.useState('');

  const isEdit = !!initial;

  const save = async () => {
    if (!categoria.trim()) { setError('Escribe una categorÃ­a.'); return; }
    const lim = parseFloat(limite);
    if (isNaN(lim) || lim < 0) { setError('Ingresa un monto vÃ¡lido.'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await notionPaymentsService.updatePresupuestoLimite(initial.id, { categoria: categoria.trim(), limite: lim, color });
        onSaved({ ...initial, categoria: categoria.trim(), limite: lim, color });
      } else {
        const result = await notionPaymentsService.createPresupuestoLimite({ categoria: categoria.trim(), limite: lim, color });
        onSaved({ id: (result as { id: string }).id, categoria: categoria.trim(), limite: lim, color });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    }
    setSaving(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
    padding: '0 10px', fontSize: 13, fontFamily: FONT, color: C.text,
    background: '#fff', boxSizing: 'border-box', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    fontSize: 10.5, color: C.textMute, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT, display: 'block', marginBottom: 4,
  };

  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${color}40`,
      background: `${color}06`, padding: 18, marginBottom: 12,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14, fontFamily: FONT }}>
        {isEdit ? 'Editar categorÃ­a' : 'Nueva categorÃ­a de presupuesto'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={lbl}>CategorÃ­a</label>
          {categoriasDisponibles.length > 0 ? (
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={inp}
            >
              <option value="">â€” Selecciona o escribe â€”</option>
              {categoriasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              placeholder="Ej: Comida, Transporte..."
              autoFocus
              style={inp}
            />
          )}
        </div>
        <div>
          <label style={lbl}>LÃ­mite mensual (S/)</label>
          <input
            type="number" min="0" step="1"
            value={limite}
            onChange={e => setLimite(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); }}
            placeholder="0"
            style={inp}
          />
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_OPTS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: c,
                boxShadow: color === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'none',
                transition: 'box-shadow 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: C.neg, marginBottom: 10, fontFamily: FONT }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onCancel}
          style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 12.5, fontFamily: FONT }}
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{
            height: 32, padding: '0 18px', borderRadius: 8, border: 'none',
            background: color, color: '#fff', cursor: 'pointer', fontSize: 12.5,
            fontFamily: FONT, fontWeight: 600, opacity: saving ? 0.6 : 1,
            boxShadow: saving ? 'none' : `0 4px 12px ${color}40`,
            transition: 'opacity 0.15s, box-shadow 0.15s',
          }}
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear categorÃ­a'}
        </button>
      </div>
    </div>
  );
}

// â”€â”€ Pantalla principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function DeudaScreen({ accent: _accent, darkMode = false }: Readonly<DeudaScreenProps>) {
  const now         = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  const [year,  setYear]  = React.useState(currentYear);
  const [month, setMonth] = React.useState(currentMonth);

  const [limites,  setLimites]  = React.useState<PresupuestoLimiteRow[]>([]);
  const [gastosU,  setGastosU]  = React.useState<GastoUnicoRow[]>([]);
  const [gastosD,  setGastosD]  = React.useState<GastoDeudaRow[]>([]);
  const [catNames, setCatNames] = React.useState<string[]>([]);
  const [loading,  setLoading]  = React.useState(true);

  const [creating,    setCreating]    = React.useState(false);
  const [editing,     setEditing]     = React.useState<PresupuestoLimiteRow | null>(null);
  const [quickPreset, setQuickPreset] = React.useState<{ categoria: string; limite: number; color: string } | null>(null);
  const [hovAdd,      setHovAdd]      = React.useState(false);
  const [compact,        setCompact]        = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const pillsRef    = React.useRef<HTMLDivElement>(null);
  const yearBtnRef  = React.useRef<HTMLDivElement>(null);
  const yearListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!yearPickerOpen || !yearListRef.current) return;
    const el = yearListRef.current;
    const active = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ block: 'center' });
  }, [yearPickerOpen]);

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
    const el = pillsRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 540));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isToday = year === currentYear && month === currentMonth;
  const goToday = () => { setYear(currentYear); setMonth(currentMonth); };
  const goPrev  = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goNext  = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  React.useEffect(() => {
    Promise.all([
      notionPaymentsService.getPresupuestoLimites(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getCategoriasGastos(),
    ]).then(([lims, gu, gd, cats]) => {
      setLimites(lims);
      setGastosU(gu);
      setGastosD(gd);
      setCatNames([...new Set((cats as { nombre: string }[]).map(c => c.nombre).filter(Boolean))].sort());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const _availableYears = React.useMemo(() => {
    const ys = new Set<number>([currentYear]);
    for (const r of gastosU) { const y = r.fecha ? new Date(r.fecha).getUTCFullYear() : null; if (y) ys.add(y); }
    for (const r of gastosD) { const y = r.fecha ? new Date(r.fecha).getUTCFullYear() : null; if (y) ys.add(y); }
    const maxYear = Math.max(...Array.from(ys));
    ys.add(maxYear + 1);
    return Array.from(ys).sort((a, b) => b - a);
  }, [gastosU, gastosD, currentYear]);

  const monthsWithData = React.useMemo(() => {
    const s = new Set<number>();
    for (const r of gastosU) { if (r.fecha && new Date(r.fecha).getUTCFullYear() === year) s.add(new Date(r.fecha).getUTCMonth()); }
    for (const r of gastosD) { if (r.fecha && new Date(r.fecha).getUTCFullYear() === year) s.add(new Date(r.fecha).getUTCMonth()); }
    return s;
  }, [gastosU, gastosD, year]);

  const gastoMes = gastoDelMes(gastosU, gastosD, year, month);

  // CategorÃ­as con lÃ­mite definido
  const budgeted = limites.map(l => {
    const gastado = gastoMes.get(l.categoria) ?? 0;
    const transacciones: Transaccion[] = [
      ...gastosU
        .filter(r => r.fecha && r.monto != null
          && new Date(r.fecha).getUTCFullYear() === year
          && new Date(r.fecha).getUTCMonth() === month
          && (r.categoriaGasto || 'Sin categorÃ­a') === l.categoria)
        .map(r => ({ id: r.id, nombre: r.nombre, fecha: r.fecha, monto: r.monto! })),
      ...gastosD
        .filter(r => r.fecha && r.montoGastado != null
          && new Date(r.fecha).getUTCFullYear() === year
          && new Date(r.fecha).getUTCMonth() === month
          && (r.categoriaGasto || 'Sin categorÃ­a') === l.categoria)
        .map(r => ({ id: r.id, nombre: r.nombre, fecha: r.fecha, monto: r.montoGastado! })),
    ].sort((a, b) => (b.fecha ?? '') > (a.fecha ?? '') ? 1 : -1);
    return { limite: l, gastado, transacciones };
  }).sort((a, b) => b.gastado - a.gastado);

  // CategorÃ­as con gasto pero sin lÃ­mite
  const budgetedCats = new Set(limites.map(l => l.categoria));
  const unbudgeted = [...gastoMes.entries()]
    .filter(([cat]) => !budgetedCats.has(cat))
    .sort((a, b) => b[1] - a[1]);
  const unbudgetedTotal = unbudgeted.reduce((s, [, v]) => s + v, 0);

  const totalLimite  = limites.reduce((s, l) => s + l.limite, 0);
  const totalGastado = budgeted.reduce((s, b) => s + b.gastado, 0) + unbudgetedTotal;
  const disponible   = totalLimite - totalGastado;

  // CategorÃ­as disponibles para el selector (excluye las ya con lÃ­mite si no es ediciÃ³n)
  const catsForForm = editing
    ? catNames
    : catNames.filter(c => !budgetedCats.has(c));

  const sugerencias = React.useMemo(
    () => getSugerencias(gastosU, gastosD, new Set(limites.map(l => l.categoria))),
    [gastosU, gastosD, limites],
  );

  const D = darkMode;

  return (
    <DarkCtx.Provider value={D}>
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
      <style>{`
        .budget-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
        }
        .budget-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.85fr);
          gap: 16px;
          align-items: start;
        }
        .budget-panel {
          border: 1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border};
          background: ${D ? 'rgba(255,255,255,0.025)' : '#fff'};
          border-radius: 18px;
          padding: 14px;
          box-shadow: ${D ? 'none' : '0 1px 2px rgba(17,24,39,0.035)'};
        }
        .budget-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .budget-panel-title {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }
        .budget-panel-rail {
          width: 3px;
          height: 17px;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .budget-panel-title-text {
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .8px;
          color: ${D ? 'rgba(255,255,255,0.58)' : C.textDim};
          font-family: ${FONT};
        }
        .budget-panel-subtitle {
          font-size: 12px;
          color: ${D ? 'rgba(255,255,255,0.38)' : C.textMute};
          font-family: ${FONT};
          margin-top: -5px;
          margin-bottom: 12px;
        }
        .budget-chip {
          flex-shrink: 0;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 800;
          font-family: ${FONT};
        }
        .budget-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (max-width: 1180px) {
          .budget-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .budget-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .budget-kpi-grid { grid-template-columns: 1fr; }
          .budget-panel { padding: 12px; border-radius: 16px; }
        }
      `}</style>

      {/* â”€â”€ Header con filtros â”€â”€ */}
      <div style={{
        padding: '20px 32px 16px', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* TÃ­tulo */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: D ? 'rgba(255,255,255,0.90)' : C.text, letterSpacing: -0.4 }}>Presupuesto</div>
          <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 2 }}>{year} Â· {MONTHS_FULL[month]}</div>
        </div>

        {/* BotÃ³n "Hoy" */}
        {!isToday && (
          <button
            onClick={goToday}
            style={{
              height: 26, padding: '0 10px', borderRadius: 20,
              border: `1px solid rgba(17,24,39,0.12)`, background: 'rgba(17,24,39,0.04)',
              color: C.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              fontFamily: FONT, transition: 'all .15s', flexShrink: 0,
            }}
          >
            Hoy
          </button>
        )}

        {/* Selector de fechas (responsive) */}
        <div ref={pillsRef} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {compact ? (
            /* â”€â”€ Modo compacto: < mes aÃ±o > â”€â”€ */
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={goPrev}
                style={{
                  width: 26, height: 26, borderRadius: 20, border: `1px solid rgba(17,24,39,0.1)`,
                  background: 'rgba(17,24,39,0.04)', color: C.textDim, cursor: 'pointer',
                  display: 'grid', placeItems: 'center', transition: 'all .15s',
                }}
              >
                <div style={{ transform: 'rotate(90deg)', display: 'grid', placeItems: 'center' }}>
                  <Icon.chevron size={12} strokeWidth={2.2} />
                </div>
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: FONT, minWidth: 110, textAlign: 'center' }}>
                {MONTHS_FULL[month]} {year}
              </span>
              <button
                onClick={goNext}
                style={{
                  width: 26, height: 26, borderRadius: 20, border: `1px solid rgba(17,24,39,0.1)`,
                  background: 'rgba(17,24,39,0.04)', color: C.textDim, cursor: 'pointer',
                  display: 'grid', placeItems: 'center', transition: 'all .15s',
                }}
              >
                <div style={{ transform: 'rotate(-90deg)', display: 'grid', placeItems: 'center' }}>
                  <Icon.chevron size={12} strokeWidth={2.2} />
                </div>
              </button>
            </div>
          ) : (
            /* â”€â”€ Modo completo: pills de aÃ±o + mes â”€â”€ */
            <>
              {/* â”€â”€ Year picker â”€â”€ */}
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
                    zIndex: 300, background: '#fff', borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
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
                          color: y === year ? '#fff' : y === currentYear ? C.primary : C.textDim,
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
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {MONTHS.map((m, i) => (
                  <Pill
                    key={i}
                    active={month === i}
                    current={year === currentYear && i === currentMonth}
                    dot={monthsWithData.has(i)}
                    dimmed={!monthsWithData.has(i) && month !== i}
                    onClick={() => setMonth(i)}
                  >
                    {m}
                  </Pill>
                ))}
              </div>
            </>
          )}
        </div>

        {/* BotÃ³n agregar */}
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          onMouseEnter={() => setHovAdd(true)}
          onMouseLeave={() => setHovAdd(false)}
          style={{
            height: 30, padding: '0 14px', borderRadius: 10,
            border: `1px solid ${hovAdd ? `${C.pos}cc` : `${C.pos}50`}`,
            background: hovAdd ? C.pos : `${C.pos}14`,
            color: hovAdd ? '#fff' : C.pos,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT,
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: hovAdd ? `0 4px 12px ${C.pos}40` : 'none',
            transition: 'all .18s',
          }}
        >
          <Icon.plus size={13} strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      <div style={{ padding: '20px 32px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* â”€â”€ KPIs â”€â”€ */}
      {!loading && (
        <div className="budget-kpi-grid">
          <KpiCard
            label="Total presupuestado"
            value={totalLimite}
            color={D ? 'rgba(255,255,255,0.60)' : C.textDim}
            icon={<Icon.target size={14} strokeWidth={2} />}
          />
          <KpiCard
            label="Gastado este mes"
            value={totalGastado}
            color={totalGastado > totalLimite ? C.neg : C.warn}
            sub={totalLimite > 0 ? `${Math.round((totalGastado / totalLimite) * 100)}% del presupuesto` : undefined}
            icon={<Icon.trendUp size={14} strokeWidth={2} />}
          />
          <KpiCard
            label={disponible >= 0 ? 'Disponible' : 'Excedido'}
            value={disponible}
            color={disponible >= 0 ? C.pos : C.neg}
            icon={<Icon.chart size={14} strokeWidth={2} />}
          />
          <KpiCard
            label="Sin lÃ­mite"
            value={unbudgetedTotal}
            color={unbudgetedTotal > 0 ? C.warn : C.pos}
            sub={unbudgeted.length > 0 ? `${unbudgeted.length} categorÃ­a${unbudgeted.length === 1 ? '' : 's'} pendiente${unbudgeted.length === 1 ? '' : 's'}` : 'Todo asignado'}
            icon={<Icon.target size={14} strokeWidth={2} />}
          />
        </div>
      )}

      {/* â”€â”€ Formulario crear / editar â”€â”€ */}
      {(creating || editing) && (
        <LimiteForm
          initial={editing ?? undefined}
          quickPreset={quickPreset ?? undefined}
          categoriasDisponibles={catsForForm}
          onSaved={(row) => {
            if (editing) {
              setLimites(ls => ls.map(l => l.id === row.id ? row : l));
            } else {
              setLimites(ls => [...ls, row]);
            }
            setCreating(false);
            setEditing(null);
            setQuickPreset(null);
          }}
          onCancel={() => { setCreating(false); setEditing(null); setQuickPreset(null); }}
        />
      )}

      {/* â”€â”€ Loading â”€â”€ */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
          Cargando...
        </div>
      )}

      {!loading && (
        <div className="budget-main-grid">
      {/* â”€â”€ Lista con lÃ­mites â”€â”€ */}
      {budgeted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {budgeted.map(({ limite, gastado, transacciones }) => (
            <BudgetRow
              key={limite.id}
              limite={limite}
              gastado={gastado}
              transacciones={transacciones}
              onEdit={(l) => { setEditing(l); setCreating(false); }}
              onDelete={(id) => setLimites(ls => ls.filter(l => l.id !== id))}
            />
          ))}
        </div>
      )}

      {/* â”€â”€ Sin categorÃ­as configuradas â”€â”€ */}
      {budgeted.length === 0 && !creating && (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: 18,
          border: `1.5px dashed ${D ? 'rgba(255,255,255,0.10)' : C.border}`,
          background: D ? 'rgba(255,255,255,0.02)' : 'rgba(143,168,143,0.03)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.pos}14`, color: C.pos, display: 'grid', placeItems: 'center', border: `1.5px solid ${C.pos}28` }}>
            <Icon.chart size={24} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: D ? 'rgba(255,255,255,0.80)' : C.text, marginBottom: 5, fontFamily: FONT }}>
              Sin categorÃ­as de presupuesto
            </div>
            <div style={{ fontSize: 13, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT }}>
              Agrega una categorÃ­a para empezar a controlar tus gastos.
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Gastos sin presupuesto â”€â”€ */}
      {unbudgeted.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 3, height: 16, borderRadius: 3, background: C.warn, flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.55)' : C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>
                Gastos sin lÃ­mite asignado
              </span>
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: C.warn, fontFamily: FONT }}>
                {fmt(unbudgeted.reduce((s, [, v]) => s + v, 0))}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {unbudgeted.map(([cat, gasto]) => (
              <UnbudgetedRow
                key={cat}
                categoria={cat}
                gastado={gasto}
                onAssign={() => {
                  const col = catColor(cat);
                  setQuickPreset({ categoria: cat, limite: Math.ceil(gasto / 50) * 50, color: col });
                  setCreating(true);
                  setEditing(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ Sugerencias basadas en historial â”€â”€ */}
      {sugerencias.length > 0 && !creating && !editing && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 3, height: 16, borderRadius: 3, background: C.primary, flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.55)' : C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>
                Sugerencias
              </span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginBottom: 10, fontFamily: FONT, paddingLeft: 13 }}>
            CategorÃ­as con gasto recurrente aÃºn sin lÃ­mite asignado.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sugerencias.map((s, i) => (
              <SuggestionRow
                key={s.categoria}
                {...s}
                colorIdx={i}
                onAdd={() => {
                  setQuickPreset({ categoria: s.categoria, limite: s.sugerido, color: COLOR_OPTS[i % COLOR_OPTS.length] });
                  setCreating(true);
                  setEditing(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}
        </div>
      )}
      </div>
    </div>
    </DarkCtx.Provider>
  );
}
