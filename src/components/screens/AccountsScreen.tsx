'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { API_BASE_URL } from '@/lib/api';
import { formatNotionDate } from '@/lib/format';
import { Icon } from '@/components/icons';
import { Card, Button } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CuentaBancariaRow, TransferenciaRow } from '@/shared/types/finance.types';

type CuentaRow = CuentaBancariaRow;

type Status = 'idle' | 'loading' | 'ok' | 'error';

const fmtFecha = (fecha: string | null | undefined) => formatNotionDate(fecha ?? null, '—');


interface AccountsScreenProps { accent: string }

export function AccountsScreen({ accent: _accent }: AccountsScreenProps) {
  const [tab, setTab]                     = React.useState<'cuentas' | 'transferencias'>('cuentas');
  const [cuentas, setCuentas]             = React.useState<CuentaRow[]>([]);
  const [transferencias, setTransferencias] = React.useState<TransferenciaRow[]>([]);
  const [fetchStatus, setFetchStatus]     = React.useState<Status>('loading');
  const [syncCbStatus, setSyncCbStatus]   = React.useState<Status>('idle');
  const [syncCbMsg, setSyncCbMsg]         = React.useState<string | null>(null);
  const [syncTrStatus, setSyncTrStatus]   = React.useState<Status>('idle');
  const [syncTrMsg, setSyncTrMsg]         = React.useState<string | null>(null);

  const refresh = () =>
    Promise.all([
      notionPaymentsService.getCuentasBancarias(),
      notionPaymentsService.getTransferencias(),
    ]).then(([cb, tr]) => {
      setCuentas(cb);
      setTransferencias(tr);
      setFetchStatus('ok');
    }).catch(() => setFetchStatus('error'));

  React.useEffect(() => { refresh(); }, []);

  const handleSyncCuentas = async () => {
    setSyncCbStatus('loading'); setSyncCbMsg(null);
    try {
      const body = await notionPaymentsService.sync('/notion-payments/sync-cuentas-bancarias') as { synced?: number; message?: string };
      setSyncCbStatus('ok');
      setSyncCbMsg(`OK ${body.synced} cuentas sincronizadas`);
      refresh();
    } catch { setSyncCbStatus('error'); setSyncCbMsg('No se pudo conectar con el backend'); }
  };

  const handleSyncTransferencias = async () => {
    setSyncTrStatus('loading'); setSyncTrMsg(null);
    try {
      const body = await notionPaymentsService.sync('/notion-payments/sync-transferencias') as { synced?: number; message?: string };
      setSyncTrStatus('ok');
      setSyncTrMsg(`OK ${body.synced} transferencias sincronizadas`);
      refresh();
    } catch { setSyncTrStatus('error'); setSyncTrMsg('No se pudo conectar con el backend'); }
  };

  const totalSaldo = cuentas.reduce((s, r) => s + (r.balance ?? r.balanceInicial ?? 0), 0);
  const totalTransf = transferencias.reduce((s, r) => s + (r.monto ?? 0), 0);

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Métricas resumen ── */}
      {(cuentas.length > 0 || transferencias.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: 'Saldo total',        value: `S/ ${totalSaldo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, color: C.pos },
            { label: 'Cuentas activas',    value: `${cuentas.length}`,    color: C.text },
            { label: 'Transferencias',     value: `S/ ${totalTransf.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, color: C.warn },
          ].map(m => (
            <Card key={m.label} pad={16}>
              <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Tabla principal con tabs ── */}
      <Card>
        {/* Tabs + header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 0, marginBottom: 0 }}>
          <div style={{ display: 'flex' }}>
            {([
              { id: 'cuentas'        as const, label: 'Cuentas Bancarias',  count: cuentas.length },
              { id: 'transferencias' as const, label: 'Transferencias',     count: transferencias.length },
            ]).map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? C.text : C.textMute,
                  borderBottom: `2px solid ${active ? C.pos : 'transparent'}`,
                  marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {t.label}
                  <span style={{ fontSize: 11, background: active ? `${C.pos}18` : C.border, color: active ? C.pos : C.textMute, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botones sync según tab */}
          <div style={{ padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            {tab === 'cuentas' && (
              <>
                {syncCbMsg && <span style={{ fontSize: 12, color: syncCbStatus === 'ok' ? C.pos : C.neg }}>{syncCbMsg}</span>}
                <Button primary icon={<Icon.refresh size={14} />} onClick={handleSyncCuentas} disabled={syncCbStatus === 'loading'}>
                  {syncCbStatus === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </>
            )}
            {tab === 'transferencias' && (
              <>
                {syncTrMsg && <span style={{ fontSize: 12, color: syncTrStatus === 'ok' ? C.pos : C.neg }}>{syncTrMsg}</span>}
                <Button primary icon={<Icon.refresh size={14} />} onClick={handleSyncTransferencias} disabled={syncTrStatus === 'loading'}>
                  {syncTrStatus === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </>
            )}
          </div>
        </div>

        {fetchStatus === 'loading' && (
          <div style={{ padding: 32, textAlign: 'center', color: C.textMute, fontSize: 13 }}>Cargando...</div>
        )}
        {fetchStatus === 'error' && (
          <div style={{ padding: 32, textAlign: 'center', color: C.neg, fontSize: 13 }}>
            No se pudo conectar con el backend en <code style={{ fontFamily: 'monospace' }}>{API_BASE_URL}</code>.
          </div>
        )}

        {/* ── Tab Cuentas Bancarias ── */}
        {fetchStatus === 'ok' && tab === 'cuentas' && (
          cuentas.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: C.textMute }}>
                No hay registros. Ve a <strong>Ajustes</strong>, selecciona la tabla <em>Cuentas Bancarias</em> y presiona <strong>Sincronizar</strong>.
              </div>
            : <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', margin: 16 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(140,160,90,0.06)' }}>
                        {['#', 'Nombre', 'Tipo', 'Banco', 'Moneda', 'Balance', 'Crédito', 'Bal. Inicial', 'Estado', 'Fecha Apertura'].map((h, hi) => (
                          <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cuentas.map((row, i) => {
                        const bb = i < cuentas.length - 1 ? `1px solid ${C.border}` : 'none';
                        return (
                          <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(140,160,90,0.012)' }}>
                            <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.tipo ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.pos}10`, border: `1px solid ${C.pos}22`, fontSize: 11.5, color: C.pos, fontWeight: 600 }}>{row.tipo}</span> : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb }}>{row.banco || '—'}</td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.moneda ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.warn}10`, border: `1px solid ${C.warn}22`, fontSize: 11.5, color: C.warn, fontWeight: 600 }}>{row.moneda}</span> : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.pos, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {(row.balance ?? row.balanceInicial) != null
                                ? `S/ ${(row.balance ?? row.balanceInicial)!.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textDim, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.credito != null ? `S/ ${row.credito.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textDim, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.balanceInicial != null ? `S/ ${row.balanceInicial.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb, fontSize: 12 }}>{row.estado || '—'}</td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtFecha(row.fechaApertura)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
        )}

        {/* ── Tab Transferencias ── */}
        {fetchStatus === 'ok' && tab === 'transferencias' && (
          transferencias.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: C.textMute }}>
                No hay registros. Ve a <strong>Ajustes</strong>, selecciona la tabla <em>Transferencias</em> y presiona <strong>Sincronizar</strong>.
              </div>
            : <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', margin: 16 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(140,160,90,0.06)' }}>
                        {['#', 'Nombre', 'Monto', 'Cuenta Origen', 'Cuenta Destino', 'Fecha', 'Notas'].map((h, hi) => (
                          <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transferencias.map((row, i) => {
                        const bb = i < transferencias.length - 1 ? `1px solid ${C.border}` : 'none';
                        return (
                          <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(140,160,90,0.012)' }}>
                            <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                            <td style={{ padding: '12px 16px', color: C.warn, fontWeight: 700, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>
                              {row.monto != null ? `S/ ${row.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaOrigen ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.neg}10`, border: `1px solid ${C.neg}22`, fontSize: 11.5, color: C.neg, fontWeight: 500 }}>{row.cuentaOrigen}</span> : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', borderBottom: bb }}>
                              {row.cuentaDestino ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.pos}10`, border: `1px solid ${C.pos}22`, fontSize: 11.5, color: C.pos, fontWeight: 500 }}>{row.cuentaDestino}</span> : <span style={{ color: C.textMute }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: C.textMute, borderBottom: bb, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtFecha(row.fecha)}</td>
                            <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb, maxWidth: 200, fontSize: 12 }}>
                              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.notas || '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
        )}
      </Card>
    </div>
  );
}
