'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PresupuestoLimiteRow } from '@/shared/types/finance.types';
import { COLOR_OPTS, DarkCtx, FONT } from './constants';
import { barColor, catColor, fmt, fmtDate, type Transaccion } from './budgetUtils';

export function Pill({ active, onClick, children, current = false, dot = false, dimmed = false }: {
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

export interface KpiCardProps { label: string; value: number; color: string; sub?: string; icon?: React.ReactNode }
export function KpiCard({ label, value, color, sub, icon }: KpiCardProps) {
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
          {neg && '-'}{int}
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

export interface BudgetRowProps {
  limite: PresupuestoLimiteRow;
  gastado: number;
  transacciones: Transaccion[];
  onEdit: (l: PresupuestoLimiteRow) => void;
  onDelete: (id: string) => void;
}
export function BudgetRow({ limite, gastado, transacciones, onEdit, onDelete }: BudgetRowProps) {
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
      {/* Fila principal */}
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

      {/* Tabla de transacciones */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${limite.color}25`, background: D ? 'rgba(255,255,255,0.03)' : `${limite.color}05` }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 120px',
            padding: '7px 18px 7px 72px', gap: 12,
            borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border}`,
          }}>
            {(['Fecha', 'Descripción', 'Monto'] as const).map((h, i) => (
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
              {transacciones.length} {transacciones.length === 1 ? 'transacción' : 'transacciones'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, textAlign: 'right' }}>{fmt(gastado)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnbudgetedRow({ categoria, gastado, onAssign }: { categoria: string; gastado: number; onAssign?: () => void }) {
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
          + Asignar límite
        </button>
      ) : (
        <span style={{
          fontSize: 10, fontWeight: 600, color: C.textMute, fontFamily: FONT, flexShrink: 0,
          padding: '3px 8px', borderRadius: 6, background: D ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.05)',
          border: `1px solid ${D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)'}`,
        }}>
          sin límite
        </span>
      )}
    </div>
  );
}

export function SuggestionRow({ categoria, promedioMensual, mesesConGasto, sugerido, colorIdx, onAdd }: {
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
          Promedio mensual: <strong style={{ color: D ? 'rgba(255,255,255,0.65)' : C.textDim }}>{fmt(promedioMensual)}</strong> · {mesesConGasto} {mesesConGasto === 1 ? 'mes' : 'meses'} de historial
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            Límite sugerido
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

