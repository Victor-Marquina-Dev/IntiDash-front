'use client';

import { useWorkspaceContext } from '@/shared/context/WorkspaceContext';

/**
 * Retorna el estado compartido de workspaces desde WorkspaceContext.
 * El parámetro `enabled` se mantiene por compatibilidad pero ya no tiene efecto
 * (el contexto siempre está activo cuando el provider está montado).
 */
export function useWorkspaces(_enabled = true) {
  return useWorkspaceContext();
}
