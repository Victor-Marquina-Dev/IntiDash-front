import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CategoriaRow } from '@/shared/types/finance.types';

// ── Escalas de color por tipo ────────────────────────────────────────────
// Modo claro: empiezan en el token semántico (#DC2626 / #16A34A)
// Modo oscuro: empiezan un paso más suave (#EF4444 / #22C55E) porque los
// fondos oscuros amplifican la saturación y los tonos muy vívidos se ven duros.
const EGRESO_LIGHT  = ['#A87878', '#BC9090', '#CFAAAA', '#E0BFBF', '#EDD5D5', '#F5EAEA'] as const;
const EGRESO_DARK   = ['#A87878', '#BC9090', '#CFAAAA', '#E0BFBF', '#EDD5D5', '#F5EAEA'] as const;
const INGRESO_LIGHT = ['#6B8B6B', '#7A9A7A', '#8FA88F', '#A8C0A8', '#BBD0BB', '#CCDCCC'] as const;
const INGRESO_DARK  = ['#6B8B6B', '#7A9A7A', '#8FA88F', '#A8C0A8', '#BBD0BB', '#CCDCCC'] as const;

export type CategoryTab = 'egreso' | 'ingreso';

export interface CategoryMetricRow {
  nombre: string;
  value: number;
  color: string;
  pct: number;
  barPct: number;
}

export function useDashboardCategories(tab: CategoryTab, darkMode = false) {
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

  const egresoScale  = darkMode ? EGRESO_DARK  : EGRESO_LIGHT;
  const ingresoScale = darkMode ? INGRESO_DARK : INGRESO_LIGHT;
  const scale = tab === 'egreso' ? egresoScale : ingresoScale;
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
