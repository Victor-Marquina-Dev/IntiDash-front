'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatCurrency, formatNullableCurrency, formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DeudaRow, GastoDeudaRow } from '@/shared/types/finance.types';

const FONT  = 'var(--font-ui),system-ui,sans-serif';
const COLOR = C.neg;   // rojo para deudas

const fmtAmt = (n: number | null | undefined) =>
  formatNullableCurrency(n, '—');

function buildStatusLine(r: DeudaRow): { icon: string; text: string; color: string } {
  const cuotas = r.cuotasPendientes ?? 0;
  const estado = (r.estado || '').toLowerCase();
  const desde  = r.fechaInicio ? ` · desde ${formatNotionDate(r.fechaInicio)}` : '';
  if (cuotas > 0) return { icon: '⏳', text: `${cuotas} cuotas pendientes${desde}`, color: C.warn };
  if (estado.includes('vencido') || estado.includes('pendiente'))
    return { icon: '⚠️', text: `${r.estado}${desde}`, color: C.neg };
  if (estado.includes('pagado') || estado.includes('al día') || estado.includes('al dia'))
    return { icon: '✅', text: `${r.estado}${desde}`, color: C.pos };
  if (!r.fechaInicio) return { icon: '', text: 'Falta fecha de inicio', color: C.textMute };
  return { icon: '', text: `desde ${formatNotionDate(r.fechaInicio)}`, color: C.textMute };
}

const rowColor = (r: DeudaRow) =>
  r.tipoPago === 'cuotas' ? C.warn : C.neg;

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
const actionBtn = (active: boolean, color: string = C.textDim): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 7,
  border: `1px solid ${active ? `${color}40` : 'rgba(17,24,39,.12)'}`,
  background: active ? `${color}15` : 'transparent',
  color: active ? color : C.textDim,
  cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
  transition: 'all .15s',
});

// ── Inline SVG icons ──────────────────────────────────────────────────────
function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

// ── Edit / Create state types ─────────────────────────────────────────────
interface FS { nombre: string; cantidad: string; tipoPago: string; fechaInicio: string; }
const emptyFS   = (): FS => ({ nombre: '', cantidad: '', tipoPago: 'un_pago', fechaInicio: '' });
const rowToFS   = (r: DeudaRow): FS => ({
  nombre:     r.nombre || '',
  cantidad:   r.cantidad != null ? String(r.cantidad) : '',
  tipoPago:   r.tipoPago || 'un_pago',
  fechaInicio: r.fechaInicio ? String(r.fechaInicio).slice(0, 10) : '',
});

