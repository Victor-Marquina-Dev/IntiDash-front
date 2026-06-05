'use client';

import React from 'react';
import {
  ensureActiveWorkspace,
  getActiveWorkspace,
  setActiveWorkspace,
  type Workspace,
  type WorkspaceRole,
} from '@/shared/services/workspace.service';

interface WorkspaceContextValue {
  list: Workspace[];
  activeId: string | null;
  active: Workspace | null;
  activeRole: WorkspaceRole | null;
  canWrite: boolean;
  loading: boolean;
  wsVersion: number;
  switchTo: (id: string) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [list,      setList]      = React.useState<Workspace[]>([]);
  const [activeId,  setActiveId]  = React.useState<string | null>(() => getActiveWorkspace());
  const [loading,   setLoading]   = React.useState(true);
  const [wsVersion, setWsVersion] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    ensureActiveWorkspace()
      .then(ws => {
        if (!alive) return;
        setList(ws);
        setActiveId(getActiveWorkspace());
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const switchTo = React.useCallback((id: string) => {
    if (id === getActiveWorkspace()) return;
    setActiveWorkspace(id);
    setActiveId(id);
    setWsVersion(v => v + 1);
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const ws = await ensureActiveWorkspace();
      setList(ws);
      setActiveId(getActiveWorkspace());
      setWsVersion(v => v + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  const active     = list.find(w => w.id === activeId) ?? null;
  const activeRole = (active?.role ?? null) as WorkspaceRole | null;
  const canWrite   = activeRole === 'owner' || activeRole === 'editor';

  return (
    <WorkspaceContext.Provider value={{ list, activeId, active, activeRole, canWrite, loading, wsVersion, switchTo, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspaces debe usarse dentro de WorkspaceProvider');
  return ctx;
}
