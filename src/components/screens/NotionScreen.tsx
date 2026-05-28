'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Button, Eyebrow } from '@/components/ui';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface DataSource { id: string; name: string }

interface NotionConfig {
  isConfigured: boolean;
  notionTokenMasked: string | null;
  notionDataSourceId: string | null;
  notionDataSourceName: string | null;
  notionDataSources: DataSource[];
}

interface SyncResult { pulled: number; pushed: number; totalNotion: number }

type Status = 'idle' | 'loading' | 'ok' | 'error';

function StatusBadge({ status, msg }: { status: Status; msg?: string }) {
  const map: Record<Status, { bg: string; color: string; label: string }> = {
    idle:    { bg: `${C.border}`,            color: C.textMute, label: 'Sin cambios'  },
    loading: { bg: `${C.primary}18`,         color: C.primary,  label: 'Cargando…'   },
    ok:      { bg: `${C.pos}18`,             color: C.pos,      label: msg ?? 'Listo' },
    error:   { bg: 'rgba(200,60,60,0.12)',   color: '#c83c3c',  label: msg ?? 'Error' },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

interface NotionScreenProps { accent: string }

export function NotionScreen({ accent }: Readonly<NotionScreenProps>) {
  const [config, setConfig] = React.useState<NotionConfig | null>(null);
  const [token, setToken] = React.useState('');
  const [databases, setDatabases] = React.useState<DataSource[]>([]);
  const [selectedId, setSelectedId] = React.useState('');
  const [searchStatus, setSearchStatus] = React.useState<Status>('idle');
  const [saveStatus, setSaveStatus]     = React.useState<Status>('idle');
  const [syncStatus, setSyncStatus]     = React.useState<Status>('idle');
  const [syncResult, setSyncResult]     = React.useState<SyncResult | null>(null);
  const [deleteStatus, setDeleteStatus] = React.useState<Status>('idle');
  const [backStatus, setBackStatus]     = React.useState<Status>('loading');

  React.useEffect(() => {
    fetch(`${API}/health`)
      .then(r => r.json())
      .then(() => {
        setBackStatus('ok');
        return fetch(`${API}/notion-payments/config`);
      })
      .then(r => r.json())
      .then((data: NotionConfig) => {
        setConfig(data);
        if (data.notionDataSources.length) {
          setDatabases(data.notionDataSources);
          setSelectedId(data.notionDataSourceId ?? '');
        }
      })
      .catch(() => setBackStatus('error'));
  }, []);

  async function handleSearch() {
    if (!token.trim()) return;
    setSearchStatus('loading');
    setDatabases([]);
    try {
      const r = await fetch(`${API}/notion-payments/config/search-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionToken: token }),
      });
      if (!r.ok) throw new Error();
      const list: DataSource[] = await r.json();
      setDatabases(list);
      setSelectedId(list[0]?.id ?? '');
      setSearchStatus(list.length ? 'ok' : 'error');
    } catch { setSearchStatus('error'); }
  }

  async function handleSave() {
    setSaveStatus('loading');
    try {
      const ds = selectedId ? databases.filter(d => d.id === selectedId) : [];
      const r = await fetch(`${API}/notion-payments/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionToken: token || undefined, notionDataSources: ds }),
      });
      if (!r.ok) throw new Error();
      const data: NotionConfig = await r.json();
      setConfig(data);
      setSaveStatus('ok');
      setToken('');
    } catch { setSaveStatus('error'); }
  }

  async function handleSync() {
    setSyncStatus('loading');
    setSyncResult(null);
    try {
      const r = await fetch(`${API}/notion-payments/sync`, { method: 'POST' });
      if (!r.ok) throw new Error();
      const data: SyncResult = await r.json();
      setSyncResult(data);
      setSyncStatus('ok');
    } catch { setSyncStatus('error'); }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar todos los datos sincronizados?')) return;
    setDeleteStatus('loading');
    try {
      const r = await fetch(`${API}/notion-payments/data`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      setDeleteStatus('ok');
    } catch { setDeleteStatus('error'); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${C.border}`, background: C.cardHi,
    fontFamily: 'Inter', fontSize: 13, color: C.text,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

      {/* Estado del backend */}
      <Card pad={20}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, color: accent, display: 'grid', placeItems: 'center' }}>
            <Icon.link size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Backend API</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{API}</div>
          </div>
          <StatusBadge status={backStatus} msg={backStatus === 'ok' ? 'Conectado' : backStatus === 'error' ? 'Sin conexión' : undefined} />
        </div>
      </Card>

      {/* Estado actual de Notion */}
      <Card>
        <CardHeader
          title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon.db size={14} style={{ color: accent }} />Conexión con Notion</span>}
          subtitle="Token de integración y base de datos seleccionada"
          right={<StatusBadge status={config?.isConfigured ? 'ok' : 'idle'} msg={config?.isConfigured ? 'Configurado' : 'Sin configurar'} />}
        />
        {config && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}` }}>
              <Eyebrow>Token activo</Eyebrow>
              <div style={{ marginTop: 6, fontSize: 13, fontFamily: 'monospace', color: C.text, letterSpacing: 0.3 }}>
                {config.notionTokenMasked ?? <span style={{ color: C.textMute }}>Sin token</span>}
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}` }}>
              <Eyebrow>Base de datos</Eyebrow>
              <div style={{ marginTop: 6, fontSize: 13, color: C.text }}>
                {config.notionDataSourceName ?? <span style={{ color: C.textMute }}>Sin seleccionar</span>}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Configurar token */}
      <Card>
        <CardHeader title="Actualizar configuración" subtitle="Introduce tu token de integración de Notion" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
              Token de integración
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="password"
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={e => { setToken(e.target.value); setSearchStatus('idle'); }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <Button
                primary
                icon={searchStatus === 'loading' ? undefined : <Icon.search size={14} />}
                onClick={handleSearch}
                disabled={!token.trim() || searchStatus === 'loading'}
              >
                {searchStatus === 'loading' ? 'Buscando…' : 'Buscar bases de datos'}
              </Button>
            </div>
            {searchStatus !== 'idle' && (
              <div style={{ marginTop: 8 }}>
                <StatusBadge
                  status={searchStatus}
                  msg={searchStatus === 'ok' ? `${databases.length} base${databases.length !== 1 ? 's' : ''} encontrada${databases.length !== 1 ? 's' : ''}` : 'No se encontraron bases de datos'}
                />
              </div>
            )}
          </div>

          {databases.length > 0 && (
            <div>
              <label style={{ fontSize: 11.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                Seleccionar base de datos
              </label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {databases.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              primary
              icon={<Icon.check size={14} />}
              onClick={handleSave}
              disabled={saveStatus === 'loading' || (!token.trim() && databases.length === 0)}
            >
              {saveStatus === 'loading' ? 'Guardando…' : 'Guardar configuración'}
            </Button>
            {saveStatus !== 'idle' && (
              <StatusBadge status={saveStatus} msg={saveStatus === 'ok' ? 'Guardado' : 'Error al guardar'} />
            )}
          </div>
        </div>
      </Card>

      {/* Sincronización */}
      <Card>
        <CardHeader
          title="Sincronización"
          subtitle="Importa transacciones desde la base de datos de Notion"
          right={<Tag bg={`${accent}18`} color={accent} dot={accent}>Beta</Tag>}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Button
            primary
            icon={<Icon.arrowUp size={14} />}
            onClick={handleSync}
            disabled={syncStatus === 'loading' || !config?.isConfigured}
          >
            {syncStatus === 'loading' ? 'Sincronizando…' : 'Sincronizar ahora'}
          </Button>
          {syncStatus !== 'idle' && (
            <StatusBadge
              status={syncStatus}
              msg={syncResult ? `${syncResult.pulled} importadas · ${syncResult.totalNotion} en Notion` : undefined}
            />
          )}
          {!config?.isConfigured && (
            <span style={{ fontSize: 12, color: C.textMute }}>Configura el token primero</span>
          )}
        </div>
      </Card>

      {/* Zona peligrosa */}
      <Card style={{ borderColor: 'rgba(200,60,60,0.22)' }}>
        <CardHeader
          title={<span style={{ color: '#c83c3c' }}>Zona peligrosa</span>}
          subtitle="Acciones irreversibles sobre los datos sincronizados"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={handleDelete}
            disabled={deleteStatus === 'loading'}
            style={{
              padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.28)',
              color: '#c83c3c', fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon.trash size={14} />
            {deleteStatus === 'loading' ? 'Eliminando…' : 'Borrar datos sincronizados'}
          </button>
          {deleteStatus !== 'idle' && (
            <StatusBadge status={deleteStatus} msg={deleteStatus === 'ok' ? 'Datos eliminados' : 'Error al eliminar'} />
          )}
        </div>
      </Card>
    </div>
  );
}
