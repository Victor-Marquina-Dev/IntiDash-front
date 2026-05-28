'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Button } from '@/components/ui';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Account {
  id: string;
  nombre: string;
  balanceInicial: number | null;
  divisa: string;
  estado: string;
  cuentaBancaria: string;
  tipoCuenta: string;
}

type Status = 'idle' | 'loading' | 'ok' | 'error';

interface DeudaScreenProps {
  accent: string;
}

const TIPO_COLOR: Record<string, string> = {
  CREDITO:   C.neg,
  AHORRO:    C.pos,
  INVERSION: C.primary,
  ALIMENTOS: C.warn,
};

const ESTADO_STYLE = (estado: string) =>
  estado === 'Activo'
    ? { bg: 'rgba(140,160,90,0.15)', color: C.pos }
    : { bg: 'rgba(63,86,28,0.06)',   color: C.textMute };

export function DeudaScreen({ accent: _accent }: Readonly<DeudaScreenProps>) {
  const [accounts, setAccounts]     = React.useState<Account[]>([]);
  const [fetchStatus, setFetchStatus] = React.useState<Status>('loading');
  const [syncStatus, setSyncStatus]   = React.useState<Status>('idle');
  const [syncMsg, setSyncMsg]         = React.useState<string | null>(null);

  const refreshAccounts = () =>
    fetch(`${API}/notion-payments/accounts`)
      .then(r => r.json())
      .then((data: Account[]) => { setAccounts(data); setFetchStatus('ok'); })
      .catch(() => setFetchStatus('error'));

  React.useEffect(() => {
    refreshAccounts();
  }, []);

  const handleSync = async () => {
    setSyncStatus('loading');
    setSyncMsg(null);
    try {
      const r  = await fetch(`${API}/notion-payments/sync`, { method: 'POST' });
      const body = await r.json();
      if (!r.ok) { setSyncStatus('error'); setSyncMsg(body.message ?? 'Error al sincronizar'); return; }
      setSyncStatus('ok');
      setSyncMsg(`✓ ${body.pulled} registros sincronizados`);
      refreshAccounts();
    } catch {
      setSyncStatus('error');
      setSyncMsg('No se pudo conectar con el backend');
    }
  };

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <CardHeader
          title="Cuentas desde Notion"
          subtitle={
            fetchStatus === 'ok' && accounts.length > 0
              ? `${accounts.length} cuentas cargadas`
              : 'Sin datos — sincroniza para cargar'
          }
          right={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {syncMsg && (
                <span style={{ fontSize: 12, color: syncStatus === 'ok' ? C.pos : C.neg }}>
                  {syncMsg}
                </span>
              )}
              <Button
                primary
                icon={<Icon.refresh size={14} />}
                onClick={handleSync}
                disabled={syncStatus === 'loading'}
              >
                {syncStatus === 'loading' ? 'Sincronizando…' : 'Sincronizar'}
              </Button>
            </div>
          }
        />

        {/* Estado de carga */}
        {fetchStatus === 'loading' && (
          <div style={{ padding: 32, textAlign: 'center', color: C.textMute, fontSize: 13 }}>
            Cargando…
          </div>
        )}
        {fetchStatus === 'error' && (
          <div style={{ padding: 32, textAlign: 'center', color: C.neg, fontSize: 13 }}>
            No se pudo conectar con el backend. Asegúrate de que esté corriendo en{' '}
            <code style={{ fontFamily: 'monospace' }}>{API}</code>.
          </div>
        )}

        {/* Sin datos */}
        {fetchStatus === 'ok' && accounts.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: C.textMute }}>
              No hay cuentas sincronizadas. Configura el token de Notion en{' '}
              <strong>Ajustes</strong> y presiona <strong>Sincronizar</strong>.
            </div>
          </div>
        )}

        {/* Tabla */}
        {accounts.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            {/* Cabecera */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 70px 90px 140px 130px',
              gap: 12, padding: '8px 4px 10px',
              borderBottom: `1px solid ${C.border}`,
              fontSize: 11, color: C.textMute,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8,
              minWidth: 680,
            }}>
              <span>Nombre</span>
              <span>Balance inicial</span>
              <span>Divisa</span>
              <span>Estado</span>
              <span>Cuenta bancaria</span>
              <span>Tipo de cuenta</span>
            </div>

            {/* Filas */}
            {accounts.map((a, i) => {
              const tipoColor = TIPO_COLOR[a.tipoCuenta] ?? C.textDim;
              const estadoStyle = ESTADO_STYLE(a.estado);
              return (
                <div key={a.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 70px 90px 140px 130px',
                  gap: 12, padding: '12px 4px', alignItems: 'center',
                  borderBottom: i < accounts.length - 1 ? `1px solid ${C.border}` : 'none',
                  minWidth: 680,
                }}>
                  <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>
                    {a.nombre || '—'}
                  </div>
                  <div style={{ fontSize: 13, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
                    {a.balanceInicial != null
                      ? `S/ ${a.balanceInicial.toLocaleString('es-PE')}`
                      : <span style={{ color: C.textMute }}>—</span>}
                  </div>
                  <Tag>{a.divisa || '—'}</Tag>
                  <Tag bg={estadoStyle.bg} color={estadoStyle.color}>
                    {a.estado || '—'}
                  </Tag>
                  <Tag bg="rgba(63,86,28,0.05)" color={C.textDim}>
                    {a.cuentaBancaria || '—'}
                  </Tag>
                  <Tag bg={tipoColor + '22'} color={tipoColor}>
                    {a.tipoCuenta || '—'}
                  </Tag>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
