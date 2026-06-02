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
  notionDataSources: DataSource[];
  ingresosSourceId: string | null;
  gastosUnicosSourceId: string | null;
  gastosDeudasSourceId: string | null;
  deudasSourceId: string | null;
}

interface DbProperty { name: string; type: string }

interface IngresoRow {
  id: string;
  nombre: string;
  ingreso: number | null;
  categoriaIngreso: string;
  cuentaBancaria: string;
  fecha: string | null;
  syncedAt: string;
}

interface GastoUnicoRow {
  id: string;
  nombre: string;
  categoriaGasto: string;
  cuentaBancaria: string;
  monto: number | null;
  fecha: string | null;
  syncedAt: string;
}

interface GastoDeudaRow {
  id: string;
  nombre: string;
  categoriaGasto: string;
  cuentaBancaria: string;
  montoGastado: number | null;
  cualDeuda: string;
  fecha: string | null;
  syncedAt: string;
}

interface DeudaRow {
  id: string;
  nombre: string;
  estado: boolean;
  fechaInicio: string | null;
  monto: number | null;
  ciclo: string;
  tipoPago: string;
  siguientePago: string | null;
  pagoVigente: boolean | null;
  diasRestantes: number | null;
  cuotasPagadas: number | null;
  cuotasPendientes: number | null;
  cuotas: number | null;
}

type Status = 'idle' | 'loading' | 'ok' | 'error';

function fmtFecha(fecha: string | null): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (d.getUTCSeconds() === 59) return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PROP_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  title:             { label: 'Título',          color: C.text     },
  rich_text:         { label: 'Texto',            color: C.textDim  },
  number:            { label: 'Número',           color: C.cyan     },
  select:            { label: 'Selección',        color: C.purple   },
  multi_select:      { label: 'Multi-selección',  color: C.purple   },
  date:              { label: 'Fecha',            color: C.warn     },
  checkbox:          { label: 'Casilla',          color: C.pos      },
  relation:          { label: 'Relación',         color: C.primary  },
  formula:           { label: 'Fórmula',          color: C.primary  },
  rollup:            { label: 'Resumen',          color: C.primary  },
  people:            { label: 'Persona',          color: C.textDim  },
  files:             { label: 'Archivo',          color: C.textDim  },
  url:               { label: 'URL',              color: C.cyan     },
  email:             { label: 'Email',            color: C.cyan     },
  phone_number:      { label: 'Teléfono',         color: C.cyan     },
  created_time:      { label: 'Creación',         color: C.textDim  },
  last_edited_time:  { label: 'Últ. edición',     color: C.textDim  },
  status:            { label: 'Estado',           color: C.pos      },
  unique_id:         { label: 'ID único',         color: C.textDim  },
};

