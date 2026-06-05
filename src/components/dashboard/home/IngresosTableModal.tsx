'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { IngresoRow } from '@/shared/types/finance.types';

const fmtFecha = formatNotionDate;

export function IngresosModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [rows, setRows]         = React.useState<IngresoRow[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    notionPaymentsService.getIngresos()
      .then((data: IngresoRow[]) => { setRows(data); setLoading(false); })
      .catch(() => { setHasError(true); setLoading(false); });
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const total = rows.reduce((s, r) => s + (r.ingreso ?? 0), 0);

  return (
    <ModalShell onClose={onClose} maxWidth={820}>
      <div style={{
        background: '#fafbf8',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 820,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-ui), system-ui, sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 14,
          flexShrink: 0,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${C.pos}18`, color: C.pos,
            display: 'grid', placeItems: 'center',
          }}>
            <Icon.arrowUp size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
              Ingresos
            </div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading
                ? 'Cargando...'
                : `${rows.length} registro${rows.length !== 1 ? 's' : ''} sincronizado${rows.length !== 1 ? 's' : ''} desde Notion`}
            </div>
          </div>
          {!loading && rows.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 16 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.pos, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, marginTop: 2 }}>
                S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Cerrar ingresos"
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: C.border, border: 'none',
              cursor: 'pointer', color: C.textDim,
              display: 'grid', placeItems: 'center',
              fontSize: 20, lineHeight: 1,
              fontFamily: 'system-ui, sans-serif', fontWeight: 300,
            }}
          >
            x
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>
              Cargando datos...
            </div>
          )}
          {hasError && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#c83c3c', fontSize: 13 }}>
              No se pudieron cargar los datos. Verifica que el backend esté activo.
            </div>
          )}
          {!loading && !hasError && rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>
              Sin datos. Sincroniza desde la pantalla de Notion primero.
            </div>
          )}
          {!loading && !hasError && rows.length > 0 && (
            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                    {(['#', 'Nombre', 'Ingreso', 'Categoría', 'Cuenta Bancaria', 'Fecha'] as const).map((h, hi) => (
                      <th key={h} style={{
                        padding: hi === 0 ? '10px 12px' : '10px 16px',
                        textAlign: hi === 0 ? 'center' : 'left',
                        fontSize: 10.5, fontWeight: 700, color: C.textDim,
                        textTransform: 'uppercase', letterSpacing: 0.8,
                        borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const borderBot = i < rows.length - 1 ? `1px solid ${C.border}` : 'none';
                    return (
                      <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                        <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: borderBot }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: borderBot }}>
                          {row.nombre || '-'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.pos, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: borderBot, whiteSpace: 'nowrap' }}>
                          {row.ingreso != null ? `S/ ${row.ingreso.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: borderBot }}>
                          {row.categoriaIngreso
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.pos}14`, border: `1px solid ${C.pos}22`, fontSize: 11.5, color: C.pos, fontWeight: 600 }}>{row.categoriaIngreso}</span>
                            : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: borderBot }}>
                          {row.cuentaBancaria
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span>
                            : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: borderBot, whiteSpace: 'nowrap', fontSize: 12 }}>
                          {row.fecha
                            ? fmtFecha(row.fecha)
                            : '-'}
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
    </ModalShell>
  );
}

// ── Gastos Modal ─────────────────────────────────────────────────────────
