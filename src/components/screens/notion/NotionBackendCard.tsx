import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import type { Status } from './types';

interface NotionBackendCardProps {
  accent: string;
  apiUrl: string;
  status: Status;
}

export function NotionBackendCard({ accent, apiUrl, status }: NotionBackendCardProps) {
  return (
    <Card pad={20}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, color: accent, display: 'grid', placeItems: 'center' }}>
          <Icon.link size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Backend API</div>
          <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{apiUrl}</div>
        </div>
        <StatusBadge status={status} msg={status === 'ok' ? 'Conectado' : status === 'error' ? 'Sin conexion' : undefined} />
      </div>
    </Card>
  );
}