function propMeta(type: string): { label: string; color: string } {
  return PROP_TYPE_LABEL[type] ?? { label: type, color: C.textDim };
}

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
  const [config, setConfig]       = React.useState<NotionConfig | null>(null);
  const [token, setToken]         = React.useState('');
  const [databases, setDatabases] = React.useState<DataSource[]>([]);
  const [ingresosId, setIngresosId]           = React.useState('');
  const [gastosUnicosId, setGastosUnicosId]   = React.useState('');
  const [gastosDeudasId, setGastosDeudasId]   = React.useState('');
  const [deudasId, setDeudasId]               = React.useState('');
  const [searchStatus, setSearchStatus]       = React.useState<Status>('idle');
  const [saveStatus, setSaveStatus]           = React.useState<Status>('idle');
  const [syncIngStatus, setSyncIngStatus]     = React.useState<Status>('idle');
  const [syncIngCount, setSyncIngCount]       = React.useState<number | null>(null);
  const [syncGuStatus, setSyncGuStatus]       = React.useState<Status>('idle');
  const [syncGuCount, setSyncGuCount]         = React.useState<number | null>(null);
  const [syncGdStatus, setSyncGdStatus]       = React.useState<Status>('idle');
  const [syncGdCount, setSyncGdCount]         = React.useState<number | null>(null);
  const [syncDeuStatus, setSyncDeuStatus]     = React.useState<Status>('idle');
  const [syncDeuCount, setSyncDeuCount]       = React.useState<number | null>(null);
  const [deleteStatus, setDeleteStatus]       = React.useState<Status>('idle');
  const [backStatus, setBackStatus]           = React.useState<Status>('loading');
  const [schema, setSchema]                   = React.useState<DbProperty[]>([]);
  const [schemaStatus, setSchemaStatus]       = React.useState<Status>('idle');
  const [schemaDbId, setSchemaDbId]           = React.useState('');
  const [dataTab, setDataTab]                 = React.useState<'ingresos' | 'gastos_unicos' | 'gastos_deudas' | 'deudas_suscripciones'>('ingresos');
  const [ingresos, setIngresos]               = React.useState<IngresoRow[]>([]);
  const [gastosUnicos, setGastosUnicos]       = React.useState<GastoUnicoRow[]>([]);
  const [gastosDeudas, setGastosDeudas]       = React.useState<GastoDeudaRow[]>([]);
  const [deudas, setDeudas]                   = React.useState<DeudaRow[]>([]);
  const [dataLoading, setDataLoading]         = React.useState(false);

  async function loadData() {
    setDataLoading(true);
    try {
      const [ri, rgu, rgd, rde] = await Promise.all([
        fetch(`${API}/notion-payments/ingresos`),
        fetch(`${API}/notion-payments/gastos-unicos`),
        fetch(`${API}/notion-payments/gastos-deudas`),
        fetch(`${API}/notion-payments/accounts`),
      ]);
      if (ri.ok)  setIngresos(await ri.json());
      if (rgu.ok) setGastosUnicos(await rgu.json());
      if (rgd.ok) setGastosDeudas(await rgd.json());
      if (rde.ok) setDeudas(await rde.json());
    } catch { /* silencioso */ }
    finally { setDataLoading(false); }
  }

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
        if (data.notionDataSources.length) setDatabases(data.notionDataSources);
        setIngresosId(data.ingresosSourceId ?? '');
        setGastosUnicosId(data.gastosUnicosSourceId ?? '');
        setGastosDeudasId(data.gastosDeudasSourceId ?? '');
        setDeudasId(data.deudasSourceId ?? '');
        loadData();
      })
      .catch(() => setBackStatus('error'));
  }, []);

  async function handleSearch() {
    if (!token.trim()) return;
    setSearchStatus('loading');
    setDatabases([]);
    setSchema([]);
    setSchemaStatus('idle');
    try {
      const r = await fetch(`${API}/notion-payments/config/search-databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionToken: token }),
      });
      if (!r.ok) throw new Error();
      const list: DataSource[] = await r.json();
      setDatabases(list);
      setSearchStatus(list.length ? 'ok' : 'error');
    } catch { setSearchStatus('error'); }
  }

  async function handleSave() {
    setSaveStatus('loading');
    try {
      const allIds = [ingresosId, gastosUnicosId, gastosDeudasId].filter(Boolean);
      const ds = databases.filter(d => allIds.includes(d.id));
      const r = await fetch(`${API}/notion-payments/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notionToken:          token || undefined,
          notionDataSources:    ds,
          ingresosSourceId:     ingresosId     || null,
          gastosUnicosSourceId: gastosUnicosId || null,
          gastosDeudasSourceId: gastosDeudasId || null,
        }),
      });
      if (!r.ok) throw new Error();
      const data: NotionConfig = await r.json();
      setConfig(data);
      setSaveStatus('ok');
      setToken('');
    } catch { setSaveStatus('error'); }
  }

  async function handleLoadSchema(dbId: string) {
    if (!dbId) return;
    setSchemaDbId(dbId);
    setSchemaStatus('loading');
    setSchema([]);
    try {
      const r = await fetch(`${API}/notion-payments/databases/${dbId}/properties`);
      if (!r.ok) throw new Error();
      const data: DbProperty[] = await r.json();
      setSchema(data);
      setSchemaStatus('ok');
    } catch { setSchemaStatus('error'); }
  }

  async function handleSyncIngresos() {
    setSyncIngStatus('loading'); setSyncIngCount(null);
    try {
      const r = await fetch(`${API}/notion-payments/sync-ingresos`, { method: 'POST' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
      const d: { synced: number } = await r.json();
      setSyncIngCount(d.synced); setSyncIngStatus('ok');
      loadData();
    } catch { setSyncIngStatus('error'); }
  }

  async function handleSyncGastosUnicos() {
    setSyncGuStatus('loading'); setSyncGuCount(null);
    try {
      const r = await fetch(`${API}/notion-payments/sync-gastos-unicos`, { method: 'POST' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
      const d: { synced: number } = await r.json();
      setSyncGuCount(d.synced); setSyncGuStatus('ok');
      loadData();
    } catch { setSyncGuStatus('error'); }
  }

  async function handleSyncGastosDeudas() {
    setSyncGdStatus('loading'); setSyncGdCount(null);
    try {
      const r = await fetch(`${API}/notion-payments/sync-gastos-deudas`, { method: 'POST' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
      const d: { synced: number } = await r.json();
      setSyncGdCount(d.synced); setSyncGdStatus('ok');
      loadData();
    } catch { setSyncGdStatus('error'); }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar todos los datos sincronizados?')) return;
    setDeleteStatus('loading');
    try {
      const r = await fetch(`${API}/notion-payments/data`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      setIngresos([]); setGastosUnicos([]); setGastosDeudas([]);
      setDeleteStatus('ok');
    } catch { setDeleteStatus('error'); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${C.border}`, background: C.cardHi,
    fontFamily: 'Inter', fontSize: 13, color: C.text,
    outline: 'none', boxSizing: 'border-box',
  };

  const activeDbId = ingresosId || gastosUnicosId || gastosDeudasId || '';
  const activeDbName = databases.find(d => d.id === activeDbId)?.name ?? '';

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
              <Eyebrow>Tablas Notion</Eyebrow>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {config.notionDataSources.length > 0
                  ? config.notionDataSources.map(ds => (
                      <span key={ds.id} style={{ fontSize: 13, color: C.text }}>{ds.name}</span>
                    ))
                  : <span style={{ fontSize: 13, color: C.textMute }}>Sin seleccionar</span>
                }
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 11.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block' }}>
                Tablas Notion
              </label>
              {([
                { label: 'Ingresos',          value: ingresosId,     setter: setIngresosId     },
                { label: 'Gastos Únicos',     value: gastosUnicosId, setter: setGastosUnicosId },
                { label: 'Gastos por Deudas', value: gastosDeudasId, setter: setGastosDeudasId },
              ] as const).map(({ label, value, setter }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12.5, color: C.textDim, fontWeight: 500 }}>{label}</span>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">— Sin seleccionar —</option>
                    {databases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              ))}
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

      {/* Columnas de la base de datos seleccionada */}
      {activeDbId && (
        <Card>
          <CardHeader
            title="Columnas de la base de datos"
            subtitle={activeDbName || 'Base de datos seleccionada'}
            right={
              <Button
                icon={schemaStatus === 'loading' ? undefined : <Icon.list size={13} />}
                onClick={() => handleLoadSchema(activeDbId)}
                disabled={schemaStatus === 'loading'}
              >
                {schemaStatus === 'loading' ? 'Cargando…' : schemaDbId === activeDbId && schema.length > 0 ? 'Actualizar' : 'Ver columnas'}
              </Button>
            }
          />

          {schemaStatus === 'error' && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 13, color: '#c83c3c' }}>
              No se pudieron cargar las propiedades. Verifica que el token tenga acceso a esta base de datos.
            </div>
          )}

          {schemaStatus === 'idle' && schema.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
              Haz clic en «Ver columnas» para ver las propiedades de esta base de datos.
            </div>
          )}

          {schema.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {/* Cabecera */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', padding: '8px 16px', background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.9 }}>Nombre</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.9 }}>Tipo</span>
              </div>
              {/* Filas */}
              {schema.map((prop, i) => {
                const meta = propMeta(prop.type);
                return (
                  <React.Fragment key={i}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', padding: '10px 16px', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{prop.name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: C.textDim }}>{meta.label}</span>
                      </span>
                    </div>
                    {i < schema.length - 1 && <div style={{ height: 1, background: C.border, margin: '0 16px' }} />}
                  </React.Fragment>
                );
              })}
              {/* Footer */}
              <div style={{ padding: '8px 16px', background: 'rgba(63,86,28,0.02)', borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.textMute }}>{schema.length} propiedades</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sincronización */}
      <Card>
        <CardHeader
          title="Sincronización"
          subtitle="Importa datos desde las tablas de Notion"
          right={<Tag bg={`${accent}18`} color={accent} dot={accent}>Beta</Tag>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Ingresos',          handler: handleSyncIngresos,     status: syncIngStatus, count: syncIngCount, sourceId: config?.ingresosSourceId },
            { label: 'Gastos Únicos',     handler: handleSyncGastosUnicos, status: syncGuStatus,  count: syncGuCount,  sourceId: config?.gastosUnicosSourceId },
            { label: 'Gastos por Deudas', handler: handleSyncGastosDeudas, status: syncGdStatus,  count: syncGdCount,  sourceId: config?.gastosDeudasSourceId },
          ] as const).map(({ label, handler, status, count, sourceId }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textMute, width: 140, flexShrink: 0 }}>{label}</div>
              <Button
                primary
                icon={<Icon.arrowUp size={14} />}
                onClick={handler}
                disabled={status === 'loading' || !sourceId}
              >
                {status === 'loading' ? 'Sincronizando…' : `Sincronizar`}
              </Button>
              {status !== 'idle' && (
                <StatusBadge status={status} msg={count != null ? `${count} registros importados` : undefined} />
              )}
              {!sourceId && <span style={{ fontSize: 12, color: C.textMute }}>Sin tabla configurada</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Datos sincronizados */}
      {(ingresos.length > 0 || gastosUnicos.length > 0 || gastosDeudas.length > 0 || dataLoading) && (
        <Card>
          <CardHeader
            title="Datos sincronizados"
            subtitle={`${ingresos.length + gastosUnicos.length + gastosDeudas.length} registros totales`}
            right={
              <button onClick={loadData} disabled={dataLoading}
                style={{ background: 'none', border: 'none', cursor: dataLoading ? 'default' : 'pointer', color: C.textMute, fontSize: 12, fontFamily: 'Inter', padding: 0 }}>
                {dataLoading ? 'Actualizando…' : '↻ Actualizar'}
              </button>
            }
          />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
            {([
              { id: 'ingresos',      label: 'Ingresos',          count: ingresos.length      },
              { id: 'gastos_unicos', label: 'Gastos Únicos',     count: gastosUnicos.length  },
              { id: 'gastos_deudas', label: 'Gastos por Deudas', count: gastosDeudas.length  },
            ] as const).map(t => {
              const active = dataTab === t.id;
              return (
                <button key={t.id} onClick={() => setDataTab(t.id)} style={{
                  padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? C.text : C.textMute,
                  borderBottom: `2px solid ${active ? C.olive : 'transparent'}`,
                  marginBottom: -1,
                }}>
                  {t.label}
                  <span style={{ marginLeft: 6, fontSize: 11, background: `${C.olive}18`, color: C.olive, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {dataLoading && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Cargando datos…</div>
          )}

          {/* Tabla Ingresos */}
          {!dataLoading && dataTab === 'ingresos' && (
            <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>
                  {['Nombre', 'Ingreso', 'Categoría', 'Cuenta Bancaria', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {ingresos.map((row, i) => (
                    <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.015)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text, borderBottom: i < ingresos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.nombre || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: i < ingresos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        {row.ingreso != null ? `S/ ${row.ingreso.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < ingresos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.categoriaIngreso || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < ingresos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.cuentaBancaria || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textMute, borderBottom: i < ingresos.length - 1 ? `1px solid ${C.border}` : 'none', whiteSpace: 'nowrap' }}>
                        {row.fecha ? fmtFecha(row.fecha) : '—'}
                      </td>
                    </tr>
                  ))}
                  {ingresos.length === 0 && <tr><td colSpan={5} style={{ padding: '20px 14px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza primero.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla Gastos Únicos */}
          {!dataLoading && dataTab === 'gastos_unicos' && (
            <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>
                  {['Nombre', 'Categoría', 'Cuenta Bancaria', 'Monto', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {gastosUnicos.map((row, i) => (
                    <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.015)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text, borderBottom: i < gastosUnicos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.nombre || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < gastosUnicos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.categoriaGasto || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < gastosUnicos.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.cuentaBancaria || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: i < gastosUnicos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        {row.monto != null ? `S/ ${row.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: C.textMute, borderBottom: i < gastosUnicos.length - 1 ? `1px solid ${C.border}` : 'none', whiteSpace: 'nowrap' }}>
                        {row.fecha ? fmtFecha(row.fecha) : '—'}
                      </td>
                    </tr>
                  ))}
                  {gastosUnicos.length === 0 && <tr><td colSpan={5} style={{ padding: '20px 14px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza primero.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla Gastos por Deudas */}
          {!dataLoading && dataTab === 'gastos_deudas' && (
            <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>
                  {['Nombre', 'Categoría', 'Cuenta Bancaria', 'Monto Gastado', '¿Cuál deuda?', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(63,86,28,0.04)', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {gastosDeudas.map((row, i) => (
                    <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.015)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text, borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.nombre || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.categoriaGasto || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.cuentaBancaria || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        {row.montoGastado != null ? `S/ ${row.montoGastado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: C.textDim, borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none' }}>{row.cualDeuda || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.textMute, borderBottom: i < gastosDeudas.length - 1 ? `1px solid ${C.border}` : 'none', whiteSpace: 'nowrap' }}>
                        {row.fecha ? fmtFecha(row.fecha) : '—'}
                      </td>
                    </tr>
                  ))}
                  {gastosDeudas.length === 0 && <tr><td colSpan={6} style={{ padding: '20px 14px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Sin datos. Sincroniza primero.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

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
