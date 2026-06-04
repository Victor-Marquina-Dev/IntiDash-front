'use client';

import React from 'react';
import { authService, type AuthUser } from '@/shared/services/auth.service';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export function useAuth() {
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    setStatus('loading');
    try {
      const response = await authService.me();
      setUser(response.user);
      setStatus(response.user ? 'authenticated' : 'anonymous');
    } catch {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    authService.me()
      .then(response => {
        if (!active) return;
        setUser(response.user);
        setStatus(response.user ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setErrorMessage('');
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setStatus('authenticated');
      return true;
    } catch (error: unknown) {
      setUser(null);
      setStatus('anonymous');
      setErrorMessage(error instanceof Error ? error.message : 'Error al iniciar sesión');
      return false;
    }
  }, []);

  const register = React.useCallback(async (name: string, email: string, password: string) => {
    setErrorMessage('');
    try {
      const response = await authService.register(name, email, password);
      setUser(response.user);
      setStatus(response.user ? 'authenticated' : 'anonymous');
      return true;
    } catch (error: unknown) {
      setUser(null);
      setStatus('anonymous');
      setErrorMessage(error instanceof Error ? error.message : 'Error al registrar usuario');
      return false;
    }
  }, []);

  const logout = React.useCallback(async () => {
    await authService.logout().catch(() => {});
    setUser(null);
    setStatus('anonymous');
  }, []);

  return { status, user, errorMessage, login, register, logout, refresh };
}
