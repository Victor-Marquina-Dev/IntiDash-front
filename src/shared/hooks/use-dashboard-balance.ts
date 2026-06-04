import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const FALLBACK_BARS = [14, 22, 30, 40, 52, 64];
const FALLBACK_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun'];

interface DashboardBalanceSummary {
  totalBalance: number;
  activeAccounts: number;
  monthlyChange: number;
  monthlyPct: number;
  lastSync: string | null;
}

interface ChartBar {
  val: number;
  label: string;
}

function mapChartBars(values: (number | null)[] | undefined): ChartBar[] {
  if (!values || !Array.isArray(values)) return [];

  const normalized = values.map(value => value ?? 0);
  let lastIdx = -1;

  for (let i = normalized.length - 1; i >= 0; i--) {
    if (normalized[i] > 0) {
      lastIdx = i;
      break;
    }
  }

  if (lastIdx < 0) return [];

  const endIdx = lastIdx + 1;
  const startIdx = Math.max(0, endIdx - 6);
  const series = normalized.slice(startIdx, endIdx);
  const labels = MONTH_NAMES.slice(startIdx, endIdx);

  while (series.length < 6) {
    series.unshift(0);
    labels.unshift('');
  }

  return series.map((value, index) => ({ val: value, label: labels[index] }));
}

function buildBarStats(chartBars: ChartBar[]) {
  const values = chartBars.length === 6 ? chartBars.map(bar => bar.val) : FALLBACK_BARS;
  const labels = chartBars.length === 6 ? chartBars.map(bar => bar.label) : FALLBACK_LABELS;
  const nonZero = values.filter(value => value > 0);
  const min = nonZero.length > 0 ? Math.min(...nonZero) : 1;
  const range = (nonZero.length > 0 ? Math.max(...nonZero) - min : 0) || 1;
  const heights = values.map(value => value > 0 ? 25 + ((value - min) / range) * 65 : 5);
  const pct = values.map((value, index) => {
    if (index === 0 || value === 0) return null;
    const previous = values[index - 1];
    if (!previous || previous === 0 || !Number.isFinite(previous)) return null;
    const percent = Math.round(((value - previous) / previous) * 100);
    return Number.isFinite(percent) ? percent : null;
  });

  return { values, labels, heights, pct };
}

export function fmtSync(iso: string | null): string {
  if (!iso) return 'Sin sincronizar';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} dia${days !== 1 ? 's' : ''}`;
}

export function fmtBalanceInt(value: number): string {
  return Math.floor(Math.abs(value)).toLocaleString('es-PE');
}

export function fmtBalanceDec(value: number): string {
  return (Math.abs(value) % 1).toFixed(2).slice(1);
}

export function useDashboardBalance() {
  const [summary, setSummary] = React.useState<DashboardBalanceSummary | null>(null);
  const [ingTotal, setIngTotal] = React.useState<number | null>(null);
  const [gasTotal, setGasTotal] = React.useState<number | null>(null);
  const [prestamosTotal, setPrestamosTotal] = React.useState<number | null>(null);
  const [chartBars, setChartBars] = React.useState<ChartBar[]>([]);

  const refresh = React.useCallback(() => {
    Promise.all([
      notionPaymentsService.getBalanceSummary(),
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getPrestamos(),
      notionPaymentsService.getMonthlyChart(),
    ]).then(([balanceSummary, ingresos, gastosUnicos, gastosDeudas, prestamos, chart]) => {
      if (balanceSummary) setSummary(balanceSummary as unknown as DashboardBalanceSummary);
      setIngTotal(ingresos.reduce((sum, row) => sum + (row.ingreso ?? 0), 0));
      setGasTotal(
        gastosUnicos.reduce((sum, row) => sum + (row.monto ?? 0), 0) +
        gastosDeudas.reduce((sum, row) => sum + (row.montoGastado ?? 0), 0),
      );
      setPrestamosTotal(prestamos.reduce((sum, row) => (
        sum + (row.cantidadFaltante ?? Math.max(0, (row.montoPrestamo ?? 0) - (row.montoPagado ?? 0)))
      ), 0));
      setChartBars(mapChartBars((chart as Record<string, unknown> | null)?.balance as (number | null)[] | undefined ?? chart?.income));
    }).catch(() => {});
  }, []);

  useDataSyncedRefresh(refresh);

  const total = summary?.totalBalance ?? 0;
  const change = summary?.monthlyChange ?? 0;
  const pct = summary?.monthlyPct ?? 0;
  const pctAbs = Math.abs(pct).toFixed(1);
  const isPositiveChange = change >= 0;
  const flujoNeto = ingTotal !== null && gasTotal !== null ? ingTotal - gasTotal : null;
  const flujoPos = flujoNeto === null || flujoNeto >= 0;
  const patrimonio = summary !== null && prestamosTotal !== null ? summary.totalBalance - prestamosTotal : null;

  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];
  const syncStr = summary?.lastSync ? fmtSync(summary.lastSync) : null;
  const subLabel = syncStr ? `${monthName}. ${now.getFullYear()} - actualizado ${syncStr}` : `${monthName}. ${now.getFullYear()}`;

  return {
    summary,
    total,
    pctAbs,
    isPositiveChange,
    flujoNeto,
    flujoPos,
    patrimonio,
    subLabel,
    bars: buildBarStats(chartBars),
  };
}
