'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { GastoDeudaRow, GastoUnicoRow } from '@/shared/types/finance.types';

const fmtFecha = formatNotionDate;

export function GastosModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [tab, setTab]         = React.useState<'unicos' | 'deudas'>('unicos');
  const [unicos, setUnicos]   = React.useState<GastoUnicoRow[]>([]);
  const [deudas, setDeudas]   = React.useState<GastoDeudaRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
    ]).then(([gu, gd]) => { setUnicos(gu); setDeudas(gd); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const totalUnicos = unicos.reduce((s, r) => s + (r.monto ?? 0), 0);
  const totalDeudas = deudas.reduce((s, r) => s + (r.montoGastado ?? 0), 0);
  const total = totalUnicos + totalDeudas;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,24,18,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}
    >
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center' }}>
            <Icon.arrowDown size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Gastos</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading ? 'Cargando...' : `${unicos.length + deudas.length} registros · Gastos Únicos + Gastos por Deudas`}
            </div>
          </div>
          {!loading && (unicos.length + deudas.length) > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 16 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.neg, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, marginTop: 2 }}>
                S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
          <button onClick={onClose} aria-label="Cerrar gastos" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>x</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: 24, flexShrink: 0 }}>
          {([
            { id: 'unicos' as const, label: 'Gastos Únicos',     count: unicos.length, subtotal: totalUnicos },
            { id: 'deudas' as const, label: 'Gastos por Deudas', count: deudas.length, subtotal: totalDeudas },
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>}
          {hasError && <div style={{ textAlign: 'center', padding: '48px 0', color: '#c83c3c', fontSize: 13 }}>No se pudieron cargar los datos. Verifica que el backend esté activo.</div>}

          {/* Tabla Gastos Únicos */}
          {!loading && !hasError && tab === 'unicos' && (
            unicos.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza desde la pantalla de Notion.</div>
              : <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                        {(['#', 'Nombre', 'Categoría', 'Cuenta Bancaria', 'Monto', 'Fecha'] as const).map((h, hi) => (
                          <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {unicos.map((row, i) => {
                        const bb = i < unicos.length - 1 ? `1px solid ${C.border}` : 'none';
                        return (
                          <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                            <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '-'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.categoriaGasto ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.categoriaGasto}</span> : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaBancaria ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span> : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.monto != null ? `S/ ${row.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>
                              {row.fecha ? fmtFecha(row.fecha) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Tabla Gastos por Deudas */}
          {!loading && !hasError && tab === 'deudas' && (
            deudas.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza desde la pantalla de Notion.</div>
              : <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                        {(['#', 'Nombre', 'Categoría', 'Cuenta Bancaria', 'Monto', '¿Cuál deuda?', 'Fecha'] as const).map((h, hi) => (
                          <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deudas.map((row, i) => {
                        const bb = i < deudas.length - 1 ? `1px solid ${C.border}` : 'none';
                        return (
                          <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                            <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '-'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.categoriaGasto ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.categoriaGasto}</span> : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaBancaria ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span> : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.montoGastado != null ? `S/ ${row.montoGastado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cualDeuda ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.warn}10`, border: `1px solid ${C.warn}22`, fontSize: 11.5, color: C.warn, fontWeight: 600 }}>{row.cualDeuda}</span> : '-'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>
                              {row.fecha ? fmtFecha(row.fecha) : '-'}
                            </td>
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

// ── Deudas Modal ─────────────────────────────────────────────────────────
