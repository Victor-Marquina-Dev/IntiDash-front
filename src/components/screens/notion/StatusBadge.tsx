import { C } from '@/lib/colors';
import type { Status } from './types';

export function StatusBadge({ status, msg }: Readonly<{ status: Status; msg?: string }>) {
  const map: Record<Status, { bg: string; color: string; label: string }> = {
    idle: { bg: `${C.border}`, color: C.textMute, label: 'Sin cambios' },
    loading: { bg: `${C.primary}18`, color: C.primary, label: 'Cargando...' },
    ok: { bg: `${C.pos}18`, color: C.pos, label: msg ?? 'Listo' },
    error: { bg: 'rgba(200,60,60,0.12)', color: '#c83c3c', label: msg ?? 'Error' },
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
