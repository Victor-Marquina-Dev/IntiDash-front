import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DeudaRow, PrestamoRow } from '@/shared/types/finance.types';

export type DebtTab = 'debts' | 'subs' | 'prestamos';
export type DebtFilter = 'cuotas' | 'un_pago';
export type DeudaWidgetRow = DeudaRow;
export type PrestamoWidgetRow = PrestamoRow;

export function widgetIsSusc(row: DeudaWidgetRow): boolean {
  const tipoPago = (row.tipoPago ?? '').toLowerCase();
  if (tipoPago.includes('suscri')) return true;
  if (
    tipoPago.includes('deuda') ||
    tipoPago.includes('cuota') ||
    tipoPago.includes('credit') ||
    tipoPago.includes('prestamo')
  ) return false;

  return !row.hayCuotas || row.hayCuotas === 0;
}

export function widgetPct(row: DeudaWidgetRow): number {
  if (row.montoPagado != null && row.cantidad != null && row.cantidad > 0) {
    return Math.min(100, Math.round((row.montoPagado / row.cantidad) * 100));
  }

  if (row.hayCuotas != null && row.hayCuotas > 0 && row.cuotasPendientes != null) {
    return Math.round(Math.max(0, ((row.hayCuotas - row.cuotasPendientes) / row.hayCuotas) * 100));
  }

  return 0;
}

export function useDashboardDebts(debtFilter: DebtFilter) {
  const [rows, setRows] = React.useState<DeudaWidgetRow[]>([]);
  const [prestamosRows, setPrestamosRows] = React.useState<PrestamoWidgetRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDeudas = React.useCallback(() => (
    notionPaymentsService.getDeudasSuscripciones().then(data => setRows(data))
  ), []);

  const fetchPrestamos = React.useCallback(() => (
    notionPaymentsService.getPrestamos().then(data => setPrestamosRows(data))
  ), []);

  const refresh = React.useCallback(() => {
    return Promise.all([fetchDeudas(), fetchPrestamos()])
      .finally(() => setLoading(false));
  }, [fetchDeudas, fetchPrestamos]);

  useDataSyncedRefresh(refresh);

  const debts = rows.filter(row => !widgetIsSusc(row));
  const subs = rows.filter(widgetIsSusc);
  const debtsCuotas = debts.filter(row => (row.ciclo ?? '').toLowerCase() !== 'un pago');
  const debtsUnPago = debts.filter(row => (row.ciclo ?? '').toLowerCase() === 'un pago');
  const visibleDebts = debtFilter === 'cuotas' ? debtsCuotas : debtsUnPago;

  const totalDebt = debts.reduce((sum, row) => sum + (row.cantidad ?? 0), 0);
  const paidAvg = debts.length > 0
    ? Math.round(debts.reduce((sum, row) => sum + widgetPct(row), 0) / debts.length)
    : 0;

  const totalPrestado = prestamosRows.reduce((sum, row) => sum + (row.montoPrestamo ?? 0), 0);
  const totalFaltante = prestamosRows.reduce(
    (sum, row) => sum + (row.cantidadFaltante ?? ((row.montoPrestamo ?? 0) - (row.montoPagado ?? 0))),
    0,
  );
  const presPct = totalPrestado > 0
    ? Math.round(((totalPrestado - totalFaltante) / totalPrestado) * 100)
    : 0;

  const totalSubs = subs.reduce((sum, row) => {
    if (!row.cantidad) return sum;
    return sum + ((row.ciclo ?? '').toLowerCase() === 'anual' ? row.cantidad / 12 : row.cantidad);
  }, 0);

  return {
    rows,
    loading,
    fetchDeudas,
    fetchPrestamos,
    prestamosRows,
    debts,
    subs,
    debtsCuotas,
    debtsUnPago,
    visibleDebts,
    totals: {
      debt: totalDebt,
      paidAvg,
      prestado: totalPrestado,
      faltante: totalFaltante,
      presPct,
      subs: totalSubs,
    },
  };
}
