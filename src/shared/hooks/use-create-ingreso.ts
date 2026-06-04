'use client';

import React from 'react';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { IngresoRow } from '@/shared/types/finance.types';

type CreateStatus = 'idle' | 'loading' | 'ok' | 'error';

export function useCreateIngreso() {
  const [status, setStatus] = React.useState<CreateStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const reset = React.useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const createIngreso = React.useCallback(async (body: Partial<IngresoRow>) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      await notionPaymentsService.createIngreso(body);
      setStatus('ok');
      dispatchDataSynced();
      return true;
    } catch (error: unknown) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al crear el ingreso');
      return false;
    }
  }, []);

  return { status, errorMessage, reset, createIngreso };
}
