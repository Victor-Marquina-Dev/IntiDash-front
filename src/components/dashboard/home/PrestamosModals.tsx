'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { Button, ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PrestamoRow } from '@/shared/types/finance.types';

const fmtFecha = formatNotionDate;


export type PrestamoWidgetRow = PrestamoRow;

function EditPrestamoModal({ row, cuentas, onClose, onSuccess }: Readonly<{
  row: PrestamoWidgetRow; cuentas: string[];
  onClose: () => void; onSuccess: (updated: PrestamoWidgetRow) => void;
}>) {
  const toDateInput = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getUTCFullYear(), m = String(d.getUTCMonth() + 1).padStart(2, '0'), dd = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  const [nombre, setNombre]         = React.useState(row.nombre);
  const [monto, setMonto]           = React.useState(row.montoPrestamo != null ? String(row.montoPrestamo) : '');
  const [cuenta, setCuenta]         = React.useState(row.cuentaBancaria);
  const [fecha, setFecha]           = React.useState(toDateInput(row.fecha));
  const [saving, setSaving]         = React.useState(false);
  const [error, setError]           = React.useState('');

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  async function handleSave() {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true); setError('');
    try {
      await notionPaymentsService.patchPrestamo(row.id, { nombre: nombre.trim(), montoPrestamo: monto ? Number(monto) : null, cuentaBancaria: cuenta, fecha: fecha || null });
      onSuccess({ ...row, nombre: nombre.trim(), montoPrestamo: monto ? Number(monto) : null, cuentaBancaria: cuenta, fecha: fecha ? `${fecha}T00:00:59Z` : null });
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error al guardar.'); setSaving(false); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' };

  return (
    <ModalShell onClose={onClose} maxWidth={420} zIndex={400}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Editar préstamo</div>
          <button onClick={onClose} aria-label="Cerrar edicion de prestamo" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Nombre *</div>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Monto prestado</div>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Cuenta bancaria</div>
            {cuentas.length > 0 ? (
              <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={inp}>
                <option value="">— Sin cuenta —</option>
                {cuentas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={cuenta} onChange={e => setCuenta(e.target.value)} placeholder="Nombre de cuenta" style={inp} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Fecha</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
          </div>
          {error && <div style={{ fontSize: 12, color: C.neg, padding: '6px 10px', background: `${C.neg}10`, borderRadius: 7 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button ghost onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button primary onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export function PrestamosModal({ onClose, canWrite = true }: Readonly<{ onClose: () => void; canWrite?: boolean }>) {
  const [rows, setRows]             = React.useState<PrestamoWidgetRow[]>([]);
  const [loading, setLoading]       = React.useState(true);
  const [hasError, setHasError]     = React.useState(false);
  const [editRow, setEditRow]       = React.useState<PrestamoWidgetRow | null>(null);
  const [cuentas, setCuentas]       = React.useState<string[]>([]);

  const load = () => {
    notionPaymentsService.getPrestamos()
      .then((data: PrestamoWidgetRow[]) => { setRows(data); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  };

  React.useEffect(() => {
    load();
    notionPaymentsService.getOptions()
      .then((d: { cuentasBancarias?: string[] }) => { if (d.cuentasBancarias) setCuentas(d.cuentasBancarias); })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !editRow) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, editRow]);

  const totalPrestamo = rows.reduce((s, r) => s + (r.montoPrestamo ?? 0), 0);
  const totalPagado   = rows.reduce((s, r) => s + (r.montoPagado ?? 0), 0);
  const totalFaltante = rows.reduce((s, r) => s + (r.cantidadFaltante ?? ((r.montoPrestamo ?? 0) - (r.montoPagado ?? 0))), 0);
  const emptyMessage = canWrite ? 'Sin prestamos. Sincroniza desde Ajustes.' : 'Sin prestamos para mostrar.';

  return (
    <>
      <ModalShell onClose={onClose} maxWidth={820}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 820, maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Préstamos</div>
              <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>
                {rows.length} registros · por cobrar{' '}
                <span style={{ color: C.neg, fontWeight: 600 }}>S/ {totalFaltante.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Cerrar prestamos" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4, fontSize: 16 }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && <div style={{ padding: 40, textAlign: 'center', color: C.textMute, fontSize: 13 }}>Cargando...</div>}
            {hasError && <div style={{ padding: 40, textAlign: 'center', color: C.neg, fontSize: 13 }}>Error al cargar datos.</div>}
            {!loading && !hasError && rows.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: C.textMute, fontSize: 13 }}>{emptyMessage}</div>
            )}
            {!loading && !hasError && rows.length > 0 && (
              <div style={{ borderRadius: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                        {['#', 'Nombre', 'Cuenta Bancaria', 'Fecha', 'Monto Prestado', 'Monto Pagado', 'Por Cobrar', ...(canWrite ? [''] : [])].map((h, hi) => (
                          <th key={hi} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const faltante = r.cantidadFaltante ?? ((r.montoPrestamo ?? 0) - (r.montoPagado ?? 0));
                        const pct = r.montoPrestamo && r.montoPrestamo > 0 ? Math.min(100, Math.round((r.montoPagado ?? 0) / r.montoPrestamo * 100)) : 0;
                        const bb = i < rows.length - 1 ? `1px solid ${C.border}` : 'none';
                        return (
                          <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                            <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{r.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {r.cuentaBancaria
                                ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, color: C.textDim, fontSize: 11.5, fontWeight: 500 }}>{r.cuentaBancaria}</span>
                                : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{r.fecha ? fmtFecha(r.fecha) : '—'}</td>
                            <td style={{ padding: '12px 16px', color: C.text, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {r.montoPrestamo != null ? `S/ ${r.montoPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                  {r.montoPagado != null ? `S/ ${r.montoPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                                </span>
                                {r.montoPrestamo != null && r.montoPrestamo > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
                                      <div style={{ width: `${pct}%`, height: '100%', background: C.pos, borderRadius: 2 }} />
                                    </div>
                                    <span style={{ fontSize: 10, color: C.pos, fontWeight: 600, flexShrink: 0 }}>{pct}%</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', background: faltante > 0 ? `${C.neg}10` : `${C.pos}10`, border: `1px solid ${faltante > 0 ? `${C.neg}22` : `${C.pos}22`}`, color: faltante > 0 ? C.neg : C.pos }}>
                                S/ {faltante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            {canWrite && (
                              <td style={{ padding: '12px 10px', borderBottom: bb }}>
                                <button
                                  onClick={() => setEditRow(r)}
                                  aria-label="Editar prestamo"
                                  title="Editar"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color .15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = C.olive)}
                                  onMouseLeave={e => (e.currentTarget.style.color = C.textMute)}
                                >
                                  <Icon.edit size={15} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'rgba(63,86,28,0.04)', borderTop: `2px solid ${C.border}` }}>
                        <td colSpan={4} style={{ padding: '10px 16px', fontWeight: 700, color: C.text, fontSize: 12 }}>Total</td>
                        <td style={{ padding: '10px 16px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>S/ {totalPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: C.pos, fontVariantNumeric: 'tabular-nums' }}>S/ {totalPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td colSpan={canWrite ? 2 : 1} style={{ padding: '10px 16px', fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums' }}>S/ {totalFaltante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalShell>

      {canWrite && editRow && (
        <EditPrestamoModal
          row={editRow}
          cuentas={cuentas}
          onClose={() => setEditRow(null)}
          onSuccess={updated => {
            setRows(prev => prev.map(r => r.id === updated.id ? updated : r));
            setEditRow(null);
          }}
        />
      )}
    </>
  );
}

export { NewPrestamoModal } from './NewPrestamoModal';
