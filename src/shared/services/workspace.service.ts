import { apiClient, getActiveWorkspace, setActiveWorkspace } from './api-client';

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';
export type VisibilityMode = 'mutual' | 'owner_reads' | 'admin_only';

export const VISIBILITY_LABELS: Record<VisibilityMode, string> = {
  mutual:       'Ambos ven los datos del espacio',
  owner_reads:  'Solo yo veo los datos del invitado',
  admin_only:   'Solo yo como admin tengo acceso',
};

export interface Workspace {
  id: string;
  name: string;
  ownerUserId: string;
  role: WorkspaceRole;
  memberCount?: number;
  pendingInvites?: number;
  createdAt: string | null;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  visibilityMode: VisibilityMode;
  name: string;
  email: string;
  joinedAt: string | null;
}

export interface PendingInvite {
  token: string;
  role: WorkspaceRole;
  visibilityMode: VisibilityMode;
  workspaceId: string;
  workspaceName: string;
  invitedByName: string | null;
  createdAt: string | null;
  expiresAt: string | null;
}

export const workspaceService = {
  list:        () => apiClient.get<Workspace[]>('/workspaces'),
  create:      (name: string) => apiClient.post<{ id: string; name: string }>('/workspaces', { name }),
  members:     (wsId: string) => apiClient.get<WorkspaceMember[]>(`/workspaces/${wsId}/members`),
  myInvites:   () => apiClient.get<PendingInvite[]>('/workspaces/my-invites'),
  invite:      (wsId: string, email: string, role: WorkspaceRole, visibilityMode: VisibilityMode = 'mutual') =>
                 apiClient.post<{ token: string; inviteUrl: string; visibilityMode: VisibilityMode }>(
                   `/workspaces/${wsId}/invites`, { email, role, visibilityMode }),
  acceptInvite: (token: string, shareBack = false) =>
                 apiClient.post<{ workspaceId: string; role: WorkspaceRole; visibilityMode: VisibilityMode }>(
                   `/workspaces/invites/${token}/accept`, { shareBack }),
  rejectInvite: (token: string) => apiClient.post<{ rejected: boolean }>(`/workspaces/invites/${token}/reject`),
  removeMember:    (wsId: string, userId: string) => apiClient.delete<{ removed: boolean }>(`/workspaces/${wsId}/members/${userId}`),
  leaveWorkspace:  (wsId: string) => apiClient.post<{ left: boolean }>(`/workspaces/${wsId}/leave`, {}),
  deleteWorkspace: (wsId: string) => apiClient.delete<{ deleted: boolean }>(`/workspaces/${wsId}`),
};

/**
 * Garantiza que haya un workspace activo guardado. Si no hay (o el guardado ya no
 * pertenece al usuario), selecciona el primero de la lista. Devuelve la lista.
 */
export async function ensureActiveWorkspace(): Promise<Workspace[]> {
  const list = await workspaceService.list().catch(() => [] as Workspace[]);
  if (list.length === 0) return list;
  const current = getActiveWorkspace();
  const stillValid = current && list.some(w => w.id === current);
  if (!stillValid) setActiveWorkspace(list[0].id);
  return list;
}

export { getActiveWorkspace, setActiveWorkspace };
