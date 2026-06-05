'use client';

import React from 'react';
import { adminService, type AdminSummary, type AdminUser } from '@/shared/services/admin.service';

type AdminDashboardStatus = 'loading' | 'ready' | 'error';

export function useAdminDashboard() {
  const [summary, setSummary] = React.useState<AdminSummary | null>(null);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [status, setStatus] = React.useState<AdminDashboardStatus>('loading');
  const [errorMessage, setErrorMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const [nextSummary, nextUsers] = await Promise.all([
        adminService.getSummary(),
        adminService.getUsers(),
      ]);

      setSummary(nextSummary);
      setUsers(nextUsers);
      setStatus('ready');
    } catch (error: unknown) {
      setSummary(null);
      setUsers([]);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar el monitoreo');
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    Promise.all([
      adminService.getSummary(),
      adminService.getUsers(),
    ]).then(([nextSummary, nextUsers]) => {
      if (!active) return;
      setSummary(nextSummary);
      setUsers(nextUsers);
      setStatus('ready');
    }).catch((error: unknown) => {
      if (!active) return;
      setSummary(null);
      setUsers([]);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar el monitoreo');
    });

    return () => {
      active = false;
    };
  }, []);

  return {
    summary,
    users,
    status,
    errorMessage,
    refresh,
  };
}
