import React from 'react';
import { isDateInMonth } from '@/lib/format';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';

const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface AhorroAccount {
  nombre: string;
  banco: string;
  balance: number | null;
  balanceInicial: number | null;
}

interface MonthlySeries {
  values: number[];
  labels: string[];
}

function extractLast6(values: (number | null)[]): MonthlySeries | null {
  const normalized = values.map(value => value ?? 0);
  let lastIdx = -1;

  for (let i = normalized.length - 1; i >= 0; i--) {
    if (normalized[i] > 0) {
      lastIdx = i;
      break;
    }
  }

  if (lastIdx < 0) return null;

  const endIdx = lastIdx + 1;
  const startIdx = Math.max(0, endIdx - 6);
  const series = normalized.slice(startIdx, endIdx);
  const labels = MONTH_NAMES.slice(startIdx, endIdx);

  while (series.length < 6) {
    series.unshift(0);
    labels.unshift('');
  }

  return { values: series, labels };
}

function mapAhorroAccounts(rows: CuentaBancariaRow[]): AhorroAccount[] {
  return rows
    .filter(row => typeof row.tipo === 'string' && row.tipo.toUpperCase() === 'AHORRO')
    .map(row => ({
      nombre: row.nombre,
      banco: row.banco,
      balance: row.balance ?? row.saldo ?? null,
      balanceInicial: row.balanceInicial ?? null,
    }));
}

export function useDashboardKpis() {
  const [ingTotal, setIngTotal] = React.useState<number | null>(null);
  const [gasTotal, setGasTotal] = React.useState<number | null>(null);
  const [suscTotal, setSuscTotal] = React.useState<number | null>(null);
  const [suscCount, setSuscCount] = React.useState(0);
  const [ingMonthly, setIngMonthly] = React.useState<number[]>([]);
  const [ingMonthlyLabels, setIngMonthlyLabels] = React.useState<string[]>([]);
  const [gasMonthly, setGasMonthly] = React.useState<number[]>([]);
  const [gasMonthlyLabels, setGasMonthlyLabels] = React.useState<string[]>([]);
  const [ahorroRows, setAhorroRows] = React.useState<AhorroAccount[]>([]);

  const refresh = React.useCallback(() => {
    return Promise.all([
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getDeudasSuscripciones(),
      notionPaymentsService.getMonthlyChart(),
      notionPaymentsService.getCuentasBancarias(),
    ]).then(([ingresos, gastosUnicos, gastosDeudas, deudas, chart, cuentas]) => {
      const currentMonth = new Date();
      const ingresosTotal = ingresos
        .filter(row => isDateInMonth(row.fecha, currentMonth))
        .reduce((sum, row) => sum + (row.ingreso ?? 0), 0);
      const gastosUnicosTotal = gastosUnicos
        .filter(row => isDateInMonth(row.fecha, currentMonth))
        .reduce((sum, row) => sum + (row.monto ?? 0), 0);
      const gastosDeudasTotal = gastosDeudas
        .filter(row => isDateInMonth(row.fecha, currentMonth))
        .reduce((sum, row) => sum + (row.montoGastado ?? 0), 0);
      const suscripciones = deudas.filter(row => row.tipoPago !== 'Deuda');
      const suscripcionesTotal = suscripciones.reduce((sum, row) => sum + (row.cantidad ?? 0), 0);

      setIngTotal(ingresosTotal);
      setGasTotal(gastosUnicosTotal + gastosDeudasTotal);
      setSuscTotal(suscripcionesTotal);
      setSuscCount(suscripciones.length);
      setAhorroRows(mapAhorroAccounts(cuentas));

      const income = chart?.income ? extractLast6(chart.income) : null;
      if (income) {
        setIngMonthly(income.values);
        setIngMonthlyLabels(income.labels);
      }

      const expense = chart?.expense ? extractLast6(chart.expense) : null;
      if (expense) {
        setGasMonthly(expense.values);
        setGasMonthlyLabels(expense.labels);
      }
    }).catch(() => {
      setIngTotal(0);
      setGasTotal(0);
      setSuscTotal(0);
      setSuscCount(0);
      setAhorroRows([]);
      setIngMonthly([]);
      setIngMonthlyLabels([]);
      setGasMonthly([]);
      setGasMonthlyLabels([]);
    });
  }, []);

  useDataSyncedRefresh(refresh);

  const ahorroTotal = ahorroRows.reduce((sum, row) => sum + (row.balance ?? 0), 0);
  const ahorroInitial = ahorroRows.reduce((sum, row) => sum + (row.balanceInicial ?? 0), 0);
  const ahorroDeltaNum = ahorroInitial > 0 ? ((ahorroTotal - ahorroInitial) / ahorroInitial) * 100 : 0;
  const ahorroDelta = ahorroRows.length > 0
    ? `${ahorroDeltaNum >= 0 ? '+' : ''}${ahorroDeltaNum.toFixed(0)}%`
    : '-';

  return {
    refresh,
    ingresos: {
      total: ingTotal,
      monthly: ingMonthly,
      monthlyLabels: ingMonthlyLabels,
    },
    gastos: {
      total: gasTotal,
      monthly: gasMonthly,
      monthlyLabels: gasMonthlyLabels,
    },
    ahorro: {
      total: ahorroTotal,
      delta: ahorroDelta,
      accounts: ahorroRows,
    },
    suscripciones: {
      total: suscTotal,
      count: suscCount,
    },
  };
}
