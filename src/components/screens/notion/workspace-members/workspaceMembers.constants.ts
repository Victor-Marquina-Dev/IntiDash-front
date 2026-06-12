import type { WorkspaceRole, VisibilityMode } from '@/shared/services/workspace.service';

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner:  'Admin',
  editor: 'Editor',
  viewer: 'Lectura',
};

export const VISIBILITY_SHORT: Record<VisibilityMode, string> = {
  mutual:      'Mutuo',
  owner_reads: 'Solo yo leo',
  admin_only:  'Admin solo',
};

export const VISIBILITY_MODES: VisibilityMode[] = ['mutual', 'owner_reads', 'admin_only'];
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_EMOJI = '🏠';
export const EMOJI_OPTIONS = [
  '🏠','🏢','💼','💰','💑','👫','🌍','🎯',
  '📊','📈','⭐','🚀','💡','🎉','🌱','🤝',
  '💻','🎓','🏦','🌟','🔥','💪','🎨','🌈',
];

export type InviteeRow = { id: string; email: string; visibility: VisibilityMode };

export function createEmptyInvitee(): InviteeRow {
  return { id: crypto.randomUUID(), email: '', visibility: 'mutual' };
}

