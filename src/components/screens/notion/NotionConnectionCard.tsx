import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Eyebrow } from '@/components/ui';
import type { NotionConfig } from '@/shared/types/finance.types';
import { StatusBadge } from './StatusBadge';

interface NotionConnectionCardProps {
  accent: string;
  config: NotionConfig | null;
}

export function NotionConnectionCard({ accent, config }: NotionConnectionCardProps) {
  return (
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
              {(config.notionDataSources?.length ?? 0) > 0
                ? config.notionDataSources?.map(ds => (
                    <span key={ds.id} style={{ fontSize: 13, color: C.text }}>{ds.name}</span>
                  ))
                : <span style={{ fontSize: 13, color: C.textMute }}>Sin seleccionar</span>
              }
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
