'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DeudaRow } from '@/shared/types/finance.types';

const fmtFecha = formatNotionDate;
type DeudaModalRow = DeudaRow;

export function DeudasModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [rows, setRows]         = React.useState<DeudaModalRow[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [tab, setTab]           = React.useState<'deudas' | 'suscripciones'>('deudas');

  React.useEffect(() => {
    notionPaymentsService.getDeudasSuscripciones()
      .then((d: DeudaModalRow[]) => { setRows(d); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  }, []);
  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  const deudas        = rows.filter(r => r.tipoPago === 'Deuda');
  const suscripciones = rows.filter(r => r.tipoPago !== 'Deuda');
  const totalDeudas   = deudas.reduce((s, r) => s + (r.cantidad ?? 0), 0);
  const totalSusc     = suscripciones.reduce((s, r) => s + (r.cantidad ?? 0), 0);
  const activeRows    = tab === 'deudas' ? deudas : suscripciones;
  const headers       = ['#', 'Nombre', 'Estado', 'Fecha Inicio', 'Cantidad', 'Ciclo', 'Hay cuotas?', 'Monto Pagado', 'Cuotas Pend.'];

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,24,18,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 1040, maxHeight: '85vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui), system-ui, sans-serif', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon.cards size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Deudas / Suscripciones</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading ? 'Cargando...' : `${rows.length} registros · Deudas + Suscripciones`}
            </div>
          </div>
          {!loading && deudas.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 16 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total deudas</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.neg, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
                {`S/ ${totalDeudas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              </div>
            </div>
          )}
          <button onClick={onClose} aria-label="Cerrar deudas" style={{ width: 34, height: 34, borderRadius: 8, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300, flexShrink: 0 }}>x</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: 24, flexShrink: 0 }}>
          {([
            { id: 'deudas'        as const, label: 'Deudas',        count: deudas.length,        subtotal: totalDeudas },
            { id: 'suscripciones' as const, label: 'Suscripciones', count: suscripciones.length, subtotal: totalSusc   },
          ]).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.text : C.textMute, borderBottom: `2px solid ${active ? C.neg : 'transparent'}`, marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                <span style={{ fontSize: 11, background: active ? `${C.neg}18` : C.border, color: active ? C.neg : C.textMute, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{t.count}</span>
                {!loading && <span style={{ fontSize: 11, color: active ? C.neg : C.textMute, fontVariantNumeric: 'tabular-nums' }}>S/ {t.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>}
          {hasError && <div style={{ textAlign: 'center', padding: '48px 0', color: C.neg, fontSize: 13 }}>Error al cargar. Verifica el backend.</div>}
          {!loading && !hasError && (
            activeRows.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Sin datos en esta categoría.</div>
              : <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 880 }}>
                      <thead>
                        <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                          {headers.map((h, hi) => (
                            <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeRows.map((row, i) => {
                          const bb = i < activeRows.length - 1 ? `1px solid ${C.border}` : 'none';
                          return (
                            <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                              <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '-'}</td>
                              <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb, maxWidth: 220 }}>
                                <span title={row.estado} style={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, whiteSpace: 'normal', lineHeight: 1.35, fontSize: 11.5 }}>{row.estado || '-'}</span>
                              </td>
                              <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtFecha(row.fechaInicio)}</td>
                              <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>{row.cantidad != null ? `S/ ${row.cantidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}</td>
                              <td style={{ padding: '12px 16px', borderBottom: bb }}>
                                {row.ciclo ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.ciclo}</span> : '-'}
                              </td>
                              <td style={{ padding: '11px 16px', color: C.textDim, borderBottom: bb, textAlign: 'center' }}>{row.hayCuotas != null ? row.hayCuotas : '-'}</td>
                              <td style={{ padding: '11px 16px', color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>{row.montoPagado != null ? `S/ ${row.montoPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}</td>
                              <td style={{ padding: '11px 16px', color: (row.cuotasPendientes ?? 0) > 0 ? C.warn : C.pos, fontWeight: 700, borderBottom: bb, textAlign: 'center' }}>{row.cuotasPendientes != null ? row.cuotasPendientes : '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Suscripciones Modal ───────────────────────────────────────────────────
