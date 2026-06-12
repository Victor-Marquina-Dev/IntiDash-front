'use client';

import React from 'react';
import { C } from '@/lib/colors';
import type { BP } from '@/lib/breakpoints';
import { formatCurrencyParts } from '@/lib/format';
import { useDashboardDebts, widgetPct } from '@/shared/hooks/use-dashboard-debts';
import { DeudasModal, NewDeudaModal } from './KpiRail';
import { NewPrestamoModal, PrestamosModal } from './PrestamosModals';
import { CardHeaderSection } from './CardHeaderSection';
import { Icon } from '@/components/icons';
import type { DeudaRow, PrestamoRow } from '@/shared/types/finance.types';

// ── Tokens de color por tema ──────────────────────────────────────────────
const DARK = {
  cardBg:     'linear-gradient(145deg,#1A1D21,#16181C)',
  cardBrd:    'rgba(255,255,255,0.08)',
  boxShadow:  '0 4px 24px rgba(0,0,0,.5)',
  metricInt:  'rgba(255,255,255,0.88)',
  metricSym:  'rgba(255,255,255,0.50)',
  metricDec:  'rgba(255,255,255,0.22)',
  metricSub:  'rgba(255,255,255,0.35)',
  itemBg:     'rgba(255,255,255,.04)',
  itemBrd:    'rgba(255,255,255,.08)',
  nameC:      'rgba(255,255,255,0.88)',
  subC:       'rgba(255,255,255,0.38)',
  amtC:       'rgba(255,255,255,0.88)',
  barBg:      'rgba(255,255,255,.07)',
  pillActBg:  'rgba(255,255,255,0.90)',
  pillActC:   '#111',
  pillInBg:   'rgba(255,255,255,.04)',
  pillInC:    'rgba(255,255,255,0.42)',
  pillInBrd:  'rgba(255,255,255,.10)',
  emptyC:     'rgba(255,255,255,0.32)',
  scrollBg:   'rgba(255,255,255,0.06)',
};
const LIGHT = {
  cardBg:     '#FFFFFF',
  cardBrd:    'rgba(17,24,39,0.08)',
  boxShadow:  '0 1px 2px rgba(17,24,39,.04)',
  metricInt:  '#111827',
  metricSym:  '#6B7280',
  metricDec:  'rgba(17,24,39,0.30)',
  metricSub:  '#9CA3AF',
  itemBg:     '#FAFAFA',
  itemBrd:    'rgba(17,24,39,0.07)',
  nameC:      '#111827',
  subC:       '#9CA3AF',
  amtC:       '#111827',
  barBg:      'rgba(17,24,39,0.07)',
  pillActBg:  '#111827',
  pillActC:   '#fff',
  pillInBg:   'transparent',
  pillInC:    '#6B7280',
  pillInBrd:  'rgba(17,24,39,0.10)',
  emptyC:     '#9CA3AF',
  scrollBg:   'rgba(17,24,39,0.04)',
};

// ── Colores por tipo de item ──────────────────────────────────────────────
const DEBT_CUOTA = C.warn;       // ámbar
const DEBT_PAGO  = C.neg;        // rojo
const PREST_COLORS = [C.neg, C.warn];

