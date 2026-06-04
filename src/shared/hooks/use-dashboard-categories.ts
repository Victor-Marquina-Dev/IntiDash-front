import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CategoriaRow } from '@/shared/types/finance.types';

// Escala por tipo: egresos en tonos de rojo, ingresos en tonos de verde
// (del más intenso = mayor monto, al más claro). Da patrón coherente con la
// regla "gastos = rojo, ingresos = verde" sin volverse un arcoíris.
const EGRESO_SCALE  = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'] as const;
const INGRESO_SCALE = ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7'] as const;

export type CategoryTab = 'egreso' | 'ingreso';

export interface CategoryMetricRow {
  nombre: string;
  value: number;
  color: string;
  pct: number;
  barPct: number;
}

export function useDashboardCategories(tab: CategoryTab) {
  const [gastos, setGastos] = React.useState<CategoriaRow[]>([]);
  const [ingresos, setIngresos] = React.useState<CategoriaRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => (
    Promise.all([
      notionPaymentsService.getCategoriasGastos(),
      notionPaymentsService.getCategoriasIngreso(),
    ]).then(([gastosRows, ingresosRows]) => {
      setGastos(gastosRows);
      setIngresos(ingresosRows);
    }).finally(() => setLoading(false))
  ), []);

  useDataSyncedRefresh(refresh);

  const baseRows = tab === 'egreso'
    ? gastos.map(row => ({ nombre: row.nombre, value: (row.gastosPorDeuda ?? 0) + (row.gastosUnicos ?? 0) }))
    : ingresos.map(row => ({ nombre: row.nombre, value: row.ingresosTotales ?? 0 }));

  const sortedRows = [...baseRows].sort((a, b) => b.value - a.value);
  const total = sortedRows.reduce((sum, row) => sum + row.value, 0);
  const maxValue = Math.max(...sortedRows.map(row => row.value), 0);

  const scale = tab === 'egreso' ? EGRESO_SCALE : INGRESO_SCALE;
  const rows = sortedRows.map((row, index) => ({
    ...row,
    color: scale[Math.min(index, scale.length - 1)],
    pct: total > 0 ? Math.round((row.value / total) * 100) : 0,
    barPct: maxValue > 0 ? Math.round((row.value / maxValue) * 100) : 0,
  }));

  return {
    loading,
    refresh,
    gastos,
    ingresos,
    rows,
  };
}
