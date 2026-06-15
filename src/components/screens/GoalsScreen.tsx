'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { useGoals } from '@/shared/hooks/use-goals';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { GoalRow } from '@/shared/types/finance.types';

const FONT = 'var(--font-ui),system-ui,sans-serif';

const DarkCtx = React.createContext(false);

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(17,24,39,0.08)',
  borderRadius: 16,
  overflow: 'hidden',
};

function cardS(D: boolean): React.CSSProperties {
  return D ? {
    background: 'linear-gradient(145deg,#1A1D21,#16181C)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
  } : CARD;
}

const MODAL_BG: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// Colores y íconos predefinidos para las metas
const GOAL_COLORS = [
  { label: 'Verde',   value: '#3C7828' },
  { label: 'Ámbar',   value: '#d97706' },
  { label: 'Rojo',    value: '#B43232' },
  { label: 'Azul',    value: '#2563EB' },
  { label: 'Morado',  value: '#7C3AED' },
  { label: 'Negro',   value: '#111827' },
];

const GOAL_ICONS: { key: string; label: string; I: (p: { size?: number; strokeWidth?: number }) => React.ReactNode }[] = [
  { key: 'flame',   label: 'Llama',    I: Icon.flame   },
  { key: 'heart',   label: 'Corazón',  I: Icon.heart   },
  { key: 'target',  label: 'Objetivo', I: Icon.target  },
  { key: 'car',     label: 'Auto',     I: Icon.car     },
  { key: 'home',    label: 'Hogar',    I: Icon.home    },
  { key: 'bag',     label: 'Compra',   I: Icon.bag     },
  { key: 'book',    label: 'Educación',I: Icon.book    },
  { key: 'sparkles',label: 'Meta',     I: Icon.sparkles},
];

function iconFor(key: string) {
  return GOAL_ICONS.find(g => g.key === key)?.I ?? Icon.target;
}

function renderGoalIcon(key: string, props: { size?: number; strokeWidth?: number }) {
  return React.createElement(iconFor(key), props);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
}

