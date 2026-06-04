import { Icon } from '@/components/icons';
import { Card, CardHeader } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import type { Status } from './types';

interface NotionDangerZoneProps {
  deleteStatus: Status;
  onDelete: () => void;
}

export function NotionDangerZone({ deleteStatus, onDelete }: NotionDangerZoneProps) {
  return (
    <Card style={{ borderColor: 'rgba(200,60,60,0.22)' }}>
      <CardHeader
        title={<span style={{ color: '#c83c3c' }}>Zona peligrosa</span>}
        subtitle="Acciones irreversibles sobre los datos sincronizados"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onDelete}
          disabled={deleteStatus === 'loading'}
          style={{
            padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.28)',
            color: '#c83c3c', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon.trash size={14} />
          {deleteStatus === 'loading' ? 'Eliminando...' : 'Borrar datos sincronizados'}
        </button>
        {deleteStatus !== 'idle' && (
          <StatusBadge status={deleteStatus} msg={deleteStatus === 'ok' ? 'Datos eliminados' : 'Error al eliminar'} />
        )}
      </div>
    </Card>
  );
}
