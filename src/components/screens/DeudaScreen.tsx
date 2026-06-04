'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { API_BASE_URL } from '@/lib/api';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { Card, Button } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DeudaRow } from '@/shared/types/finance.types';

type Status = 'idle' | 'loading' | 'ok' | 'error';
type Tab    = 'suscripciones' | 'deudas';
type View   = 'cards' | 'tabla';

interface DeudaScreenProps { accent: string }

function isSuscripcion(row: DeudaRow): boolean {
  const tp = (row.tipoPago ?? '').toLowerCase();
  if (tp.includes('suscri')) return true;
  if (tp.includes('deuda') || tp.includes('cuota') || tp.includes('crédit') || tp.includes('credit') || tp.includes('préstamo') || tp.includes('prestamo')) return false;
  return !row.hayCuotas || row.hayCuotas === 0;
}

function nextRenewal(fechaInicio: string | null, ciclo: string): Date | null {
  if (!fechaInicio) return null;
  const inicio = new Date(fechaInicio);
  if (isNaN(inicio.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const useUTC = inicio.getUTCSeconds() === 59;
  const day    = useUTC ? inicio.getUTCDate()  : inicio.getDate();
  const month  = useUTC ? inicio.getUTCMonth() : inicio.getMonth();
  const c = (ciclo ?? '').toLowerCase();
  if (c === 'mensual' || c === 'monthly') {
    let next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return next;
  }
  if (c === 'anual' || c === 'annual' || c === 'yearly') {
    let next = new Date(today.getFullYear(), month, day);
    if (next <= today) next = new Date(today.getFullYear() + 1, month, day);
    return next;
  }
  return null;
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtShort(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

const fmtFecha = (fecha: string | null) => formatNotionDate(fecha, '—');


const KPI: React.CSSProperties = {
  background: '#F9FAF6',
  borderRadius: 12,
  padding: '14px 18px',
  border: `1px solid ${C.border}`,
  flex: 1,
};

export function DeudaScreen({ accent: _accent }: Readonly<DeudaScreenProps>) {
  const [rows, setRows]               = React.useState<DeudaRow[]>([]);
  const [fetchStatus, setFetchStatus] = React.useState<Status>('loading');
  const [syncStatus, setSyncStatus]   = React.useState<Status>('idle');
  const [syncMsg, setSyncMsg]         = React.useState<string | null>(null);
  const [tab, setTab]                 = React.useState<Tab>('suscripciones');
  const [viewSusc,   setViewSusc]   = React.useState<View>('cards');
  const [viewDeudas, setViewDeudas] = React.useState<View>('cards');
  const activeView   = tab === 'suscripciones' ? viewSusc   : viewDeudas;
  const toggleView   = () => tab === 'suscripciones'
    ? setViewSusc(v   => v === 'cards' ? 'tabla' : 'cards')
    : setViewDeudas(v => v === 'cards' ? 'tabla' : 'cards');

  const refreshDeudas = () =>
    notionPaymentsService.getDeudasSuscripciones()
      .then((data: DeudaRow[]) => { setRows(data); setFetchStatus('ok'); })
      .catch(() => setFetchStatus('error'));

  React.useEffect(() => { refreshDeudas(); }, []);

  const handleSync = async () => {
    setSyncStatus('loading');
    setSyncMsg(null);
    try {
      const body = await notionPaymentsService.sync('/notion-payments/sync-deudas') as { synced?: number; message?: string };
      setSyncStatus('ok');
      setSyncMsg(`OK ${body.synced} registros sincronizados`);
      refreshDeudas();
    } catch {
      setSyncStatus('error');
      setSyncMsg('No se pudo conectar con el backend');
    }
  };

  const suscs      = rows.filter(isSuscripcion);
  const deudas     = rows.filter(r => !isSuscripcion(r));
  const activeRows = tab === 'suscripciones' ? suscs : deudas;

  const totalMensual = suscs.reduce((s, r) => {
    if (!r.cantidad) return s;
    const c = (r.ciclo ?? '').toLowerCase();
    return s + (c === 'anual' ? r.cantidad / 12 : r.cantidad);
  }, 0);
  const totalDeuda = deudas.reduce((s, r) => s + (r.cantidad ?? 0), 0);

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card style={{ padding: 0 }}>

        {/* ── Tab bar + acciones ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex' }}>
            {([
              { id: 'suscripciones' as const, label: 'Suscripciones', count: suscs.length },
              { id: 'deudas'        as const, label: 'Deudas',        count: deudas.length },
            ]).map(t => {
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.text : C.textMute,
                  borderBottom: `2px solid ${isActive ? C.neg : 'transparent'}`,
                  marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {t.label}
                  <span style={{
                    fontSize: 11, borderRadius: 10, padding: '1px 7px', fontWeight: 600,
                    background: isActive ? `${C.neg}18` : C.border,
                    color:      isActive ? C.neg       : C.textMute,
                  }}>
                    {fetchStatus === 'ok' ? t.count : '…'}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {syncMsg && (
              <span style={{ fontSize: 12, color: syncStatus === 'ok' ? C.pos : C.neg }}>{syncMsg}</span>
            )}
            <Button create icon={<Icon.plus size={11} />} onClick={() => {}}>Nuevo</Button>
            <Button link onClick={toggleView}>
              {activeView === 'cards' ? 'Ver tabla' : 'Ver tarjetas'}
            </Button>
            <Button primary icon={<Icon.refresh size={14} />} onClick={handleSync} disabled={syncStatus === 'loading'}>
              {syncStatus === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        </div>

        {/* ── Estados ── */}
        {fetchStatus === 'loading' && (
          <div style={{ padding: 40, textAlign: 'center', color: C.textMute, fontSize: 13 }}>Cargando...</div>
        )}
        {fetchStatus === 'error' && (
          <div style={{ padding: 40, textAlign: 'center', color: C.neg, fontSize: 13 }}>
            No se pudo conectar con el backend en <code style={{ fontFamily: 'monospace' }}>{API_BASE_URL}</code>.
          </div>
        )}
        {fetchStatus === 'ok' && activeRows.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: C.textMute }}>
            No hay registros. Ve a <strong>Ajustes</strong>, selecciona la tabla <em>Deudas / Suscripciones</em> y presiona <strong>Sincronizar</strong>.
          </div>
        )}

        {/* ── Contenido ── */}
        {fetchStatus === 'ok' && activeRows.length > 0 && (
          <div style={{ padding: 20 }}>

            {/* KPIs — Suscripciones */}
            {tab === 'suscripciones' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.textMute, marginBottom: 10 }}>
                  {suscs.length} activa{suscs.length !== 1 ? 's' : ''} · S/ {totalMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}/mes
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={KPI}>
                    <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Total mensual</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums' }}>
                      S/ {totalMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={KPI}>
                    <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Al año</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.warn, fontVariantNumeric: 'tabular-nums' }}>
                      S/ {(totalMensual * 12).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPIs — Deudas */}
            {tab === 'deudas' && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={KPI}>
                  <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Total deudas</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums' }}>
                    S/ {totalDeuda.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={KPI}>
                  <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Registros</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{deudas.length}</div>
                </div>
                <div style={KPI}>
                  <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Con cuotas pend.</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.warn }}>
                    {deudas.filter(r => (r.cuotasPendientes ?? 0) > 0).length}
                  </div>
                </div>
              </div>
            )}

            {/* ── Vista: tarjetas ── */}
            {activeView === 'cards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeRows.map(row => {
                  const renewal = nextRenewal(row.fechaInicio, row.ciclo);
                  const days    = daysUntil(renewal);
                  const urgent  = days !== null && days <= 7;
                  return (
                    <div key={row.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: 10,
                      border: `1px solid ${urgent ? `${C.warn}66` : C.border}`,
                      background: urgent ? `${C.warn}08` : '#fff',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{row.nombre || '—'}</span>
                        {renewal && days !== null ? (
                          <span style={{ fontSize: 11.5, color: C.textMute }}>
                            Renueva {fmtShort(renewal)} · <span style={{ color: urgent ? C.warn : C.textMute }}>en {days}d</span>
                          </span>
                        ) : row.fechaInicio ? (
                          <span style={{ fontSize: 11.5, color: C.textMute }}>Desde {fmtFecha(row.fechaInicio)}</span>
                        ) : null}
                        {tab === 'deudas' && (
                          <div style={{ display: 'flex', gap: 12, marginTop: 1 }}>
                            {row.cuotasPendientes != null && (
                              <span style={{ fontSize: 11, color: (row.cuotasPendientes ?? 0) > 0 ? C.warn : C.pos }}>
                                {row.cuotasPendientes} cuotas pendientes
                              </span>
                            )}
                            {row.montoPagado != null && row.montoPagado > 0 && (
                              <span style={{ fontSize: 11, color: C.textMute }}>
                                Pagado: S/ {row.montoPagado.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 16 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums' }}>
                          {row.cantidad != null ? `S/ ${row.cantidad.toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : '—'}
                        </span>
                        {row.ciclo && (
                          <span style={{
                            fontSize: 10.5, color: C.textMute,
                            background: `${C.neg}0D`, padding: '2px 8px',
                            borderRadius: 10, border: `1px solid ${C.neg}18`,
                          }}>
                            {row.ciclo}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Vista: tabla ── */}
            {activeView === 'tabla' && (
              <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                        {['#', 'Nombre', 'Estado', 'Fecha Inicio', 'Cantidad', 'Ciclo', 'Tipo de Pago', 'Cuotas', 'Monto Pagado', 'Cuotas Pend.'].map((h, hi) => (
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
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb, maxWidth: 180 }}>
                              {row.estado
                                ? <span style={{ fontSize: 11.5, color: C.textDim }}>{row.estado}</span>
                                : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtFecha(row.fechaInicio)}</td>
                            <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.cantidad != null ? `S/ ${row.cantidad.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.ciclo
                                ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, color: C.neg, fontSize: 11.5, fontWeight: 600 }}>{row.ciclo}</span>
                                : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.tipoPago
                                ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}22`, color: C.textDim, fontSize: 11.5, fontWeight: 500 }}>{row.tipoPago}</span>
                                : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
                              {row.hayCuotas != null ? row.hayCuotas : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.montoPagado != null ? `S/ ${row.montoPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb, textAlign: 'center' }}>
                              {row.cuotasPendientes != null
                                ? <span style={{ fontWeight: 700, color: (row.cuotasPendientes ?? 0) > 0 ? C.warn : C.pos }}>{row.cuotasPendientes}</span>
                                : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </Card>
    </div>
  );
}
