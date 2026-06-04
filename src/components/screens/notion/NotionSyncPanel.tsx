import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Button, Card, CardHeader, Tag } from '@/components/ui';
import type { NotionConfig } from '@/shared/types/finance.types';
import { StatusBadge } from './StatusBadge';
import { SYNC_TARGETS, type SyncKey, type SyncRowState } from './types';

interface NotionSyncPanelProps {
  accent: string;
  config: NotionConfig | null;
  syncState: Record<SyncKey, SyncRowState>;
  onSync: (key: SyncKey, endpoint: string) => void;
}

export function NotionSyncPanel({ accent, config, syncState, onSync }: NotionSyncPanelProps) {
  return (
    <Card>
      <CardHeader
        title="Sincronización"
        subtitle="Importa datos desde las tablas de Notion"
        right={<Tag bg={`${accent}18`} color={accent} dot={accent}>Beta</Tag>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SYNC_TARGETS.map(({ key, label, endpoint, sourceIdKey }) => {
          const { status, count } = syncState[key];
          const sourceId = config?.[sourceIdKey];
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textMute, width: 140, flexShrink: 0 }}>{label}</div>
              <Button
                primary
                icon={<Icon.arrowUp size={14} />}
                onClick={() => onSync(key, endpoint)}
                disabled={status === 'loading' || !sourceId}
              >
                {status === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              {status !== 'idle' && (
                <StatusBadge status={status} msg={count != null ? `${count} registros importados` : undefined} />
              )}
              {!sourceId && <span style={{ fontSize: 12, color: C.textMute }}>Sin tabla configurada</span>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