// ── Fila de tabla (con edición / historial expandibles) ────────────────────
function DeudaTableRow({ row, index, isLast, gastosDeudas, onUpdated, onDeleted }: Readonly<{
  row: DeudaRow;
  index: number;
  isLast: boolean;
  gastosDeudas: GastoDeudaRow[];
  onUpdated: (r: DeudaRow) => void;
  onDeleted: (id: string) => void;
}>) {
  const [editing,     setEditing]     = React.useState(false);
  const [form,        setForm]        = React.useState<FS>(emptyFS);
  const [saving,      setSaving]      = React.useState(false);
  const [confirmDel,  setConfirmDel]  = React.useState(false);
  const [deleting,    setDeleting]    = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  const history = gastosDeudas
    .filter(g => (g.cualDeuda || '').toLowerCase() === (row.nombre || '').toLowerCase())
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  const color = rowColor(row);
  const { icon, text, color: stColor } = buildStatusLine(row);
  const expanded = editing || showHistory;
  const rowBg = index % 2 === 0 ? '#fff' : 'rgba(180,50,50,0.014)';
  const bb = isLast && !expanded ? 'none' : `1px solid ${C.border}`;

  const startEdit = () => { setForm(rowToFS(row)); setEditing(true); setShowHistory(false); setConfirmDel(false); };

  const save = async () => {
    setSaving(true);
    try {
      const body: Partial<DeudaRow> = {
        nombre:     form.nombre.trim() || row.nombre,
        cantidad:   form.cantidad ? parseFloat(form.cantidad) : null,
        tipoPago:   form.tipoPago || undefined,
        fechaInicio: form.fechaInicio || null,
      };
      await notionPaymentsService.updateDeudaSuscripcion(row.id, body);
      onUpdated({ ...row, ...body });
      setEditing(false);
    } catch { /* best-effort */ }
    setSaving(false);
  };

  const del = async () => {
    setDeleting(true);
    try {
      await notionPaymentsService.deleteDeudaSuscripcion(row.id);
      onDeleted(row.id);
    } catch { /* best-effort */ }
    setDeleting(false);
  };

  const set = (k: keyof FS) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const tdBase: React.CSSProperties = { padding: '12px 16px', borderBottom: bb, verticalAlign: 'middle' };

  return (
    <>
      <tr style={{ background: rowBg }}>
        <td style={{ ...tdBase, padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5 }}>{index + 1}</td>
        <td style={{ ...tdBase, fontWeight: 600, color: C.text }}>{row.nombre || '—'}</td>
        <td style={tdBase}>
          {row.tipoPago
            ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${color}12`, border: `1px solid ${color}26`, fontSize: 11.5, color, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.tipoPago}</span>
            : '—'}
        </td>
        <td style={{ ...tdBase, color, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {fmtAmt(row.cantidad)}
        </td>
        <td style={{ ...tdBase, color: stColor, fontSize: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {icon && <span style={{ fontSize: 11 }}>{icon}</span>}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{text}</span>
          </span>
        </td>
        <td style={{ ...tdBase, whiteSpace: 'nowrap', textAlign: 'right' }}>
          {!confirmDel ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button title={showHistory ? 'Ocultar pagos' : 'Ver pagos'} onClick={() => { setShowHistory(h => !h); setEditing(false); }} style={actionBtn(showHistory, color)}>
                <span style={{ fontSize: 10 }}>{showHistory ? '▲' : '▼'}</span>
              </button>
              <button title="Editar" onClick={editing ? () => setEditing(false) : startEdit} style={actionBtn(editing, color)}>
                <PencilIcon />
              </button>
              <button title="Eliminar" onClick={() => { setConfirmDel(true); setEditing(false); setShowHistory(false); }} style={actionBtn(false)}>
                <CloseIcon />
              </button>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: C.textMute }}>¿Eliminar?</span>
              <button onClick={() => setConfirmDel(false)} style={cancelBtn}>No</button>
              <button onClick={del} disabled={deleting} style={{ ...saveBtn(C.neg), opacity: deleting ? 0.7 : 1 }}>
                {deleting ? '...' : 'Sí'}
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Fila expandible: edición */}
      {editing && (
        <tr style={{ background: `${color}05` }}>
          <td colSpan={6} style={{ padding: '4px 16px 16px', borderBottom: bb }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <span style={labelStyle}>Nombre</span>
                  <input style={inputStyle} value={form.nombre} onChange={set('nombre')} />
                </label>
                <label>
                  <span style={labelStyle}>Cantidad (S/)</span>
                  <input style={inputStyle} type="number" step="0.01" min="0" value={form.cantidad} onChange={set('cantidad')} />
                </label>
                <label>
                  <span style={labelStyle}>Tipo de pago</span>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.tipoPago} onChange={set('tipoPago')}>
                    <option value="cuotas">Cuotas</option>
                    <option value="un_pago">Un pago</option>
                    <option value="Deuda">Deuda</option>
                  </select>
                </label>
                <label>
                  <span style={labelStyle}>Fecha inicio</span>
                  <input style={inputStyle} type="date" value={form.fechaInicio} onChange={set('fechaInicio')} />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setEditing(false)} style={cancelBtn}>Cancelar</button>
                <button onClick={save} disabled={saving} style={{ ...saveBtn(color), opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Fila expandible: historial de pagos */}
      {showHistory && (
        <tr style={{ background: `${color}04` }}>
          <td colSpan={6} style={{ padding: '4px 16px 14px', borderBottom: bb }}>
            <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8, fontFamily: FONT }}>
              Historial de pagos {history.length > 0 && `· ${history.length} registro${history.length !== 1 ? 's' : ''}`}
            </div>
            {history.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textMute, fontFamily: FONT, padding: '4px 0' }}>Sin pagos registrados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {history.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: '#fff', border: `1px solid ${color}14` }}>
                    <span style={{ fontSize: 11.5, color: C.textMute, fontFamily: FONT, flexShrink: 0, minWidth: 80 }}>
                      {g.fecha ? formatNotionDate(g.fecha) : '—'}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: C.textDim, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.cuentaBancaria || '—'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, flexShrink: 0 }}>
                      {fmtAmt(g.montoGastado)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ── CreateForm ────────────────────────────────────────────────────────────
function CreateForm({ onCreated, onCancel }: Readonly<{ onCreated: () => void; onCancel: () => void }>) {
  const [form,   setForm]   = React.useState<FS>({ nombre: '', cantidad: '', tipoPago: 'un_pago', fechaInicio: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = React.useState(false);
  const nombreRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { nombreRef.current?.focus(); }, []);

  const set = (k: keyof FS) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const create = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      await notionPaymentsService.createDeudaSuscripcion({
        nombre:     form.nombre.trim(),
        cantidad:   form.cantidad ? parseFloat(form.cantidad) : undefined,
        tipoPago:   form.tipoPago,
        fechaInicio: form.fechaInicio || undefined,
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
    <div style={{ borderRadius: 14, border: `1.5px dashed ${COLOR}45`, background: `${COLOR}05`, padding: '14px 14px 16px', marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: FONT }}>
        Nueva deuda
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label>
          <span style={labelStyle}>Nombre *</span>
          <input ref={nombreRef} style={inputStyle} value={form.nombre} onChange={set('nombre')} onKeyDown={onKey} placeholder="Ej. Tarjeta BBVA" />
        </label>
        <label>
          <span style={labelStyle}>Cantidad (S/)</span>
          <input style={inputStyle} type="number" step="0.01" min="0" value={form.cantidad} onChange={set('cantidad')} onKeyDown={onKey} placeholder="0.00" />
        </label>
        <label>
          <span style={labelStyle}>Tipo de pago</span>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.tipoPago} onChange={set('tipoPago')}>
            <option value="cuotas">Cuotas</option>
            <option value="un_pago">Un pago</option>
            <option value="Deuda">Deuda</option>
          </select>
        </label>
        <label>
          <span style={labelStyle}>Fecha inicio</span>
          <input style={inputStyle} type="date" value={form.fechaInicio} onChange={set('fechaInicio')} />
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={onCancel} style={cancelBtn}>Cancelar</button>
        <button onClick={create} disabled={saving || !form.nombre.trim()} style={{ ...saveBtn(COLOR), opacity: (saving || !form.nombre.trim()) ? 0.5 : 1 }}>
          {saving ? 'Creando...' : 'Crear deuda'}
        </button>
      </div>
    </div>
  );
}

// ── DeudasModal (export) ──────────────────────────────────────────────────
export function DeudasModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [rows,          setRows]          = React.useState<DeudaRow[]>([]);
  const [gastosDeudas,  setGastosDeudas]  = React.useState<GastoDeudaRow[]>([]);
  const [loading,       setLoading]       = React.useState(true);
  const [hasError,      setHasError]      = React.useState(false);
  const [showCreate,    setShowCreate]    = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      notionPaymentsService.getDeudasSuscripciones(),
      notionPaymentsService.getGastosDeudas(),
    ]).then(([d, gastos]: [DeudaRow[], GastoDeudaRow[]]) => {
        const deudas = d.filter(r => {
          const tp = (r.tipoPago || '').toLowerCase();
          return tp !== 'suscripción' && tp !== 'suscripcion' && tp !== 'subscription';
        });
        setRows(deudas);
        setGastosDeudas(gastos);
        setLoading(false);
      })
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

  const total = rows.reduce((s, r) => s + (r.cantidad ?? 0), 0);

  const handleCreated = () => { setShowCreate(false); load(); };
  const handleUpdated = (upd: DeudaRow) => setRows(rs => rs.map(r => r.id === upd.id ? upd : r));
  const handleDeleted = (id: string)    => setRows(rs => rs.filter(r => r.id !== id));

  return (
    <ModalShell onClose={onClose} maxWidth={900}>
      <div style={{
        background: '#fafbf8', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 900, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT, overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${COLOR}18`, color: COLOR, display: 'grid', placeItems: 'center' }}>
            <Icon.cards size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Deudas</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading ? 'Cargando...' : `${rows.length} deuda${rows.length !== 1 ? 's' : ''} registrada${rows.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Total */}
          {!loading && rows.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 12 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total pendiente</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLOR, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, marginTop: 2 }}>
                {formatCurrency(total)}
              </div>
            </div>
          )}

          {/* + Nueva */}
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
            Nueva
          </button>

          {/* Cerrar */}
          <button onClick={onClose} aria-label="Cerrar deudas" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>x</button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, scrollbarWidth: 'thin', scrollbarColor: `${COLOR}60 transparent` }}>

          {showCreate && (
            <CreateForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
          )}

          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>}
          {hasError && <div style={{ textAlign: 'center', padding: '48px 0', color: COLOR, fontSize: 13 }}>No se pudieron cargar los datos. Verifica que el backend esté activo.</div>}
          {!loading && !hasError && rows.length === 0 && !showCreate && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Sin deudas registradas.</div>
          )}

          {!loading && !hasError && rows.length > 0 && (
            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(180,50,50,0.04)' }}>
                    {(['#', 'Nombre', 'Tipo', 'Monto', 'Estado', ''] as const).map((h, hi) => (
                      <th key={h || 'acc'} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : (hi === 5 ? 'right' : 'left'), fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <DeudaTableRow
                      key={row.id}
                      row={row}
                      index={i}
                      isLast={i === rows.length - 1}
                      gastosDeudas={gastosDeudas}
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