function etaMeses(fechaFin: string | null | undefined, montoActual: number, montoMeta: number | null): string {
  if (!montoMeta || montoMeta <= 0) return '—';
  if (montoActual >= montoMeta) return 'Completado';
  if (!fechaFin) return '—';
  const meses = Math.max(0, Math.round((new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
  return meses <= 0 ? 'Vencido' : `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function montoFalta(g: GoalRow): number {
  return Math.max(0, (g.montoMeta ?? 0) - g.montoActual);
}

function pctGoal(g: GoalRow): number {
  if (!g.montoMeta || g.montoMeta <= 0) return 0;
  return Math.min(100, Math.round((g.montoActual / g.montoMeta) * 100));
}

function mensualRec(g: GoalRow): string {
  if (!g.montoMeta || !g.fechaFin) return '—';
  const meses = Math.max(1, Math.round((new Date(g.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
  const m = Math.ceil(montoFalta(g) / meses);
  return m > 0 ? `S/ ${m.toLocaleString('es-PE')}` : '—';
}

// ── KPI card — mismo patrón que AnalyticsScreen ──────────────────────────
function KpiCard({ label, value, sub, color, I, onEdit, onClick }: {
  label: string; value: string; sub?: string; color: string;
  I: (p: { size?: number; strokeWidth?: number }) => React.ReactNode;
  onEdit?: () => void;
  onClick?: () => void;
}) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        borderRadius: 16, overflow: 'hidden',
        background: D ? 'linear-gradient(145deg,#1A1D21,#16181C)' : '#FFFFFF',
        border: `1px solid ${hov ? (D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.15)') : (D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)')}`,
        boxShadow: hov ? (D ? '0 8px 28px rgba(0,0,0,.40)' : '0 8px 28px rgba(17,24,39,.10)') : 'none',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        padding: '13px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: FONT,
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(145deg,${color}22 0%,${color}0d 100%)`,
        border: `1.5px solid ${color}38`, color,
        display: 'grid', placeItems: 'center',
        boxShadow: `0 3px 10px ${color}22`,
      }}>
        <I size={18} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: -0.6, marginTop: 3, fontVariantNumeric: 'tabular-nums', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 3 }}>{sub}</div>}
      </div>
      {onEdit && (
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          style={{
            position: 'absolute', top: 9, right: 9,
            width: 22, height: 22, borderRadius: 7,
            background: hov ? (D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.07)') : 'transparent',
            border: '1px solid ' + (hov ? (D ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.12)') : 'transparent'),
            cursor: 'pointer', color: D ? 'rgba(255,255,255,0.45)' : C.textMute,
            display: 'grid', placeItems: 'center',
            transition: 'all 0.15s', padding: 0,
          }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Arc ring ─────────────────────────────────────────────────────────────
function ArcRing({ pct, color, size = 46, sw = 5 }: { pct: number; color: string; size?: number; sw?: number }) {
  const R    = (size - sw * 2) / 2;
  const cx   = size / 2;
  const circ = 2 * Math.PI * R;
  const dash = Math.max(0, Math.min(pct / 100, 1)) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, display: 'block' }}>
      <circle cx={cx} cy={cx} r={R} fill="none" stroke="rgba(17,24,39,0.08)" strokeWidth={sw} />
      {pct > 0 && (
        <circle cx={cx} cy={cx} r={R} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
        />
      )}
    </svg>
  );
}

// ── Distribución de ahorros ───────────────────────────────────────────────
function DistributionCard({ goals, totalSavings }: { goals: GoalRow[]; totalSavings: number }) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState<number | null>(null);
  const allocated = goals.filter(g => g.estado === 'activo').reduce((s, g) => s + g.montoActual, 0);
  const unalloc   = Math.max(0, totalSavings - allocated);
  const active    = goals.filter(g => g.estado === 'activo');
  const segs = [
    ...active.map(g => ({ label: g.nombre, value: g.montoActual, color: g.color, pct: totalSavings > 0 ? (g.montoActual / totalSavings) * 100 : 0 })),
    ...(unalloc > 0 ? [{ label: 'Sin asignar', value: unalloc, color: 'rgba(17,24,39,0.10)', pct: (unalloc / totalSavings) * 100 }] : []),
  ];
  const allocPct = totalSavings > 0 ? Math.round((allocated / totalSavings) * 100) : 0;

  return (
    <div style={{ ...cardS(D), padding: '13px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ flexShrink: 0, minWidth: 156 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 1 }}>Distribución de ahorros</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 3 }}>
            S/ {allocated.toLocaleString('es-PE')}
          </div>
          <div style={{ fontSize: 10.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 3 }}>
            {allocPct}% de S/ {totalSavings.toLocaleString('es-PE')}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', height: 10, borderRadius: 10, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            {segs.length === 0
              ? <div style={{ width: '100%', height: '100%', background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.07)', borderRadius: 10 }} />
              : segs.map((s, i) => (
                <div key={i}
                  onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                  style={{
                    width: `${s.pct}%`, height: '100%', background: s.color,
                    borderRadius: i === 0 ? '10px 0 0 10px' : i === segs.length - 1 ? '0 10px 10px 0' : '0',
                    opacity: hov === null || hov === i ? 1 : 0.35,
                    transition: 'opacity 0.15s', cursor: 'default', flexShrink: 0,
                  }}
                />
              ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {segs.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, opacity: hov === null || hov === i ? 1 : 0.35, transition: 'opacity 0.15s' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color === 'rgba(17,24,39,0.10)' ? (D ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.28)') : s.color }} />
                <span style={{ fontSize: 11, color: D ? 'rgba(255,255,255,0.50)' : C.textDim }}>{s.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, fontVariantNumeric: 'tabular-nums' }}>S/ {s.value.toLocaleString('es-PE')}</span>
                {s.pct >= 8 && <span style={{ fontSize: 10, fontWeight: 700, color: s.color === 'rgba(17,24,39,0.10)' ? (D ? 'rgba(255,255,255,0.38)' : C.textMute) : s.color }}>{Math.round(s.pct)}%</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Goal card ─────────────────────────────────────────────────────────────
function GoalCard({ g, onEdit }: { g: GoalRow; onEdit: (g: GoalRow) => void }) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState(false);
  const pct     = pctGoal(g);
  const falta   = montoFalta(g);
  const eta     = etaMeses(g.fechaFin, g.montoActual, g.montoMeta);
  const etaNum  = parseInt(eta);
  const etaCol  = g.estado === 'completado' || pct >= 100 ? C.pos : !isNaN(etaNum) && etaNum <= 3 ? '#d97706' : (D ? 'rgba(255,255,255,0.50)' : C.textDim);
  const color   = g.color;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...cardS(D),
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column',
        minHeight: 200,
        border: `1px solid ${hov ? (D ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.15)') : (D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)')}`,
        boxShadow: hov ? (D ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(17,24,39,0.08)') : 'none',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        position: 'relative',
      }}>

      {/* Botón editar */}
      {hov && (
        <button
          onClick={() => onEdit(g)}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: 8,
            background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)',
            border: `1px solid ${D ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.10)'}`,
            color: D ? 'rgba(255,255,255,0.50)' : C.textDim, display: 'grid', placeItems: 'center',
            cursor: 'pointer', transition: 'background 0.15s', fontFamily: FONT,
          }}>
          <Icon.edit size={12} strokeWidth={1.8} />
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
          <ArcRing pct={pct} color={color} size={46} />
          <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: `${color}1A`, color, display: 'grid', placeItems: 'center' }}>
            {renderGoalIcon(g.icono, { size: 14, strokeWidth: 2 })}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.3, lineHeight: 1.2 }}>{g.nombre}</div>
          <div style={{ fontSize: 10.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.calendar size={9} strokeWidth={1.8} />
            {g.fechaFin ? `Objetivo · ${fmtDate(g.fechaFin)}` : 'Sin fecha'}
          </div>
        </div>
        <div style={{ padding: '3px 9px', borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start', background: `${color}18`, border: `1px solid ${color}30`, fontSize: 11.5, fontWeight: 800, color }}>
          {pct}%
        </div>
      </div>

      {/* Monto */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 11 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.9, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          S/ {g.montoActual.toLocaleString('es-PE')}
        </span>
        <span style={{ fontSize: 12.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontVariantNumeric: 'tabular-nums' }}>
          / S/ {(g.montoMeta ?? 0).toLocaleString('es-PE')}
        </span>
      </div>

      {/* Barra */}
      <div style={{ height: 7, borderRadius: 10, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.07)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: `linear-gradient(90deg,${color}75,${color})` }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', paddingTop: 12, borderTop: `1px solid ${D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)'}`, marginBottom: 13 }}>
        {([
          { label: 'Mensual',    value: mensualRec(g),                             color: D ? 'rgba(255,255,255,0.88)' : C.text,  align: 'left'   as const },
          { label: 'ETA',        value: eta,                                        color: etaCol,                                  align: 'center' as const },
          { label: 'Falta',      value: `S/ ${falta.toLocaleString('es-PE')}`,     color: D ? 'rgba(255,255,255,0.88)' : C.text,  align: 'right'  as const },
        ]).map((s, i, arr) => (
          <React.Fragment key={i}>
            <div style={{ flex: 1, textAlign: s.align }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>{s.value}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, background: D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)', alignSelf: 'stretch', margin: '0 2px' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Nota */}
      {g.descripcion && (
        <div style={{ marginTop: 'auto', fontSize: 11, color: D ? 'rgba(255,255,255,0.50)' : C.textDim, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon.sparkles size={10} style={{ color, flexShrink: 0 }} />
          {g.descripcion}
        </div>
      )}
    </div>
  );
}

// ── Modal crear / editar ──────────────────────────────────────────────────
type ModalMode = 'create' | 'edit';

interface GoalModalProps {
  mode: ModalMode;
  initial?: Partial<GoalRow>;
  saving: boolean;
  onSave: (data: Partial<GoalRow>) => void;
  onClose: () => void;
  onDelete?: () => void;
}

function GoalModal({ mode, initial, saving, onSave, onClose, onDelete }: GoalModalProps) {
  const [nombre,      setNombre]      = React.useState(initial?.nombre      ?? '');
  const [descripcion, setDescripcion] = React.useState(initial?.descripcion ?? '');
  const [montoMeta,   setMontoMeta]   = React.useState(String(initial?.montoMeta ?? ''));
  const [montoActual, setMontoActual] = React.useState(String(initial?.montoActual ?? '0'));
  const [fechaFin,    setFechaFin]    = React.useState(initial?.fechaFin ? initial.fechaFin.slice(0, 10) : '');
  const [color,       setColor]       = React.useState(initial?.color ?? '#3C7828');
  const [icono,       setIcono]       = React.useState(initial?.icono ?? 'flame');
  const [confirmDel,  setConfirmDel]  = React.useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
    border: '1px solid rgba(17,24,39,0.14)', background: '#fff',
    fontFamily: FONT, color: C.text, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, display: 'block',
  };

  function handleSave() {
    if (!nombre.trim()) return;
    onSave({
      nombre:      nombre.trim(),
      descripcion: descripcion.trim(),
      montoMeta:   montoMeta   ? parseFloat(montoMeta)   : undefined,
      montoActual: montoActual ? parseFloat(montoActual) : 0,
      fechaFin:    fechaFin || undefined,
      color, icono,
      estado: 'activo',
    });
  }

  return (
    <div style={MODAL_BG} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22, padding: '28px 28px 24px',
          width: 440, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(17,24,39,0.18)', fontFamily: FONT,
        }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {renderGoalIcon(icono, { size: 17, strokeWidth: 2 })}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
              {mode === 'create' ? 'Nueva meta' : 'Editar meta'}
            </div>
            <div style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>
              {mode === 'create' ? 'Define tu próximo objetivo financiero' : 'Actualiza los detalles de tu objetivo'}
            </div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, display: 'grid', placeItems: 'center' }}>
            <Icon.plus size={16} strokeWidth={2} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Viaje a Japón" style={inputStyle} />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nota / descripción</label>
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Aportación recomendada, consejo…" style={inputStyle} />
        </div>

        {/* Montos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Meta (S/)</label>
            <input type="number" value={montoMeta} onChange={e => setMontoMeta(e.target.value)} placeholder="3000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ahorrado (S/)</label>
            <input type="number" value={montoActual} onChange={e => setMontoActual(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Fecha objetivo</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={inputStyle} />
        </div>

        {/* Icono */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Ícono</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {GOAL_ICONS.map(gi => {
              const active = icono === gi.key;
              return (
                <button key={gi.key} onClick={() => setIcono(gi.key)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? `${color}18` : 'rgba(17,24,39,0.04)',
                  border: `1.5px solid ${active ? color : 'rgba(17,24,39,0.10)'}`,
                  color: active ? color : C.textDim,
                  display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <gi.I size={15} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {GOAL_COLORS.map(gc => (
              <button key={gc.value} onClick={() => setColor(gc.value)} style={{
                width: 28, height: 28, borderRadius: 8, background: gc.value, cursor: 'pointer',
                border: `2.5px solid ${color === gc.value ? gc.value : 'transparent'}`,
                outline: color === gc.value ? `2px solid ${gc.value}40` : 'none',
                outlineOffset: 2, transition: 'all 0.15s',
              }} />
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          {mode === 'edit' && onDelete && !confirmDel && (
            <button onClick={() => setConfirmDel(true)} style={{
              fontSize: 12, fontWeight: 600, color: C.neg, background: `${C.neg}12`,
              border: `1px solid ${C.neg}25`, borderRadius: 10, padding: '8px 14px',
              cursor: 'pointer', fontFamily: FONT,
            }}>
              Eliminar
            </button>
          )}
          {confirmDel && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, color: C.textDim }}>¿Eliminar?</span>
              <button onClick={onDelete} style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: C.neg, border: 'none', borderRadius: 9, padding: '6px 12px', cursor: 'pointer', fontFamily: FONT }}>Sí</button>
              <button onClick={() => setConfirmDel(false)} style={{ fontSize: 12, fontWeight: 600, color: C.textDim, background: 'none', border: '1px solid rgba(17,24,39,0.12)', borderRadius: 9, padding: '6px 12px', cursor: 'pointer', fontFamily: FONT }}>No</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button onClick={onClose} style={{
              padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600,
              background: 'rgba(17,24,39,0.05)', border: '1px solid rgba(17,24,39,0.10)',
              color: C.textDim, cursor: 'pointer', fontFamily: FONT,
            }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !nombre.trim()} style={{
              padding: '10px 20px', borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: saving || !nombre.trim() ? 'rgba(17,24,39,0.08)' : C.primary,
              color: saving || !nombre.trim() ? C.textMute : '#fff',
              border: 'none', cursor: saving || !nombre.trim() ? 'default' : 'pointer',
              fontFamily: FONT, transition: 'background 0.15s',
            }}>
              {saving ? 'Guardando…' : mode === 'create' ? 'Crear meta' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plantillas de inicio rápido ───────────────────────────────────────────
const TEMPLATES: Partial<GoalRow>[] = [
  { nombre: 'Fondo de emergencia', descripcion: 'Cubre 6 meses de gastos', montoMeta: 10000, montoActual: 0, color: '#3C7828', icono: 'heart'    },
  { nombre: 'Viaje / Vacaciones',  descripcion: 'Tu próximo destino soñado', montoMeta: 3000,  montoActual: 0, color: '#111827', icono: 'flame'   },
  { nombre: 'Laptop nueva',        descripcion: 'Equipo de trabajo o hobby', montoMeta: 1500,  montoActual: 0, color: '#d97706', icono: 'book'    },
  { nombre: 'Vehículo propio',     descripcion: 'Meta a largo plazo',        montoMeta: 8000,  montoActual: 0, color: '#111827', icono: 'car'     },
  { nombre: 'Hogar / Reforma',     descripcion: 'Mejoras para tu espacio',   montoMeta: 5000,  montoActual: 0, color: '#3C7828', icono: 'home'    },
];

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ onCreate, onTemplate }: { onCreate: () => void; onTemplate: (t: Partial<GoalRow>) => void }) {
  const D = React.useContext(DarkCtx);
  const [hovTpl, setHovTpl] = React.useState<number | null>(null);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Hero */}
      <div style={{
        flex: 1, ...cardS(D),
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '28px 24px',
        background: D ? 'rgba(143,168,143,0.08)' : 'rgba(204,220,204,0.12)',
      }}>
        {/* Icono central decorativo */}
        <div style={{
          width: 64, height: 64, borderRadius: 20, marginBottom: 4,
          background: 'linear-gradient(145deg,#3C782822,#3C78280d)',
          border: '1.5px solid #3C782838',
          display: 'grid', placeItems: 'center', color: '#3C7828',
          boxShadow: '0 8px 24px #3C782820',
        }}>
          <Icon.target size={28} strokeWidth={1.75} />
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.4, textAlign: 'center' }}>
          Aún no tienes metas financieras
        </div>
        <div style={{ fontSize: 12.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textAlign: 'center', maxWidth: 340, lineHeight: 1.5 }}>
          Define objetivos, rastrea tu progreso y visualiza cómo tus ahorros se acercan a cada sueño.
        </div>

        <button
          onClick={onCreate}
          style={{
            marginTop: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 13,
            background: C.primary, color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 700, fontFamily: FONT,
            boxShadow: '0 4px 16px rgba(17,24,39,0.18)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
          <Icon.plus size={15} strokeWidth={2.5} />
          Crear primera meta
        </button>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 500, marginTop: 20 }}>
          <div style={{ flex: 1, height: 1, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)' }} />
          <span style={{ fontSize: 11, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
            O empieza con una plantilla
          </span>
          <div style={{ flex: 1, height: 1, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)' }} />
        </div>

        {/* Templates */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 620, marginTop: 4 }}>
          {TEMPLATES.map((t, i) => {
            const I = iconFor(t.icono ?? 'target');
            const color = t.color ?? C.pos;
            const isHov = hovTpl === i;
            return (
              <button
                key={i}
                onMouseEnter={() => setHovTpl(i)}
                onMouseLeave={() => setHovTpl(null)}
                onClick={() => onTemplate(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 14px', borderRadius: 12,
                  background: isHov ? `${color}14` : (D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)'),
                  border: `1px solid ${isHov ? `${color}35` : (D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.09)')}`,
                  cursor: 'pointer', fontFamily: FONT,
                  transform: isHov ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: isHov ? `0 4px 12px ${color}18` : 'none',
                  transition: 'all 0.15s',
                }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <I size={13} strokeWidth={2} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, lineHeight: 1.2 }}>{t.nombre}</div>
                  <div style={{ fontSize: 10.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 1 }}>
                    S/ {(t.montoMeta ?? 0).toLocaleString('es-PE')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Panel de plantillas en sidebar ────────────────────────────────────────
function TemplatesPanel({ onTemplate }: { onTemplate: (t: Partial<GoalRow>) => void }) {
  const D = React.useContext(DarkCtx);
  const [hov, setHov] = React.useState<number | null>(null);
  return (
    <div style={{ ...cardS(D), padding: '18px 20px', overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
        Plantillas rápidas
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEMPLATES.map((t, i) => {
          const I = iconFor(t.icono ?? 'target');
          const color = t.color ?? C.pos;
          const isHov = hov === i;
          return (
            <button
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onTemplate(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '11px 14px', borderRadius: 13, width: '100%', textAlign: 'left',
                background: isHov ? `${color}12` : (D ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.03)'),
                border: `1px solid ${isHov ? `${color}30` : (D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)')}`,
                cursor: 'pointer', fontFamily: FONT,
                transform: isHov ? 'translateX(2px)' : 'translateX(0)',
                transition: 'all 0.15s',
              }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: `${color}18`, color,
                display: 'grid', placeItems: 'center',
              }}>
                <I size={16} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</div>
                <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 2 }}>S/ {(t.montoMeta ?? 0).toLocaleString('es-PE')}</div>
              </div>
              <Icon.plus size={14} strokeWidth={2.5} style={{ color: isHov ? color : (D ? 'rgba(255,255,255,0.38)' : C.textMute), flexShrink: 0, transition: 'color 0.15s' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function SkeletonCard() {
  const D = React.useContext(DarkCtx);
  return (
    <div style={{ ...cardS(D), padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[80, 120, 60, 40].map((w, i) => (
        <div key={i} className="fz-skeleton" style={{ height: i === 0 ? 46 : i === 1 ? 30 : i === 2 ? 7 : 30, width: `${w}%`, borderRadius: 8 }} />
      ))}
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────
interface GoalsScreenProps { accent: string; darkMode?: boolean }

export function GoalsScreen({ accent: _accent, darkMode = false }: Readonly<GoalsScreenProps>) {
  const D = darkMode;
  const { goals, loading, saving, create, update, remove } = useGoals();
  const [totalSavings,      setTotalSavings]      = React.useState(0);
  const [thisMonthSaved,    setThisMonthSaved]    = React.useState<number | null>(null);
  const [savingsAccountName, setSavingsAccountName] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<{ mode: ModalMode; goal?: GoalRow; prefill?: Partial<GoalRow> } | null>(null);

  // Meta total global (editable, persistida en localStorage)
  const [globalMeta, setGlobalMeta] = React.useState<number>(() => {
    try { return Number(localStorage.getItem('finanzas_goal_meta_total') || '0'); }
    catch { return 0; }
  });
  const [editingMeta, setEditingMeta] = React.useState(false);
  const [metaInput,   setMetaInput]   = React.useState('');

  // Cuentas de ahorro: balance + depósitos este mes
  React.useEffect(() => {
    const now      = new Date();
    const thisYear = now.getFullYear();
    const thisMon  = now.getMonth(); // 0-indexed

    Promise.all([
      notionPaymentsService.getCuentasBancarias(),
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getTransferencias(),
    ]).then(([cuentas, ingresos, transferencias]) => {
      const ahorros = cuentas.filter(r =>
        r.tipo?.toLowerCase() === 'ahorro' && r.estado !== 'inactiva'
      );
      const nombresAhorro = new Set(ahorros.map(a => a.nombre));

      // Balance total de cuentas de ahorro
      setTotalSavings(ahorros.reduce((s, r) => s + (r.balance ?? r.saldo ?? 0), 0));
      if (ahorros.length > 0) setSavingsAccountName(ahorros[0].nombre);

      // Depósitos este mes: ingresos directos + transferencias entrantes a cuentas de ahorro
      const inMes = (fecha: string | null) => {
        if (!fecha) return false;
        const d = new Date(fecha);
        return d.getFullYear() === thisYear && d.getMonth() === thisMon;
      };

      const porIngresos = ingresos
        .filter(i => nombresAhorro.has(i.cuentaBancaria) && inMes(i.fecha))
        .reduce((s, i) => s + (i.ingreso ?? 0), 0);

      const porTransferencias = transferencias
        .filter(t => nombresAhorro.has(t.cuentaDestino) && inMes(t.fecha))
        .reduce((s, t) => s + (t.monto ?? 0), 0);

      setThisMonthSaved(porIngresos + porTransferencias);
    }).catch(() => {});
  }, []);

  function goToSavingsAccount() {
    if (!savingsAccountName) return;
    try { localStorage.setItem('florin:pending-account', savingsAccountName); } catch {}
    window.dispatchEvent(new CustomEvent('florin:navigate', { detail: { screen: 'cards' } }));
  }

  function openMetaEdit() {
    setMetaInput(String(globalMeta > 0 ? globalMeta : totalMeta));
    setEditingMeta(true);
  }
  function saveMetaEdit() {
    const v = Math.max(0, Number(metaInput.replace(/[^0-9.]/g, '')) || 0);
    try { localStorage.setItem('finanzas_goal_meta_total', String(v)); } catch {}
    setGlobalMeta(v);
    setEditingMeta(false);
  }

  const activos    = goals.filter(g => g.estado === 'activo');
  const completados = goals.filter(g => g.estado === 'completado');
  const totalMeta  = activos.reduce((s, g) => s + (g.montoMeta ?? 0), 0);

  function openCreate()                        { setModal({ mode: 'create' }); }
  function openTemplate(t: Partial<GoalRow>)   { setModal({ mode: 'create', prefill: t }); }
  function openEdit(g: GoalRow)                { setModal({ mode: 'edit', goal: g }); }
  function closeModal()                        { setModal(null); }

  async function handleSave(data: Partial<GoalRow>) {
    if (modal?.mode === 'create') {
      await create(data);
    } else if (modal?.goal) {
      await update(modal.goal.id, data);
    }
    closeModal();
  }

  async function handleDelete() {
    if (modal?.goal) {
      await remove(modal.goal.id);
      closeModal();
    }
  }

  const displaySlots = activos;

  const now = new Date();
  const mesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][now.getMonth()];

  return (
    <DarkCtx.Provider value={D}>
    <div style={{
      height: '100%', boxSizing: 'border-box',
      overflowY: 'auto', overflowX: 'hidden',
      padding: '28px 36px 32px',
      fontFamily: FONT,
      background: D ? 'transparent' : '#F5F5F7',
    }}>

      {/* Layout 3 columnas iguales: cards ocupan 2, sidebar ocupa 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        alignItems: 'start',
      }}>

        {/* ── Columna principal (ocupa 2 de 3) ─────────────── */}
        <div style={{ gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Título */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.6 }}>Objetivos</div>
            <div style={{ fontSize: 12.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 3 }}>{now.getFullYear()} · {mesNombre}</div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <KpiCard
              label={savingsAccountName ? `Total ahorrado (1 cuenta ahorro)` : 'Total ahorrado'}
              value={`S/ ${totalSavings.toLocaleString('es-PE')}`}
              color={C.pos} I={Icon.wallet}
              onClick={savingsAccountName ? goToSavingsAccount : undefined}
            />
            <KpiCard
              label="Meta total"
              value={`S/ ${(globalMeta > 0 ? globalMeta : totalMeta).toLocaleString('es-PE')}`}
              color="#d97706" I={Icon.target}
              onEdit={openMetaEdit}
            />
            <KpiCard
              label="Ahorro este mes"
              value={thisMonthSaved === null ? '—' : `S/ ${thisMonthSaved.toLocaleString('es-PE')}`}
              color={C.pos}
              I={Icon.trendUp}
            />
            <KpiCard
              label="Completadas"
              value={String(completados.length)}
              color={C.primary} I={Icon.shield}
            />
          </div>

          {/* Distribución */}
          <DistributionCard goals={activos} totalSavings={totalSavings} />

          {/* Metas activas o empty state */}
          {!loading && activos.length === 0
            ? <EmptyState onCreate={openCreate} onTemplate={openTemplate} />
            : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14,
                alignContent: 'start',
              }}>
                {loading
                  ? [0,1,2,3].map(i => <SkeletonCard key={i} />)
                  : displaySlots.map(g => <GoalCard key={g.id} g={g} onEdit={openEdit} />)
                }
              </div>
            )
          }

        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          position: 'sticky', top: 0,
        }}>

          {/* Completadas */}
          <div style={{ ...cardS(D), padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)'}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.pos}18`, color: C.pos, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon.check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.2 }}>Completadas</div>
                <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 1 }}>
                  {completados.length === 0 ? 'Ninguna aún' : `${completados.length} meta${completados.length !== 1 ? 's' : ''} · S/ ${completados.reduce((s,g) => s + g.montoActual, 0).toLocaleString('es-PE')}`}
                </div>
              </div>
            </div>
            {completados.length === 0 ? (
              <div style={{ padding: '14px 0 16px', textAlign: 'center', fontSize: 12.5, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontStyle: 'italic' }}>Sin metas completadas aún</div>
            ) : completados.slice(0, 4).map((g, i, arr) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${D ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.06)'}` : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${g.color}18`, color: g.color, display: 'grid', placeItems: 'center' }}>
                  {(() => { const I = iconFor(g.icono); return <I size={15} strokeWidth={2} />; })()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: D ? 'rgba(255,255,255,0.88)' : C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: C.pos, marginTop: 1, fontWeight: 600 }}>✓ Completada</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  S/ {g.montoActual.toLocaleString('es-PE')}
                </div>
              </div>
            ))}
          </div>

          {/* Progreso general */}
          {activos.length > 0 && (
            <div style={{ ...cardS(D), padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Progreso general</div>
              {activos.slice(0, 4).map((g, i, arr) => {
                const pct = pctGoal(g);
                return (
                  <div key={g.id} style={{ marginBottom: i < arr.length - 1 ? 14 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{g.nombre}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: g.color, flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 10, background: D ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.07)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: `linear-gradient(90deg,${g.color}70,${g.color})`, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Plantillas rápidas */}
          <TemplatesPanel onTemplate={openTemplate} />

        </div>

      </div>

      {/* Modal edición meta total */}
      {editingMeta && (
        <div style={MODAL_BG} onClick={() => setEditingMeta(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ ...cardS(D), width: 340, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.3 }}>Editar meta total</div>
              <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 3 }}>Define tu objetivo global de ahorro</div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 0.7 }}>Monto objetivo (S/)</label>
              <input
                autoFocus
                type="number"
                value={metaInput}
                onChange={e => setMetaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveMetaEdit()}
                placeholder="ej. 30000"
                style={{
                  width: '100%', marginTop: 6, padding: '10px 13px', boxSizing: 'border-box',
                  borderRadius: 11, border: `1.5px solid ${D ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.14)'}`,
                  background: D ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)', fontFamily: FONT,
                  fontSize: 16, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingMeta(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${D ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.12)'}`, background: 'transparent', cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: D ? 'rgba(255,255,255,0.50)' : C.textDim }}>
                Cancelar
              </button>
              <button onClick={saveMetaEdit} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#d97706', color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <GoalModal
          mode={modal.mode}
          initial={modal.goal ?? modal.prefill}
          saving={saving}
          onSave={handleSave}
          onClose={closeModal}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
        />
      )}
    </div>
    </DarkCtx.Provider>
  );
}