// ── Mini item (2 col grid, tamaño fijo) ───────────────────────────────────
interface MiniItemProps {
  color:      string;
  initial:    string;
  name:       string;
  sub:        string;
  amount:     number;
  amountPre?: string;
  pct?:       number;
  tk:         typeof LIGHT;
}
function MiniItem({ color, initial, name, sub, amount, amountPre = 'S/', pct, tk }: MiniItemProps) {
  const [hov, setHov] = React.useState(false);
  const { integer: intPart, decimal: decPart } = formatCurrencyParts(amount);

  const dc      = color;
  const dcText  = color;
  const dcBadge = color;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        padding: '11px 12px',
        borderRadius: 14,
        background: hov ? `${color}10` : `${color}07`,
        border: `1px solid ${hov ? `${color}35` : `${color}1C`}`,
        boxShadow: hov ? `0 4px 14px ${color}22` : 'none',
        transform: hov ? 'translateY(-1px)' : 'none',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        minWidth: 0,
        cursor: 'default',
      }}>

      {/* Fila principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>

        {/* Icono con color sólido */}
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: dcBadge,
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 900, letterSpacing: 0.3,
          boxShadow: `0 3px 8px ${dc}45`,
        }}>
          {initial}
        </div>

        {/* Nombre + subtítulo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 700, color: tk.nameC,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.25,
          }}>
            {name || '—'}
          </div>
          <div style={{
            fontSize: 10, color: tk.subC, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {sub}
          </div>
        </div>

        {/* Monto */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: dcText, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, letterSpacing: -0.3 }}>
            {amountPre}{intPart}
            <span style={{ fontSize: 9.5, fontWeight: 600, opacity: 0.72 }}>{decPart}</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      {pct !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ flex: 1, height: 3.5, borderRadius: 6, background: `${color}20`, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 6, background: dc }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 800, color: dcText, flexShrink: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2 }}>
            {pct}%
          </span>
        </div>
      )}
    </div>
  );
}

// ── Skeleton item ─────────────────────────────────────────────────────────
function SkeletonItem({ isDark }: { isDark: boolean }) {
  const cls = isDark ? 'fz-skeleton--dark' : 'fz-skeleton';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '11px 12px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(17,24,39,.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(17,24,39,.06)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className={cls} style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div className={cls} style={{ height: 11, width: '68%', borderRadius: 5 }} />
          <div className={cls} style={{ height: 9,  width: '40%', borderRadius: 5 }} />
        </div>
        <div className={cls} style={{ height: 11, width: 46, borderRadius: 5, flexShrink: 0 }} />
      </div>
      <div className={cls} style={{ height: 3.5, borderRadius: 6, width: '80%' }} />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ message, tk }: { message: string; tk: typeof LIGHT }) {
  return (
    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 11.5, color: tk.emptyC }}>
      {message}
    </div>
  );
}

