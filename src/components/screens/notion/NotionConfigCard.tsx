import type { CSSProperties } from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Button, Card, CardHeader } from '@/components/ui';
import type { DataSource, NotionConfig } from '@/shared/types/finance.types';
import { StatusBadge } from './StatusBadge';
import type { NotionSourceField, Status } from './types';

interface NotionConfigCardProps {
  config: NotionConfig | null;
  token: string;
  databases: DataSource[];
  loadDbStatus: Status;
  searchStatus: Status;
  saveStatus: Status;
  sourceFields: NotionSourceField[];
  onTokenChange: (value: string) => void;
  onLoadDatabases: () => void;
  onSearch: () => void;
  onSave: () => void;
}

const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: `1px solid ${C.border}`, background: C.cardHi,
  fontFamily: 'var(--font-ui)', fontSize: 13, color: C.text,
  outline: 'none', boxSizing: 'border-box',
};

export function NotionConfigCard({
  config,
  token,
  databases,
  loadDbStatus,
  searchStatus,
  saveStatus,
  sourceFields,
  onTokenChange,
  onLoadDatabases,
  onSearch,
  onSave,
}: NotionConfigCardProps) {
  return (
    <Card>
      <CardHeader title="Actualizar configuración" subtitle="Introduce tu token de integración de Notion" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {config?.isConfigured && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: `${C.pos}08`, border: `1px solid ${C.pos}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Token guardado activo</div>
              <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>Carga las bases de datos directamente sin reintroducir el token</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {loadDbStatus !== 'idle' && (
                <StatusBadge
                  status={loadDbStatus}
                  msg={loadDbStatus === 'ok' ? `${databases.length} bases encontradas` : 'Error al cargar'}
                />
              )}
              <Button
                primary
                icon={loadDbStatus === 'loading' ? undefined : <Icon.db size={14} />}
                onClick={onLoadDatabases}
                disabled={loadDbStatus === 'loading'}
              >
                {loadDbStatus === 'loading' ? 'Cargando...' : 'Cargar bases de datos'}
              </Button>
            </div>
          </div>
        )}

        <div>
          <label style={{ fontSize: 11.5, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
            Nuevo token de integración
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="password"
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={e => onTokenChange(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <Button
              primary
              icon={searchStatus === 'loading' ? undefined : <Icon.search size={14} />}
              onClick={onSearch}
              disabled={!token.trim() || searchStatus === 'loading'}
            >
              {searchStatus === 'loading' ? 'Buscando...' : 'Buscar bases de datos'}
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
            {sourceFields.map(({ label, value, onChange }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12.5, color: C.textDim, fontWeight: 500 }}>{label}</span>
                <select
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">- Sin seleccionar -</option>
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
            onClick={onSave}
            disabled={saveStatus === 'loading' || (!token.trim() && databases.length === 0)}
          >
            {saveStatus === 'loading' ? 'Guardando...' : 'Guardar configuración'}
          </Button>
          {saveStatus !== 'idle' && (
            <StatusBadge status={saveStatus} msg={saveStatus === 'ok' ? 'Guardado' : 'Error al guardar'} />
          )}
        </div>
      </div>
    </Card>
  );
}
