'use client';

import React from 'react';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type {
  CategoriaRow,
  CuentaBancariaRow,
  DeudaRow,
  GastoDeudaRow,
  GastoUnicoRow,
  IngresoRow,
  PrestamoRow,
  TransferenciaRow,
} from '@/shared/types/finance.types';

export interface NotionSyncedData {
  ingresos: IngresoRow[];
  gastosUnicos: GastoUnicoRow[];
  gastosDeudas: GastoDeudaRow[];
  deudas: DeudaRow[];
  cuentasBancarias: CuentaBancariaRow[];
  transferencias: TransferenciaRow[];
  categoriasGastos: CategoriaRow[];
  categoriasIngreso: CategoriaRow[];
  prestamos: PrestamoRow[];
}

const EMPTY_SYNCED_DATA: NotionSyncedData = {
  ingresos: [],
  gastosUnicos: [],
  gastosDeudas: [],
  deudas: [],
  cuentasBancarias: [],
  transferencias: [],
  categoriasGastos: [],
  categoriasIngreso: [],
  prestamos: [],
};

export function useNotionSyncedData() {
  const [data, setData] = React.useState<NotionSyncedData>(EMPTY_SYNCED_DATA);
  const [dataLoading, setDataLoading] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setDataLoading(true);
    try {
      const synced = await notionPaymentsService.getSyncedData();
      setData({
        ingresos: synced.ingresos,
        gastosUnicos: synced.gastosU,
        gastosDeudas: synced.gastosD,
        deudas: synced.deudas,
        cuentasBancarias: synced.cuentas,
        transferencias: synced.transf.map(row => ({ ...row, notas: row.notas ?? '' })),
        categoriasGastos: synced.catGastos,
        categoriasIngreso: synced.catIngreso,
        prestamos: synced.prestamos,
      });
    } catch {
      // Keep the last successful snapshot visible.
    } finally {
      setDataLoading(false);
    }
  }, []);

  const clearData = React.useCallback(() => {
    setData(EMPTY_SYNCED_DATA);
  }, []);

  return { data, dataLoading, loadData, clearData };
}
