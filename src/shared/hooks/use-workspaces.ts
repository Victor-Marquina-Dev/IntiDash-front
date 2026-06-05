'use client';

import React from 'react';
import {
  ensureActiveWorkspace,
  getActiveWorkspace,
  setActiveWorkspace,
  type Workspace,
} from '@/shared/services/workspace.service';

/**
 * Carga los workspaces del usuario, garantiza un workspace activo y permite cambiarlo.
 * Al cambiar de workspace recarga la app para re-fetchear todos los datos del nuevo espacio.
 */
export function useWorkspaces(enabled: boolean) {
  const [list, setList]       = React.useState<Workspace[]>([]);
  const [activeId, setActive] = React.useState<string | null>(() => getActiveWorkspace());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    ensureActiveWorkspace()
      .then(ws => {
        if (!alive) return;
        setList(ws);
        setActive(getActiveWorkspace());
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [enabled]);

  const switchTo = React.useCallback((id: string) => {
    if (id === getActiveWorkspace()) return;
    setActiveWorkspace(id);
    setActive(id);
    // Recargar para que dashboard, cuentas, etc. se re-fetcheen con el nuevo workspace.
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const ws = await ensureActiveWorkspace();
      setList(ws);
      setActive(getActiveWorkspace());
    } finally {
      setLoading(false);
    }
  }, []);

  const active = list.find(w => w.id === activeId) ?? null;
  const activeRole = active?.role ?? null;
  const canWrite = activeRole === 'owner' || activeRole === 'editor';

  return { list, activeId, active, activeRole, canWrite, loading, switchTo, refresh };
}
