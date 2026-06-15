'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCurrency, formatNullableCurrency, formatNotionDate } from '@/lib/format';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PrestamoRow } from '@/shared/types/finance.types';

const FONT  = 'var(--font-ui),system-ui,sans-serif';
const COLOR = C.neg;
const AMOUNT_COLOR = C.amount;

const fmtAmt = (n: number | null | undefined) =>
  formatNullableCurrency(n, '—');

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

// ── Shared styles ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
  padding: '0 10px', fontSize: 13, fontFamily: FONT, color: C.text,
  background: '#fff', boxSizing: 'border-box', outline: 'none', marginTop: 4,
};
const labelStyle: React.CSSProperties = {
  fontSize: 10.5, color: C.textMute, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT,
};
const cancelBtn: React.CSSProperties = {
  height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${C.border}`,
  background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 12.5,
  fontFamily: FONT, fontWeight: 500,
};
const saveBtn = (c: string): React.CSSProperties => ({
  height: 32, padding: '0 16px', borderRadius: 8, border: 'none',
  background: c, color: '#fff', cursor: 'pointer', fontSize: 12.5,
  fontFamily: FONT, fontWeight: 600,
});

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

// ── Edit state ────────────────────────────────────────────────────────────
interface FS { nombre: string; montoPrestamo: string; cuentaBancaria: string; fecha: string; }

const rowToFS = (r: PrestamoRow): FS => ({
  nombre:        r.nombre || '',
  montoPrestamo: r.montoPrestamo != null ? String(r.montoPrestamo) : '',
  cuentaBancaria: r.cuentaBancaria || '',
  fecha:         r.fecha ? String(r.fecha).slice(0, 10) : '',
});
const emptyFS = (): FS => ({ nombre: '', montoPrestamo: '', cuentaBancaria: '', fecha: new Date().toISOString().split('T')[0] });

// ── RowCard ───────────────────────────────────────────────────────────────
function RowCard({ row, color, onUpdated }: Readonly<{
  row: PrestamoRow; color: string; onUpdated: (r: PrestamoRow) => void;
}>) {
  const [editing, setEditing] = React.useState(false);
  const [form,    setForm]    = React.useState<FS>(emptyFS);
  const [saving,  setSaving]  = React.useState(false);
  const [hov,     setHov]     = React.useState(false);

  const faltante = row.cantidadFaltante ?? Math.max(0, (row.montoPrestamo ?? 0) - (row.montoPagado ?? 0));
  const pct      = row.montoPrestamo && row.montoPrestamo > 0
    ? Math.min(100, Math.round(((row.montoPagado ?? 0) / row.montoPrestamo) * 100))
    : 0;

  const startEdit = () => { setForm(rowToFS(row)); setEditing(true); };

  const save = async () => {
    setSaving(true);
    try {
      const body: Partial<PrestamoRow> = {
        nombre:         form.nombre.trim() || row.nombre,
        montoPrestamo:  form.montoPrestamo ? parseFloat(form.montoPrestamo) : null,
        cuentaBancaria: form.cuentaBancaria,
        fecha:          form.fecha ? `${form.fecha}T00:00:00Z` : null,
      };
      await notionPaymentsService.patchPrestamo(row.id, body);
      onUpdated({ ...row, ...body });
      setEditing(false);
    } catch { /* best-effort */ }
    setSaving(false);
  };

  const set = (k: keyof FS) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        border: `1px solid ${editing ? `${color}35` : hov ? 'rgba(17,24,39,.12)' : 'rgba(17,24,39,.07)'}`,
        background: editing ? `${color}06` : hov ? '#fafbf8' : '#fff',
        transition: 'all .15s', overflow: 'hidden',
      }}>

      {/* Fila principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
        {/* Avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: `linear-gradient(145deg, ${color}CC, ${color})`,
          color: '#fff', display: 'grid', placeItems: 'center',
          fontSize: 14, fontWeight: 800,
          boxShadow: `0 3px 8px ${color}40`,
        }}>
          {initial(row.nombre)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'nowrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.nombre || '—'}
            </span>
            {row.cuentaBancaria && (
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${color}18`, color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {row.cuentaBancaria}
              </span>
            )}
          </div>

          {/* Progreso de pago */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 6, background: 'rgba(17,24,39,.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: color, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 800, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {pct}%
            </span>
            {row.fecha && (
              <span style={{ fontSize: 10, color: C.textMute, flexShrink: 0 }}>
                {formatNotionDate(row.fecha)}
              </span>
            )}
          </div>
        </div>

        {/* Por cobrar */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: AMOUNT_COLOR, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
            {fmtAmt(faltante)}
          </div>
          {row.montoPrestamo != null && (
            <div style={{ fontSize: 10, color: C.textMute, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
              de {fmtAmt(row.montoPrestamo)}
            </div>
          )}
        </div>

        {/* Editar */}
        <button
          title="Editar"
          onClick={editing ? () => setEditing(false) : startEdit}
          style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${editing ? `${color}40` : 'rgba(17,24,39,.12)'}`, background: editing ? `${color}15` : 'transparent', color: editing ? color : C.textDim, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <PencilIcon />
        </button>
      </div>

      {/* Formulario inline */}
      {editing && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 1, background: `${color}20`, marginBottom: 2 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label>
              <span style={labelStyle}>Nombre</span>
              <input style={inputStyle} value={form.nombre} onChange={set('nombre')} />
            </label>
            <label>
              <span style={labelStyle}>Monto prestado (S/)</span>
              <input style={inputStyle} type="number" step="0.01" min="0" value={form.montoPrestamo} onChange={set('montoPrestamo')} />
            </label>
            <label>
              <span style={labelStyle}>Cuenta bancaria</span>
              <input style={inputStyle} value={form.cuentaBancaria} onChange={set('cuentaBancaria')} placeholder="Nombre de cuenta" />
            </label>
            <label>
              <span style={labelStyle}>Fecha</span>
              <input style={inputStyle} type="date" value={form.fecha} onChange={set('fecha')} />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
            <button onClick={() => setEditing(false)} style={cancelBtn}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ ...saveBtn(color), opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CreateForm ────────────────────────────────────────────────────────────
function CreateForm({ onCreated, onCancel }: Readonly<{ onCreated: () => void; onCancel: () => void }>) {
  const [form,   setForm]   = React.useState<FS>(emptyFS);
  const [saving, setSaving] = React.useState(false);
  const nombreRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { nombreRef.current?.focus(); }, []);

  const set = (k: keyof FS) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const create = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      await notionPaymentsService.createPrestamo({
        nombre:         form.nombre.trim(),
        montoPrestamo:  form.montoPrestamo ? parseFloat(form.montoPrestamo) : null,
        cuentaBancaria: form.cuentaBancaria,
        fecha:          form.fecha ? `${form.fecha}T00:00:00Z` : null,
      });
      onCreated();
    } catch { /* best-effort */ }
    setSaving(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') create();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{ borderRadius: 14, border: `1.5px dashed ${COLOR}45`, background: `${COLOR}05`, padding: '14px 14px 16px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: FONT }}>
        Nuevo préstamo
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label>
          <span style={labelStyle}>Nombre *</span>
          <input ref={nombreRef} style={inputStyle} value={form.nombre} onChange={set('nombre')} onKeyDown={onKey} placeholder="Ej. Préstamo Juan" />
        </label>
        <label>
          <span style={labelStyle}>Monto prestado (S/)</span>
          <input style={inputStyle} type="number" step="0.01" min="0" value={form.montoPrestamo} onChange={set('montoPrestamo')} onKeyDown={onKey} placeholder="0.00" />
        </label>
        <label>
          <span style={labelStyle}>Cuenta bancaria</span>
          <input style={inputStyle} value={form.cuentaBancaria} onChange={set('cuentaBancaria')} onKeyDown={onKey} placeholder="Nombre de cuenta" />
        </label>
        <label>
          <span style={labelStyle}>Fecha</span>
          <input style={inputStyle} type="date" value={form.fecha} onChange={set('fecha')} />
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={onCancel} style={cancelBtn}>Cancelar</button>
        <button onClick={create} disabled={saving || !form.nombre.trim()} style={{ ...saveBtn(COLOR), opacity: (saving || !form.nombre.trim()) ? 0.5 : 1 }}>
          {saving ? 'Creando...' : 'Crear préstamo'}
        </button>
      </div>
    </div>
  );
}

// ── PrestamosModal ────────────────────────────────────────────────────────
export function PrestamosModal({ onClose, canWrite = true }: Readonly<{ onClose: () => void; canWrite?: boolean }>) {
  const [rows,       setRows]       = React.useState<PrestamoRow[]>([]);
  const [loading,    setLoading]    = React.useState(true);
  const [hasError,   setHasError]   = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    notionPaymentsService.getPrestamos()
      .then((d: PrestamoRow[]) => { setRows(d); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, [load]);
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const totalFaltante = rows.reduce((s, r) => s + (r.cantidadFaltante ?? Math.max(0, (r.montoPrestamo ?? 0) - (r.montoPagado ?? 0))), 0);

  const handleUpdated = (upd: PrestamoRow) => setRows(rs => rs.map(r => r.id === upd.id ? upd : r));
  const handleCreated = () => { setShowCreate(false); load(); };

  return (
    <ModalShell onClose={onClose} maxWidth={680}>
      <div style={{
        background: '#fafbf8', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 680, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT, overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(17,24,39,.08)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${COLOR}18`, color: COLOR, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 20 }}>
            💸
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Préstamos</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 1 }}>
              {loading ? 'Cargando...' : `${rows.length} préstamo${rows.length !== 1 ? 's' : ''} registrado${rows.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Total por cobrar */}
          {!loading && rows.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 9.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Por cobrar</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: AMOUNT_COLOR, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totalFaltante)}
              </div>
            </div>
          )}

          {/* + Nuevo */}
          {canWrite && (
            <button
              onClick={() => setShowCreate(s => !s)}
              style={{
                height: 32, padding: '0 14px', borderRadius: 10,
                background: showCreate ? `${COLOR}18` : `${COLOR}0E`,
                border: `1px solid ${COLOR}30`,
                color: COLOR, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              }}>
              <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span>
              Nuevo
            </button>
          )}

          {/* Cerrar */}
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(17,24,39,.07)', border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 300, flexShrink: 0, fontFamily: 'system-ui,sans-serif' }}>
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          overflowY: 'auto', flex: 1, padding: '14px 18px 18px',
          scrollbarWidth: 'thin', scrollbarColor: `${COLOR}60 transparent`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {showCreate && (
            <CreateForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>
          )}
          {hasError && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: COLOR, fontSize: 13 }}>Error al cargar. Verifica el backend.</div>
          )}
          {!loading && !hasError && rows.length === 0 && !showCreate && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>
              Sin préstamos registrados.
            </div>
          )}
          {!loading && !hasError && rows.map(row => (
            <RowCard key={row.id} row={row} color={COLOR} onUpdated={handleUpdated} />
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

export { NewPrestamoModal } from './NewPrestamoModal';
