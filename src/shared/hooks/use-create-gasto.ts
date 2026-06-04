'use client';

import React from 'react';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { GastoDeudaRow, GastoUnicoRow } from '@/shared/types/finance.types';

type CreateStatus = 'idle' | 'loading' | 'ok' | 'error';
export type CreateGastoTipo = 'unico' | 'deuda';

export function useCreateGasto() {
  const [status, setStatus] = React.useState<CreateStatus>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const reset = React.useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const createGasto = React.useCallback(async (
    tipo: CreateGastoTipo,
    body: Partial<GastoUnicoRow> | Partial<GastoDeudaRow>,
  ) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      if (tipo === 'unico') {
        await notionPaymentsService.createGastoUnico(body as Partial<GastoUnicoRow>);
      } else {
        await notionPaymentsService.createGastoDeuda(body as Partial<GastoDeudaRow>);
      }
      setStatus('ok');
      dispatchDataSynced();
      return true;
    } catch (error: unknown) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al crear el gasto');
      return false;
    }
  }, []);

  return { status, errorMessage, reset, createGasto };
}
