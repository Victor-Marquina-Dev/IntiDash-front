'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DeudaRow } from '@/shared/types/finance.types';

const fmtFecha = formatNotionDate;
type SuscripcionRow = DeudaRow;

export function SuscripcionesModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [rows, setRows]         = React.useState<SuscripcionRow[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    notionPaymentsService.getDeudasSuscripciones()
      .then((data: SuscripcionRow[]) => { setRows(data.filter(r => r.tipoPago !== 'Deuda')); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  }, []);
  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  const total = rows.reduce((s, r) => s + (r.cantidad ?? 0), 0);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,24,18,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 820, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center', fontSize: 20 }}>🔔</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Suscripciones</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading ? 'Cargando...' : `${rows.length} suscripción${rows.length !== 1 ? 'es' : ''} registrada${rows.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          {!loading && rows.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 16 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total mensual</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.neg, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, marginTop: 2 }}>
                S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>}
          {hasError && <div style={{ textAlign: 'center', padding: '48px 0', color: C.neg, fontSize: 13 }}>No se pudieron cargar los datos.</div>}
          {!loading && !hasError && rows.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Sin suscripciones registradas.</div>}
          {!loading && !hasError && rows.length > 0 && (
            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                    {(['#', 'Nombre', 'Cantidad', 'Ciclo', 'Fecha Inicio', 'Estado'] as const).map((h, hi) => (
                      <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const bb = i < rows.length - 1 ? `1px solid ${C.border}` : 'none';
                    return (
                      <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                        <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '-'}</td>
                        <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                          {row.cantidad != null ? `S/ ${row.cantidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: bb }}>
                          {row.ciclo ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.ciclo}</span> : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtFecha(row.fechaInicio ?? null)}</td>
                        <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb, fontSize: 12 }}>{row.estado || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Ingreso Modal ─────────────────────────────────────────────────────
