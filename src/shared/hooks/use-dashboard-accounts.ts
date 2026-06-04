import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';

const TIPO_ORDER = ['CORRIENTE', 'AHORRO', 'ALIMENTOS', 'INVERSION', 'CREDITO', 'CREDITO'];
const LS_CUENTAS_TAB = 'fz-cuentas-tab';

export interface TarjetaRow extends CuentaBancariaRow {
  img?: string | null;
}

function normalizeTipo(tipo: string | null | undefined) {
  return (tipo ?? '').toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function sortTipos(a: string, b: string) {
  const ia = TIPO_ORDER.indexOf(normalizeTipo(a));
  const ib = TIPO_ORDER.indexOf(normalizeTipo(b));
  if (ia === -1 && ib === -1) return 0;
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

export function useDashboardAccounts() {
  const [rows, setRows] = React.useState<TarjetaRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem(LS_CUENTAS_TAB) : null),
  );

  const refresh = React.useCallback(() => {
    setLoading(true);
    notionPaymentsService.getCuentasBancarias()
      .then((data: TarjetaRow[]) => setRows(data))
      .finally(() => setLoading(false));
  }, []);

  useDataSyncedRefresh(refresh);

  const tipos = React.useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const row of rows) {
      const tipo = normalizeTipo(row.tipo);
      if (tipo && !seen.has(tipo)) {
        seen.add(tipo);
        result.push(tipo);
      }
    }

    return result.sort(sortTipos);
  }, [rows]);

  const effectiveTab = activeTab && tipos.includes(activeTab) ? activeTab : (tipos[0] ?? null);
  const visibles = effectiveTab ? rows.filter(row => normalizeTipo(row.tipo) === effectiveTab) : rows;
  const isCredito = effectiveTab?.includes('CREDIT') ?? false;

  const selectTab = React.useCallback((tipo: string) => {
    setActiveTab(tipo);
    localStorage.setItem(LS_CUENTAS_TAB, tipo);
  }, []);

  return {
    rows,
    loading,
    tipos,
    activeTab: effectiveTab,
    visibles,
    isCredito,
    selectTab,
  };
}
