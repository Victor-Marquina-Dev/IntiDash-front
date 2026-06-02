'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Delta, Button, Eyebrow, SubKpi } from '@/components/ui';
import { Sparkline, DualAreaChart, Donut, PairedBars, ProgressBar, RadialProgress } from '@/components/charts';
import { ALL_TX } from '@/lib/mock-data';
import { useBreakpoint, type BP } from '@/lib/breakpoints';
import type { Tweaks } from '@/components/tweaks';

// ── Hero balance ─────────────────────────────────────────────────────────
function HeroBalance({ bp }: { bp: BP }) {
  const isDesktop = bp === 'desktop';
  const numSize  = bp === 'desktop' ? 62 : 44;
  const prefSize = bp === 'desktop' ? 36 : 26;
  const decSize  = bp === 'desktop' ? 34 : 24;
  return (
    <Card pad={30} style={{ gridColumn: isDesktop ? 'span 6' : 'span 12', justifyContent: 'center' }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Eyebrow icon={<Icon.wallet size={12} />}>
          Balance total · todas las cuentas
        </Eyebrow>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: numSize, fontWeight: 700, color: C.text,
            letterSpacing: -2.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{ color: C.textDim, fontWeight: 500, marginRight: 3, fontSize: prefSize, letterSpacing: -1 }}>S/</span>
            12,840
            <span style={{ color: C.textMute, fontSize: decSize, fontWeight: 400, letterSpacing: -1 }}>.50</span>
          </div>
          <Tag dot={C.pos} color={C.pos} bg={`${C.pos}18`} style={{ fontSize: 12, fontWeight: 500, padding: '4px 11px' }}>
            ↑ 4.2% este mes
          </Tag>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: bp === 'mobile' ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: 24, marginTop: 28, width: '100%',
        }}>
          <SubKpi label="Cambio mensual"  value="+S/ 520.30" pos />
          <SubKpi label="Cuentas activas" value="3" />
          {bp !== 'mobile' && <SubKpi label="Sincronización" value="hace 5 min" muted />}
        </div>
      </div>
    </Card>
  );
}

function fmtFecha(fecha: string | null): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (d.getUTCSeconds() === 59) return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Ingresos Modal ───────────────────────────────────────────────────────
const BACK_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface IngresoRow {
  id: string;
  nombre: string;
  ingreso: number | null;
  categoriaIngreso: string;
  cuentaBancaria: string;
  fecha: string | null;
}

function IngresosModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows]         = React.useState<IngresoRow[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    fetch(`${BACK_URL}/notion-payments/ingresos`)
      .then(r => r.ok ? r.json() : Promise.reject())
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
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(20,24,18,0.5)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: '#fafbf8',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 820,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
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
                ? 'Cargando…'
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
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: C.border, border: 'none',
              cursor: 'pointer', color: C.textDim,
              display: 'grid', placeItems: 'center',
              fontSize: 20, lineHeight: 1,
              fontFamily: 'system-ui, sans-serif', fontWeight: 300,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>
              Cargando datos…
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
                          {row.nombre || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.pos, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: borderBot, whiteSpace: 'nowrap' }}>
                          {row.ingreso != null ? `S/ ${row.ingreso.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: borderBot }}>
                          {row.categoriaIngreso
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.pos}14`, border: `1px solid ${C.pos}22`, fontSize: 11.5, color: C.pos, fontWeight: 600 }}>{row.categoriaIngreso}</span>
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: borderBot }}>
                          {row.cuentaBancaria
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span>
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: borderBot, whiteSpace: 'nowrap', fontSize: 12 }}>
                          {row.fecha
                            ? fmtFecha(row.fecha)
                            : '—'}
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

// ── Gastos Modal ─────────────────────────────────────────────────────────
interface GastoUnicoRow  { id: string; nombre: string; categoriaGasto: string; cuentaBancaria: string; monto: number | null; fecha: string | null; }
interface GastoDeudaRow  { id: string; nombre: string; categoriaGasto: string; cuentaBancaria: string; montoGastado: number | null; cualDeuda: string; fecha: string | null; }

function GastosModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab]         = React.useState<'unicos' | 'deudas'>('unicos');
  const [unicos, setUnicos]   = React.useState<GastoUnicoRow[]>([]);
  const [deudas, setDeudas]   = React.useState<GastoDeudaRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetch(`${BACK_URL}/notion-payments/gastos-unicos`).then(r => r.ok ? r.json() : []),
      fetch(`${BACK_URL}/notion-payments/gastos-deudas`).then(r => r.ok ? r.json() : []),
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
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center' }}>
            <Icon.arrowDown size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Gastos</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>
              {loading ? 'Cargando…' : `${unicos.length + deudas.length} registros · Gastos Únicos + Gastos por Deudas`}
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
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: 24, flexShrink: 0 }}>
          {([
            { id: 'unicos' as const, label: 'Gastos Únicos',     count: unicos.length, subtotal: totalUnicos },
            { id: 'deudas' as const, label: 'Gastos por Deudas', count: deudas.length, subtotal: totalDeudas },
          ]).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.text : C.textMute, borderBottom: `2px solid ${active ? C.neg : 'transparent'}`, marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                <span style={{ fontSize: 11, background: active ? `${C.neg}18` : C.border, color: active ? C.neg : C.textMute, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{t.count}</span>
                {!loading && <span style={{ fontSize: 11, color: active ? C.neg : C.textMute, fontVariantNumeric: 'tabular-nums' }}>S/ {t.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos…</div>}
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
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.categoriaGasto ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.categoriaGasto}</span> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaBancaria ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.monto != null ? `S/ ${row.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>
                              {row.fecha ? fmtFecha(row.fecha) : '—'}
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
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.categoriaGasto ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 600 }}>{row.categoriaGasto}</span> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaBancaria ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, fontSize: 11.5, color: C.textDim, fontWeight: 500 }}>{row.cuentaBancaria}</span> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.montoGastado != null ? `S/ ${row.montoGastado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cualDeuda ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.warn}10`, border: `1px solid ${C.warn}22`, fontSize: 11.5, color: C.warn, fontWeight: 600 }}>{row.cualDeuda}</span> : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>
                              {row.fecha ? fmtFecha(row.fecha) : '—'}
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

// ── New Ingreso Modal ─────────────────────────────────────────────────────
interface CreateOpts { categoriasIngreso: string[]; cuentasBancarias: string[]; categoriasGasto: string[]; deudas: string[] }

function NewIngresoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [opts, setOpts]           = React.useState<CreateOpts>({ categoriasIngreso: [], cuentasBancarias: [], categoriasGasto: [], deudas: [] });
  const [nombre, setNombre]       = React.useState('');
  const [ingreso, setIngreso]     = React.useState('');
  const [categoria, setCategoria] = React.useState('');
  const [cuenta, setCuenta]       = React.useState('');
  const [fecha, setFecha]         = React.useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus]       = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg]       = React.useState('');

  React.useEffect(() => { fetch(`${BACK_URL}/notion-payments/options`).then(r => r.ok ? r.json() : {}).then(setOpts).catch(() => {}); }, []);
  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const r = await fetch(`${BACK_URL}/notion-payments/create-ingreso`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), ingreso: ingreso ? parseFloat(ingreso) : undefined, categoriaIngreso: categoria || undefined, cuentaBancaria: cuenta || undefined, fecha: fecha || undefined }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      setStatus('ok'); onSuccess(); setTimeout(onClose, 900);
    } catch (err: any) { setStatus('error'); setErrMsg(err.message ?? 'Error al crear el ingreso'); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', fontFamily: 'Inter', fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,24,18,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 480, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.pos}18`, color: C.pos, display: 'grid', placeItems: 'center' }}><Icon.arrowUp size={17} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nuevo Ingreso</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>Se guardará directamente en Notion</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Descripción del ingreso" value={nombre} onChange={e => setNombre(e.target.value)} style={inp} /> },
            { label: 'Ingreso (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={ingreso} onChange={e => setIngreso(e.target.value)} style={inp} /> },
            { label: 'Categoría', node: <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">— Sin categoría —</option>{opts.categoriasIngreso.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Cuenta bancaria', node: <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">— Sin cuenta —</option>{opts.cuentasBancarias.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Fecha', node: <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {errMsg && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={status === 'loading' || status === 'ok'} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: status === 'loading' || status === 'ok' ? 'default' : 'pointer', background: status === 'ok' ? C.pos : C.olive, color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.15s' }}>
              {status === 'loading' ? 'Guardando…' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.textDim, fontFamily: 'Inter', fontSize: 13 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New Gasto Modal ───────────────────────────────────────────────────────
function NewGastoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [opts, setOpts]           = React.useState<CreateOpts>({ categoriasIngreso: [], cuentasBancarias: [], categoriasGasto: [], deudas: [] });
  const [tipo, setTipo]           = React.useState<'unico' | 'deuda'>('unico');
  const [nombre, setNombre]       = React.useState('');
  const [monto, setMonto]         = React.useState('');
  const [categoria, setCategoria] = React.useState('');
  const [cuenta, setCuenta]       = React.useState('');
  const [cualDeuda, setCualDeuda] = React.useState('');
  const [fecha, setFecha]         = React.useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus]       = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg]       = React.useState('');

  React.useEffect(() => { fetch(`${BACK_URL}/notion-payments/options`).then(r => r.ok ? r.json() : {}).then(setOpts).catch(() => {}); }, []);
  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setStatus('loading'); setErrMsg('');
    const endpoint = tipo === 'unico' ? '/notion-payments/create-gasto-unico' : '/notion-payments/create-gasto-deuda';
    const body = tipo === 'unico'
      ? { nombre: nombre.trim(), monto: monto ? parseFloat(monto) : undefined, categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined, fecha: fecha || undefined }
      : { nombre: nombre.trim(), montoGastado: monto ? parseFloat(monto) : undefined, categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined, cualDeuda: cualDeuda || undefined, fecha: fecha || undefined };
    try {
      const r = await fetch(`${BACK_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      setStatus('ok'); onSuccess(); setTimeout(onClose, 900);
    } catch (err: any) { setStatus('error'); setErrMsg(err.message ?? 'Error'); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', fontFamily: 'Inter', fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,24,18,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 480, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center' }}><Icon.arrowDown size={17} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nuevo Gasto</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>Se guardará directamente en Notion</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>×</button>
        </div>
        {/* Tipo */}
        <div style={{ display: 'flex', padding: '12px 24px 0', gap: 8 }}>
          {([{ id: 'unico' as const, label: 'Gasto Único' }, { id: 'deuda' as const, label: 'Por Deuda' }]).map(t => (
            <button key={t.id} type="button" onClick={() => { setTipo(t.id); setStatus('idle'); setErrMsg(''); }} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${tipo === t.id ? C.neg : C.border}`, background: tipo === t.id ? `${C.neg}14` : 'transparent', color: tipo === t.id ? C.neg : C.textMute, fontFamily: 'Inter', fontSize: 12, fontWeight: tipo === t.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.12s' }}>{t.label}</button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Descripción del gasto" value={nombre} onChange={e => setNombre(e.target.value)} style={inp} /> },
            { label: 'Monto (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} style={inp} /> },
            { label: 'Categoría', node: <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">— Sin categoría —</option>{opts.categoriasGasto.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Cuenta bancaria', node: <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">— Sin cuenta —</option>{opts.cuentasBancarias.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            ...(tipo === 'deuda' ? [{ label: '¿Cuál deuda?', node: <select value={cualDeuda} onChange={e => setCualDeuda(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">— Sin deuda —</option>{opts.deudas.map(d => <option key={d} value={d}>{d}</option>)}</select> }] : []),
            { label: 'Fecha', node: <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {errMsg && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={status === 'loading' || status === 'ok'} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: status === 'loading' || status === 'ok' ? 'default' : 'pointer', background: status === 'ok' ? C.pos : C.olive, color: '#fff', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.15s' }}>
              {status === 'loading' ? 'Guardando…' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.textDim, fontFamily: 'Inter', fontSize: 13 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── KPI rail ─────────────────────────────────────────────────────────────
function KpiRail({ showCharts, bp }: { showCharts: boolean; bp: BP }) {
  const [showIngModal,    setShowIngModal]    = React.useState(false);
  const [showGasModal,    setShowGasModal]    = React.useState(false);
  const [showNewIngModal, setShowNewIngModal] = React.useState(false);
  const [showNewGasModal, setShowNewGasModal] = React.useState(false);
  const [ingTotal, setIngTotal] = React.useState<number | null>(null);
  const [gasTotal, setGasTotal] = React.useState<number | null>(null);

  const fetchTotals = React.useCallback(() => {
    Promise.all([
      fetch(`${BACK_URL}/notion-payments/ingresos`).then(r => r.ok ? r.json() : []),
      fetch(`${BACK_URL}/notion-payments/gastos-unicos`).then(r => r.ok ? r.json() : []),
      fetch(`${BACK_URL}/notion-payments/gastos-deudas`).then(r => r.ok ? r.json() : []),
    ]).then(([ing, gu, gd]) => {
      const sumIng = (ing as { ingreso: number | null }[]).reduce((s, r) => s + (r.ingreso ?? 0), 0);
      const sumGu  = (gu  as { monto: number | null }[]).reduce((s, r) => s + (r.monto ?? 0), 0);
      const sumGd  = (gd  as { montoGastado: number | null }[]).reduce((s, r) => s + (r.montoGastado ?? 0), 0);
      setIngTotal(sumIng);
      setGasTotal(sumGu + sumGd);
    }).catch(() => { setIngTotal(0); setGasTotal(0); });
  }, []);

  React.useEffect(() => { fetchTotals(); }, [fetchTotals]);

  const fmt = (v: number | null) =>
    v != null ? `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—';

  type KpiItem = {
    label: string;
    value: string;
    delta: string;
    kind: 'pos' | 'neg';
    I: (typeof Icon)[keyof typeof Icon];
    data: number[];
    onDetail?: () => void;
    onCreate?: () => void;
  };

  const items: KpiItem[] = [
    { label: 'Ingresos', value: fmt(ingTotal), delta: '+8.2%',    kind: 'pos', I: Icon.arrowUp,   data: [3800,4200,4500,4100,4700,4900,4600,5000,4800,5100,5200], onDetail: () => setShowIngModal(true),    onCreate: () => setShowNewIngModal(true) },
    { label: 'Gastos',   value: fmt(gasTotal), delta: '−2.1%',    kind: 'neg', I: Icon.arrowDown, data: [2800,3000,3200,2900,3400,3300,3100,3500,3200,3250,3180], onDetail: () => setShowGasModal(true),    onCreate: () => setShowNewGasModal(true) },
    { label: 'Ahorro',   value: 'S/ 2,020',    delta: '+38%',      kind: 'pos', I: Icon.trendUp,   data: [800,900,1000,1100,1200,1400,1600,1700,1800,1900,2020] },
    { label: 'Deuda',    value: 'S/ 4,150',    delta: '−S/ 300',   kind: 'pos', I: Icon.trendDown, data: [5500,5200,5000,4800,4750,4600,4500,4450,4350,4300,4150] },
  ];
  const cols = '1fr 1fr';
  const span = bp === 'desktop' ? 'span 6' : 'span 12';
  return (
    <>
      <div style={{ gridColumn: span, display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
        {items.map((it, i) => {
          const accent = it.kind === 'pos' ? C.pos : C.neg;
          return (
            <Card key={i} pad={18} hoverable style={{ borderTop: `2px solid ${accent}22`, overflow: 'hidden' }}>

              {/* Fila superior: icono + label + delta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `linear-gradient(135deg, ${accent}28 0%, ${accent}10 100%)`,
                  color: accent,
                  display: 'grid', placeItems: 'center',
                }}>
                  <it.I size={14} strokeWidth={2} />
                </div>
                <span style={{
                  fontSize: 11, color: C.textMute, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.8, flex: 1,
                }}>
                  {it.label}
                </span>
                <Delta value={it.delta} kind={it.kind} />
              </div>

              {/* Valor */}
              <div style={{
                fontSize: 26, fontWeight: 700, letterSpacing: -0.8,
                marginTop: 14, color: it.kind === 'neg' ? accent : C.text, fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}>
                {it.value}
              </div>

              {/* Sparkline */}
              {showCharts && (
                <div style={{ marginTop: 12, marginLeft: -2, marginRight: -2 }}>
                  <Sparkline data={it.data} color={accent} width={180} height={32} strokeWidth={1.5} />
                </div>
              )}

              {/* Acciones (Ver tabla + Nuevo) */}
              {(it.onDetail || it.onCreate) && (
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {it.onDetail && (
                    <button onClick={it.onDetail} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.olive, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      Ver tabla <Icon.arrowRight size={10} />
                    </button>
                  )}
                  {it.onCreate && (
                    <button onClick={it.onCreate} style={{ padding: '3px 9px', borderRadius: 6, border: `1px solid ${accent}30`, background: `${accent}10`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: accent, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      <Icon.plus size={10} /> Nuevo
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {showIngModal    && <IngresosModal    onClose={() => setShowIngModal(false)} />}
      {showGasModal    && <GastosModal     onClose={() => setShowGasModal(false)} />}
      {showNewIngModal && <NewIngresoModal onClose={() => setShowNewIngModal(false)} onSuccess={fetchTotals} />}
      {showNewGasModal && <NewGastoModal   onClose={() => setShowNewGasModal(false)} onSuccess={fetchTotals} />}
    </>
  );
}

// ── Chart card ───────────────────────────────────────────────────────────
function ChartCard({ chartType, accent, bp }: { chartType: Tweaks['chartType']; accent: string; bp: BP }) {
  const span = bp === 'desktop' ? 'span 8' : 'span 12';

  const pillsDirection: React.CSSProperties['flexDirection'] = bp === 'mobile' ? 'column' : 'row';
  const headerLayout: React.CSSProperties['flexDirection'] = bp === 'mobile' ? 'column' : 'row';
  const headerAlign: React.CSSProperties['alignItems'] = bp === 'mobile' ? 'flex-start' : 'flex-start';

  return (
    <Card style={{ gridColumn: span, borderTop: `2px solid ${C.pos}44` }}>
      {/* Header manual para mayor control de layout */}
      <div style={{
        display: 'flex',
        flexDirection: headerLayout,
        alignItems: headerAlign,
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 20px 12px',
      }}>
        {/* Título + badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: '-0.01em' }}>
              Ingresos vs gastos
            </span>
            <span style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: C.olive,
              background: `${C.olive}18`,
              border: `1px solid ${C.olive}30`,
              borderRadius: 6,
              padding: '2px 7px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase' as const,
            }}>
              Nov 2025
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: C.textMute }}>
            Comparativa mensual · proyección hasta diciembre
          </span>
        </div>

        {/* Stat pills */}
        <div style={{
          display: 'flex',
          flexDirection: pillsDirection,
          gap: 8,
          flexShrink: 0,
        }}>
          <StatPill color={C.pos} label="Ingresos" value="S/ 5,200" delta="+4.2%" deltaUp={true} />
          <StatPill color={C.neg} label="Gastos" value="S/ 3,180" delta="+1.8%" deltaUp={false} />
          <StatPill color={accent} label="Neto" value="+S/ 2,020" delta="+8.1%" deltaUp={true} />
        </div>
      </div>

      {/* Área del gráfico */}
      <div style={{
        margin: '0 12px 12px',
        borderRadius: 10,
        background: 'rgba(63,86,28,0.02)',
        padding: '4px 0',
        minHeight: 0,
      }}>
        {chartType === 'bars' ? <PairedBars height={300} /> : <DualAreaChart height={300} />}
      </div>
    </Card>
  );
}

function StatPill({ color, label, value, delta, deltaUp }: {
  color: string;
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
}) {
  const deltaColor = deltaUp ? C.pos : C.neg;
  const ArrowIcon = deltaUp ? Icon.arrowUp : Icon.arrowDown;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
      padding: '7px 11px',
      borderRadius: 9,
      background: C.card,
      border: `1px solid ${C.border}`,
      minWidth: 90,
    }}>
      {/* Dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 3px ${color}22`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10.5, color: C.textMute, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
          {label}
        </span>
      </div>
      {/* Value */}
      <span style={{
        fontSize: 14,
        fontWeight: 700,
        color: C.text,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em',
      }}>
        {value}
      </span>
      {/* Delta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <ArrowIcon style={{ width: 9, height: 9, color: deltaColor }} />
        <span style={{ fontSize: 10, color: deltaColor, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {delta}
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}22` }} />
      <span style={{ color: C.textDim }}>{label}</span>
      <span style={{ color: C.text, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ── Categories donut ─────────────────────────────────────────────────────
function CategoriesDonut() {
  const segs = [
    { label: 'Comida',        v: 890, c: C.neg,     I: Icon.utensils },
    { label: 'Transporte',    v: 420, c: C.warn,    I: Icon.car },
    { label: 'Compras',       v: 380, c: C.primary, I: Icon.bag },
    { label: 'Suscripciones', v: 320, c: C.purple,  I: Icon.music },
    { label: 'Deudas',        v: 300, c: C.pink,    I: Icon.cards },
    { label: 'Otros',         v: 870, c: C.cyan,    I: Icon.more },
  ];
  const total  = segs.reduce((s, x) => s + x.v, 0);
  const sorted = [...segs].sort((a, b) => b.v - a.v);
  const top3   = sorted.slice(0, 3);
  const restV  = sorted.slice(3).reduce((s, x) => s + x.v, 0);
  const display: { label: string; v: number; c: string; I: (typeof Icon)[keyof typeof Icon] }[] = [
    ...top3,
    { label: 'Otros', v: restV, c: C.textDim, I: Icon.more },
  ];
  const maxV = display.reduce((m, x) => (x.v > m ? x.v : m), 0);

  return (
    <Card style={{ padding: 20 }}>
      <CardHeader title="Dónde se va el dinero" subtitle="Por categoría · noviembre" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {display.map((s, i) => {
          const pct    = Math.round((s.v / total) * 100);
          const barPct = Math.round((s.v / maxV) * 100);
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 2px', minWidth: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: `${s.c}18`, color: s.c,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <s.I size={11} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                  <div style={{ height: 3, borderRadius: 2, background: `${s.c}18`, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, borderRadius: 2, background: s.c }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                    S/ {s.v}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
                    {pct}%
                  </span>
                </div>
              </div>
              {i < display.length - 1 && (
                <div style={{ height: 1, background: C.border, margin: '0 2px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMute }}>{segs.length} categorías</span>
        <button style={{ fontSize: 11, fontWeight: 600, color: C.olive, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Ver todo →
        </button>
      </div>
    </Card>
  );
}

// ── Categories grid ──────────────────────────────────────────────────────
function CategoriesGrid({ bp }: { bp: BP }) {
  const cats = [
    { n: 'Comida',        v: 890, p: 65, I: Icon.utensils, c: C.neg,     vs: '+32% vs oct' },
    { n: 'Transporte',    v: 420, p: 42, I: Icon.car,      c: C.warn,    vs: '+5% vs oct' },
    { n: 'Suscripciones', v: 320, p: 80, I: Icon.music,    c: C.purple,  vs: 'igual' },
    { n: 'Deudas',        v: 300, p: 35, I: Icon.cards,    c: C.pink,    vs: '−12% vs oct' },
    { n: 'Entretenimiento',v:260, p: 50, I: Icon.film,     c: C.primary, vs: '+8%' },
    { n: 'Salud',         v: 180, p: 25, I: Icon.heart,    c: C.pos,     vs: '−3%' },
    { n: 'Educación',     v: 150, p: 20, I: Icon.book,     c: C.cyan,    vs: 'igual' },
    { n: 'Compras',       v: 380, p: 55, I: Icon.bag,      c: C.primary, vs: '+18%' },
    { n: 'Hogar',         v: 240, p: 38, I: Icon.house,    c: C.warn,    vs: '−5%' },
    { n: 'Otros',         v: 90,  p: 12, I: Icon.more,     c: C.textDim, vs: '—' },
  ];
  const cols = bp === 'desktop' ? 'repeat(5, 1fr)' : bp === 'tablet' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
  return (
    <Card>
      <CardHeader title="Categorías de gasto" subtitle="10 categorías · presupuesto restante por categoría" action="Gestionar" />
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {cats.map((cat, i) => {
          let pctColor = C.textMute;
          if (cat.p >= 80) pctColor = C.neg;
          else if (cat.p >= 60) pctColor = C.warn;

          let vsColor = C.textMute;
          if (cat.vs.startsWith('+')) vsColor = C.warn;
          else if (cat.vs.startsWith('−')) vsColor = C.pos;

          return (
            <div key={i} className="fz-cat" style={{ padding: 12, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${cat.c}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${cat.c}28 0%, ${cat.c}10 100%)`, color: cat.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <cat.I size={16} />
                </div>
                <div style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{cat.n}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>S/ {cat.v}</div>
              <div style={{ marginTop: 8 }}>
                <ProgressBar pct={cat.p} color={cat.c} height={6} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5 }}>
                <span style={{ color: pctColor }}>{cat.p}% usado</span>
                <span style={{ color: vsColor }}>{cat.vs}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Recent transactions ──────────────────────────────────────────────────
function RecentTransactions({ bp }: { bp: BP }) {
  const rows = ALL_TX.slice(0, 7);
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';
  let gridCols = '36px 1fr 120px 130px';
  if (isMobile)       gridCols = '36px 1fr 130px';
  else if (isDesktop) gridCols = '36px 1fr 140px 120px 130px';
  return (
    <Card>
      <CardHeader
        title="Transacciones recientes" subtitle={`${rows.length} de 24 este mes`}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button ghost size="sm" icon={<Icon.filter size={12} />}>Filtrar</Button>
            {isDesktop && <Button ghost size="sm" icon={<Icon.download size={12} />}>Exportar</Button>}
          </div>
        }
        action="Ver todas"
      />
      <div>
        {rows.map((r, i) => {
          const signColor = r.sign === '+' ? C.pos : C.neg;
          const amtColor  = r.sign === '+' ? C.pos : C.text;
          return (
            <React.Fragment key={i}>
              <div className="fz-row" style={{
                display: 'grid', gridTemplateColumns: gridCols,
                gap: 12, alignItems: 'center', padding: '13px 0',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: r.c + '1A', color: r.c, display: 'grid', placeItems: 'center' }}>
                  <r.I size={15} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{r.desc}</div>
                  <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{r.cat}</div>
                </div>
                {!isMobile && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px 3px 6px', borderRadius: 6,
                    background: 'rgba(63,86,28,0.05)', border: `1px solid ${C.olive}20`,
                    fontSize: 11, color: C.textDim, fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ width: 14, height: 10, borderRadius: 2, background: r.acc.startsWith('Visa') ? '#1A3A6E' : C.primary, display: 'inline-block' }} />
                    {r.acc}
                  </span>
                )}
                {isDesktop && (
                  <div style={{ fontSize: 11.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{r.date}</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: amtColor, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>
                  <span style={{ color: signColor, marginRight: 1 }}>{r.sign}</span>S/<span>{r.amt}</span>
                </div>
              </div>
              {i < rows.length - 1 && (
                <div style={{ height: 1, background: C.border }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
}

// ── Goals + Insights ─────────────────────────────────────────────────────
function Goals({ accent }: { accent: string }) {
  const [tab, setTab] = React.useState<'goals' | 'insights'>('goals');

  const goals = [
    { n: 'Viaje a Japón',     cur: 2160,  tgt: 3000,  c: accent,      dl: 'mar 2027' },
    { n: 'Fondo emergencia',  cur: 4500,  tgt: 10000, c: C.pos,       dl: 'dic 2027' },
    { n: 'Laptop nueva',      cur: 1320,  tgt: 1500,  c: C.warn,      dl: 'ene 2027' },
    { n: 'Auto nuevo',        cur: 1800,  tgt: 15000, c: C.primary,   dl: 'dic 2028' },
    { n: 'Fondo de retiro',   cur: 3200,  tgt: 50000, c: C.cyan,      dl: 'ene 2040' },
    { n: 'Renovar cocina',    cur: 900,   tgt: 4000,  c: C.purple,    dl: 'jun 2027' },
  ];

  const items = [
    { I: Icon.alert,    c: C.warn,    title: 'Comida +32% vs octubre',        body: 'S/ 890 gastados — revisa restaurantes y delivery' },
    { I: Icon.bell,     c: C.neg,     title: 'Visa vence en 9 días',          body: 'S/ 190 — saldo suficiente ✓' },
    { I: Icon.sparkles, c: C.primary, title: 'Cancela 2 suscripciones',       body: 'Ahorrarías S/ 24/mes · pagas sin usar 3 servicios' },
    { I: Icon.check,    c: C.pos,     title: '+4% sobre meta de ahorro',      body: 'Vas camino de S/ 2,180 al cierre del mes' },
    { I: Icon.alert,    c: C.warn,    title: 'Transporte subió 18%',          body: 'S/ 420 vs S/ 356 el mes pasado — considera carpooling' },
    { I: Icon.sparkles, c: C.cyan,    title: 'Mejor mes de ahorro en 2025',   body: 'S/ 2,020 neto — superaste tu promedio de S/ 1,540' },
    { I: Icon.bell,     c: C.purple,  title: 'Adobe CC sube de precio',       body: '+S/ 12/mes desde diciembre — evalúa alternativas' },
    { I: Icon.check,    c: C.pos,     title: 'Deuda coche casi liquidada',    body: '70% pagado · quedan S/ 840 a un ritmo de S/ 280/mes' },
  ];

  const isGoals = tab === 'goals';

  let topBorder: string = `2px solid ${C.primary}33`;
  if (isGoals) topBorder = `2px solid ${accent}33`;

  let subtitle: string = 'Auto-generado · actualizado hace 5 min';
  if (isGoals) subtitle = '6 activas · 2 completadas este año';

  let rightControl: React.ReactNode = <Tag bg={`${C.primary}22`} color={C.primary} dot={C.primary}>AI</Tag>;
  if (isGoals) rightControl = (
    <button style={{ fontSize: 11.5, fontWeight: 500, color: C.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
      Nueva meta →
    </button>
  );

  return (
    <Card style={{ borderTop: topBorder, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Header con tabs ── */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>

          <div style={{ display: 'flex' }}>
            {(['goals', 'insights'] as const).map(t => {
              const active    = tab === t;
              const isInsight = t === 'insights';
              let tabColor: string   = C.textMute;
              if (active) tabColor   = C.text;
              let indicator: string  = 'transparent';
              if (active) indicator  = isInsight ? C.primary : accent;
              return (
                <button key={t} onClick={() => setTab(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 4px 10px', marginRight: 20,
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${indicator}`,
                  marginBottom: -1,
                  color: tabColor,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', transition: 'color 0.14s, border-color 0.14s',
                  fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: -0.1,
                }}>
                  {isInsight && <Icon.sparkles size={12} />}
                  {t === 'goals' ? 'Objetivos' : 'Análisis'}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10, flexShrink: 0 }}>
            {rightControl}
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 8 }}>{subtitle}</div>
      </div>

      {/* Contenedor scrollable — altura fija para mostrar 3 cards */}
      <div style={{ maxHeight: 210, overflowY: 'auto' }}>

        {/* ── Tab: Objetivos ── */}
        {isGoals && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map((g, i) => {
              const pct = Math.round((g.cur / g.tgt) * 100);
              return (
                <div key={i} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${g.c}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: `${g.c}18`, color: g.c, display: 'grid', placeItems: 'center' }}>
                      <Icon.target size={11} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.n}</div>
                      <div style={{ fontSize: 9.5, color: C.textMute, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                        S/ {g.cur.toLocaleString('es-PE')} · {g.dl}
                      </div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      S/ {g.tgt.toLocaleString('es-PE')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}><ProgressBar pct={pct} color={g.c} height={4} /></div>
                    <span style={{ fontSize: 9.5, color: g.c, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{pct}% completado</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tab: Análisis inteligente ── */}
        {!isGoals && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${it.c}60` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${it.c}28 0%, ${it.c}10 100%)`, color: it.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <it.I size={14} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{it.title}</div>
                    <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2, lineHeight: 1.4 }}>{it.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: `${C.primary}10`, border: `1px solid ${C.primary}33`, display: 'flex', gap: 12, fontSize: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.textDim }}>Gasto promedio diario</div>
                <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>S/ 106</div>
              </div>
              <div style={{ width: 1, background: C.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.textDim }}>Proyección fin de mes</div>
                <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>S/ 3,420</div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Pie */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMute }}>
          {isGoals ? `${goals.length} objetivos` : `${items.length} análisis`}
        </span>
        <button style={{ fontSize: 11, fontWeight: 600, color: C.olive, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
          {isGoals ? 'Ver todas →' : 'Ver análisis →'}
        </button>
      </div>
    </Card>
  );
}

// ── Debts card ───────────────────────────────────────────────────────────
function Debts({ bp }: { bp: BP }) {
  const isDesktop = bp === 'desktop';
  const [tab, setTab] = React.useState<'debts' | 'subs'>('debts');

  const debts = [
    { n: 'Préstamo coche',    amt: 280, when: '23 nov', days: 5,  pct: 70, c: C.pink,    I: Icon.car    },
    { n: 'Tarjeta Visa **23', amt: 190, when: '28 nov', days: 9,  pct: 45, c: C.warn,    I: Icon.cards  },
    { n: 'Préstamo personal', amt: 450, when: '01 dic', days: 13, pct: 30, c: C.primary, I: Icon.wallet },
    { n: 'Tarjeta MC **87',   amt: 120, when: '05 dic', days: 17, pct: 60, c: C.purple,  I: Icon.cards  },
    { n: 'Cuota celular',     amt: 85,  when: '10 dic', days: 22, pct: 55, c: C.cyan,    I: Icon.more   },
    { n: 'Préstamo familiar', amt: 200, when: '15 dic', days: 27, pct: 20, c: C.neg,     I: Icon.wallet },
  ];

  const subs = [
    { n: 'Netflix',       amt: 25, when: '01 dic', days: 13, c: C.neg,     I: Icon.film  },
    { n: 'Spotify',       amt: 12, when: '05 dic', days: 17, c: C.primary, I: Icon.music },
    { n: 'Adobe CC',      amt: 89, when: '10 dic', days: 22, c: C.pink,    I: Icon.more  },
    { n: 'iCloud 50 GB',  amt: 4,  when: '15 dic', days: 27, c: C.cyan,    I: Icon.more  },
    { n: 'YouTube Prem.', amt: 15, when: '20 dic', days: 32, c: C.neg,     I: Icon.film  },
  ];

  const isDebts    = tab === 'debts';
  const totalDebt  = debts.reduce((s, d) => s + d.amt, 0);
  const paidAvg    = Math.round(debts.reduce((s, d) => s + d.pct, 0) / debts.length);
  const minDays    = Math.min(...debts.map(d => d.days));
  const totalSubs  = subs.reduce((s, d) => s + d.amt, 0);
  const list       = isDebts ? debts : subs;

  let subtitle = `${subs.length} activas · S/ ${totalSubs}/mes`;
  if (isDebts) subtitle = `${debts.length} activas · próximo pago en ${minDays} días`;

  return (
    <Card style={{ borderTop: `2px solid ${C.warn}44`, ...(isDesktop && { flex: 1 }) }}>

      {/* ── Header con tabs integrados ── */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>

          {/* Tabs izquierda */}
          <div style={{ display: 'flex', gap: 0 }}>
            {(['debts', 'subs'] as const).map(t => {
              const active  = tab === t;
              const label   = t === 'debts' ? 'Deudas' : 'Suscripciones';
              const count   = t === 'debts' ? debts.length : subs.length;
              let tabColor: string  = C.textMute;
              if (active) tabColor  = C.text;
              let pillBg: string    = `${C.border}`;
              if (active) pillBg    = `${C.olive}22`;
              let pillColor: string = C.textMute;
              if (active) pillColor = C.olive;
              let indicator: string = 'transparent';
              if (active) indicator = C.olive;
              return (
                <button key={t} onClick={() => setTab(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 4px 10px', marginRight: 20,
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${indicator}`,
                  marginBottom: -1,
                  color: tabColor,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', transition: 'color 0.14s, border-color 0.14s',
                  fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: -0.1,
                }}>
                  {label}
                  <span style={{ fontSize: 10, fontWeight: 600, color: pillColor, background: pillBg, borderRadius: 10, padding: '1px 6px', transition: 'all 0.14s' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Subtítulo */}
        <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 8 }}>{subtitle}</div>
      </div>

      {/* ── Métricas (altura fija para ambos tabs) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, flexShrink: 0 }}>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: isDebts ? 'rgba(63,86,28,0.04)' : `${C.purple}0C`, border: `1px solid ${isDebts ? C.border : `${C.purple}25`}` }}>
          <div style={{ fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>
            {isDebts ? 'Deuda total' : 'Total mensual'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: isDebts ? C.text : C.purple }}>
            S/ {isDebts ? totalDebt.toLocaleString('es-PE') : totalSubs}
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: isDebts ? `${C.warn}0C` : 'rgba(63,86,28,0.04)', border: `1px solid ${isDebts ? `${C.warn}30` : C.border}` }}>
          <div style={{ fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>
            {isDebts ? 'Promedio pagado' : 'Al año'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: isDebts ? C.warn : C.text }}>
            {isDebts ? `${paidAvg}%` : `S/ ${totalSubs * 12}`}
          </div>
          {isDebts && <Delta value="−S/ 300 este mes" kind="pos" style={{ marginTop: 3 }} />}
        </div>
      </div>

      {/* Barra global — espacio reservado siempre */}
      <div style={{ marginBottom: 12, height: 30, flexShrink: 0 }}>
        {isDebts && (
          <>
            <ProgressBar pct={paidAvg} color={C.warn} height={7} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
              <span>S/ 0</span>
              <span>S/ {totalDebt.toLocaleString('es-PE')} total</span>
            </div>
          </>
        )}
      </div>

      {/* ── Lista scrollable ── */}
      <div style={isDesktop ? { position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' } : {}}>
        <div style={isDesktop
          ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }
          : { display: 'flex', flexDirection: 'column', gap: 6 }
        }>

          {/* Filas de deudas */}
          {isDebts && debts.map((d, i) => {
            const dc = i % 2 === 0 ? C.olive : C.pos;
            const isUrgent = d.days < 7;
            return (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${dc}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${dc}18`, color: dc, display: 'grid', placeItems: 'center' }}>
                    <d.I size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.n}</div>
                    <div style={{ fontSize: 10, color: isUrgent ? dc : C.textMute, fontWeight: isUrgent ? 600 : 400, marginTop: 2 }}>
                      {d.when} · en {d.days}d
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>S/ {d.amt}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}><ProgressBar pct={d.pct} color={dc} height={5} /></div>
                  <span style={{ fontSize: 10, color: dc, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{d.pct}% pagado</span>
                </div>
              </div>
            );
          })}

          {/* Filas de suscripciones */}
          {!isDebts && subs.map((s, i) => {
            const sc = i % 2 === 0 ? C.olive : C.pos;
            return (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${sc}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${sc}18`, color: sc, display: 'grid', placeItems: 'center' }}>
                    <s.I size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: C.textMute, marginTop: 2 }}>Renueva {s.when} · en {s.days}d</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>S/ {s.amt}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: sc, background: `${sc}15`, border: `1px solid ${sc}30`, borderRadius: 4, padding: '1px 5px', letterSpacing: 0.2 }}>mensual</span>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {isDesktop && list.length > 3 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to bottom, transparent, rgba(250,251,248,0.96))', pointerEvents: 'none' }} />
        )}
      </div>

      {/* Pie */}
      <div style={{ marginTop: 10, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMute }}>
          {list.length} {isDebts ? 'deudas' : 'suscripciones'}
        </span>
        <button style={{ fontSize: 11, fontWeight: 600, color: C.olive, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Ver detalle →
        </button>
      </div>
    </Card>
  );
}

// ── Notion sync ──────────────────────────────────────────────────────────
function NotionSync() {
  const [syncing, setSyncing] = React.useState(false);

  function handleSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  }

  return (
    <Card pad={18} style={{ flex: 1, minHeight: 0, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: C.bg, border: `1px solid ${C.border}`,
          display: 'grid', placeItems: 'center',
          fontSize: 24, fontWeight: 800, color: C.text,
          fontFamily: 'Georgia, serif', letterSpacing: -0.5,
        }}>N</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Sincronizar Notion</div>
          <div style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>
            {syncing ? 'Sincronizando...' : 'Última sync hace 2 h · bases de datos vinculadas'}
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '8px 16px', borderRadius: 9, flexShrink: 0,
            background: syncing ? C.border : C.olive, color: syncing ? C.textMute : '#fff',
            border: 'none', cursor: syncing ? 'default' : 'pointer',
            fontSize: 12, fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'background 0.2s',
          }}>
          {syncing ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </div>
    </Card>
  );
}

// ── DashboardHome ─────────────────────────────────────────────────────────
export function DashboardHome({ tweaks }: { tweaks: Tweaks }) {
  const bp = useBreakpoint();
  const accent = tweaks.accent;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';

  const gap = isMobile ? 10 : tweaks.density === 'compact' ? 12 : 16;
  const pad = isMobile ? '10px 14px 16px' : tweaks.density === 'compact' ? '14px 20px 16px' : '18px 24px 20px';

  let mainCols = '1fr 340px';
  if (isDesktop) mainCols = '1fr 500px';
  if (isMobile)  mainCols = '1fr';

  const railStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap, minWidth: 0,
    ...(isDesktop && { height: '100%' }),
  };

  return (
    <div style={{
      padding: pad,
      display: 'grid',
      gridTemplateColumns: mainCols,
      gap,
      height: isDesktop ? 'calc(100vh - 68px)' : 'auto',
      overflow: isDesktop ? 'hidden' : 'visible',
      boxSizing: 'border-box',
      maxWidth: 1800,
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap, minWidth: 0 }}>
        <HeroBalance bp={bp} />
        <KpiRail showCharts={tweaks.microCharts} bp={bp} />
        <ChartCard chartType={tweaks.chartType} accent={accent} bp={bp} />
        <div style={{ gridColumn: isDesktop ? 'span 4' : 'span 12', display: 'flex', flexDirection: 'column' }}><Debts bp={bp} /></div>
      </div>
      <div style={railStyle}>
        <Goals accent={accent} />
        <CategoriesDonut />
        <NotionSync />
      </div>
    </div>
  );
}