// ── Resumen de tab (card clickeable) ─────────────────────────────────────
function AmountCard({ amount, subtitle, tk, isDark, color, onClick, onNew, newLine1, newLine2 }: {
  amount: number; subtitle: string; tk: typeof LIGHT; isDark: boolean; color: string;
  onClick: () => void; onNew?: () => void; newLine1?: string; newLine2?: string;
}) {
  const [hov,     setHov]     = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const { integer: intPart, decimal: decPart } = formatCurrencyParts(amount);
  return (
    <div style={{ padding: '8px 14px 10px', display: 'flex', gap: 8, flexShrink: 0 }}>

      {/* Bloque de monto clickeable */}
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setHov(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          flex: 1, padding: '14px 16px 12px',
          borderRadius: 16, cursor: 'pointer', textAlign: 'center',
          fontFamily: 'var(--font-ui),system-ui,sans-serif',
          border: `1.5px solid ${pressed ? `${color}55` : hov ? `${color}35` : (isDark ? 'rgba(255,255,255,.10)' : 'rgba(17,24,39,.09)')}`,
          background: pressed
            ? `${color}18`
            : hov
            ? `${color}0D`
            : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(17,24,39,.025)'),
          boxShadow: pressed
            ? `0 0 0 4px ${color}1A, 0 2px 8px ${color}22`
            : hov
            ? `0 4px 16px ${color}18`
            : 'none',
          transform: pressed ? 'scale(0.985)' : hov ? 'translateY(-1px)' : 'none',
          transition: 'all .15s',
        }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'center', lineHeight: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: tk.metricSym }}>S/</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: tk.metricInt, letterSpacing: -1.5, fontVariantNumeric: 'tabular-nums' }}>{intPart}</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: tk.metricDec }}>{decPart}</span>
        </div>
        <div style={{ fontSize: 11, color: tk.metricSub, fontWeight: 500, marginTop: 4 }}>{subtitle}</div>
      </button>

      {/* Botón Nueva deuda / Nuevo préstamo */}
      {onNew && (
        <button
          onClick={onNew}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, minWidth: 60, padding: '0 10px',
            borderRadius: 16, cursor: 'pointer',
            background: `${color}0E`,
            border: `1.5px dashed ${color}45`,
            color,
            fontFamily: 'var(--font-ui),system-ui,sans-serif',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}18`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}0E`; }}>
          <span style={{ fontSize: 24, fontWeight: 300, lineHeight: 1 }}>+</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
            {newLine1 ?? 'Nueva'}<br />{newLine2 ?? 'deuda'}
          </span>
        </button>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export function Debts({ bp, darkMode, canWrite = true }: Readonly<{ bp: BP; darkMode?: boolean; canWrite?: boolean }>) {
  const isDark    = darkMode ?? false;
  const tk        = isDark ? DARK : LIGHT;
  const isDesktop = bp === 'desktop';

  const [tab,         setTab]         = React.useState<'debts' | 'prestamos'>('debts');
  const [debtFilter,  setDebtFilter]  = React.useState<'cuotas' | 'un_pago'>('un_pago');
  const [showTable,   setShowTable]   = React.useState(false);
  const [showNew,     setShowNew]     = React.useState(false);
  const [hovered,     setHovered]     = React.useState(false);

  const {
    loading, fetchDeudas, fetchPrestamos,
    prestamosRows, debts,
    debtsCuotas, debtsUnPago, visibleDebts, totals,
  } = useDashboardDebts(debtFilter);

  const isDebts     = tab === 'debts';
  const isPrestamos = tab === 'prestamos';
  const emptyMsg    = canWrite ? 'Sin datos · Sincroniza desde Ajustes' : 'Sin datos disponibles';

  // Color del scrollbar según tab activo
  const scrollThumb = isDebts
    ? (debtFilter === 'cuotas' ? `${DEBT_CUOTA}90` : `${DEBT_PAGO}90`)
    : `${PREST_COLORS[0]}90`;

  // Resumen por tab
  const summaryAmount   = isPrestamos ? totals.faltante : totals.debt;
  const summarySubtitle = isPrestamos ? 'total pendiente en préstamos' : 'total pendiente en deudas';

  // Items a renderizar según el tab activo
  const deudaItems    = [...visibleDebts].sort((a, b) => (b.cantidad ?? 0) - (a.cantidad ?? 0));
  const prestamoItems = [...prestamosRows].sort((a, b) => (b.montoPrestamo ?? 0) - (a.montoPrestamo ?? 0));

  const anyEmpty = isPrestamos ? prestamoItems.length === 0 : deudaItems.length === 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 22, overflow: 'hidden',
        background: tk.cardBg,
        border: `1px solid ${hovered ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : tk.cardBrd}`,
        boxShadow: hovered ? (isDark ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : tk.boxShadow,
        fontFamily: 'var(--font-ui),system-ui,sans-serif',
        display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
        ...(isDesktop ? { flex: 1, minHeight: 0 } : {}),
      }}>

      {/* ── Header con tabs ── */}
      <CardHeaderSection
        icon={<Icon.list size={16} strokeWidth={2.2} />}
        label="Otras Secciones"
        tabs={[
          { id: 'debts',     label: 'Deudas',     badge: loading ? '…' : debts.length },
          { id: 'prestamos', label: 'Préstamos',   badge: loading ? '…' : prestamosRows.length },
        ]}
        activeTab={tab}
        onTabChange={id => setTab(id as 'debts' | 'prestamos')}
        darkMode={isDark}
      />

      {/* ── Resumen central clickeable ── */}
      {!loading && (
        <AmountCard
          key={tab}
          amount={summaryAmount}
          subtitle={summarySubtitle}
          tk={tk}
          isDark={isDark}
          color={isDebts ? DEBT_PAGO : PREST_COLORS[0]}
          onClick={() => setShowTable(true)}
        />
      )}

      {/* ── Sub-filtro deudas ── */}
      {!loading && isDebts && (
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 8px', flexShrink: 0 }}>
          {(['un_pago', 'cuotas'] as const).map(f => {
            const active = debtFilter === f;
            const count  = f === 'cuotas' ? debtsCuotas.length : debtsUnPago.length;
            return (
              <button key={f} onClick={() => setDebtFilter(f)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                border: `1px solid ${active ? tk.pillActBg : tk.pillInBrd}`,
                background: active ? tk.pillActBg : tk.pillInBg,
                color: active ? tk.pillActC : tk.pillInC,
                fontFamily: 'var(--font-ui), system-ui, sans-serif',
                transition: 'all .18s',
              }}>
                {f === 'cuotas' ? 'A cuotas' : 'Un pago'}
                <span style={{ fontSize: 9, fontWeight: 900, padding: '1px 5px', borderRadius: 6, background: active ? 'rgba(255,255,255,.22)' : 'rgba(17,24,39,0.08)', color: active ? tk.pillActC : tk.pillInC }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lista con scroll interno ── */}
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: 'auto',
        padding: loading ? '8px 14px 12px' : '0 14px 12px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${scrollThumb} transparent`,
      }}>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {[1,2,3,4].map(i => <SkeletonItem key={i} isDark={isDark} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && anyEmpty && <EmptyState message={emptyMsg} tk={tk} />}

        {/* Grid de ítems — Deudas */}
        {!loading && isDebts && !anyEmpty && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {deudaItems.map((d: DeudaRow) => {
              const color = d.tipoPago === 'cuotas' ? DEBT_CUOTA : DEBT_PAGO;
              const pct   = widgetPct(d);
              const pendientes = d.cuotasPendientes ? `${d.cuotasPendientes} cuotas pend.` : d.tipoPago || 'Deuda';
              return (
                <MiniItem
                  key={d.id}
                  tk={tk}
                  color={color}
                  initial={(d.nombre?.[0] ?? '?').toUpperCase()}
                  name={d.nombre}
                  sub={pendientes}
                  amount={d.cantidad ?? 0}
                  pct={pct}
                />
              );
            })}
          </div>
        )}

        {/* Grid de ítems — Préstamos */}
        {!loading && isPrestamos && !anyEmpty && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {prestamoItems.map((p: PrestamoRow, i) => {
              const color    = PREST_COLORS[i % 2];
              const faltante = p.cantidadFaltante ?? Math.max(0, (p.montoPrestamo ?? 0) - (p.montoPagado ?? 0));
              const pct      = p.montoPrestamo && p.montoPrestamo > 0
                ? Math.min(100, Math.round(((p.montoPagado ?? 0) / p.montoPrestamo) * 100))
                : 0;
              return (
                <MiniItem
                  key={p.id}
                  tk={tk}
                  color={color}
                  initial={(p.nombre?.[0] ?? '?').toUpperCase()}
                  name={p.nombre}
                  sub={p.cuentaBancaria || 'Sin cuenta'}
                  amount={faltante}
                  pct={pct}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {showTable && isDebts     && <DeudasModal onClose={() => setShowTable(false)} />}
      {showTable && isPrestamos && <PrestamosModal onClose={() => setShowTable(false)} canWrite={canWrite} />}
      {canWrite && showNew && isDebts && (
        <NewDeudaModal onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); fetchDeudas(); }} />
      )}
      {canWrite && showNew && isPrestamos && (
        <NewPrestamoModal onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); fetchPrestamos(); }} />
      )}
    </div>
  );
}
