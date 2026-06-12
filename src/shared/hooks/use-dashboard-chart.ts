import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

const CHART_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function getLengthUntilNull(values: (number | null)[]) {
  const nullIdx = values.findIndex(value => value == null);
  return nullIdx < 0 ? values.length : nullIdx;
}

export function useDashboardChart() {
  const [chartData, setChartData] = React.useState<{
    income: (number | null)[];
    expense: (number | null)[];
  } | null>(null);
  const [debtData, setDebtData] = React.useState<{
    remaining: (number | null)[];
  } | null>(null);

  const refresh = React.useCallback(() => {
    Promise.all([
      notionPaymentsService.getMonthlyChart(),
      notionPaymentsService.getMonthlyDebt(),
    ]).then(([chart, debt]) => {
      setChartData(chart ? { income: chart.income, expense: chart.expense } : null);
      setDebtData(debt ? { remaining: debt.remaining } : null);
    }).catch(() => {
      setChartData(null);
      setDebtData(null);
    });
  }, []);

  useDataSyncedRefresh(refresh);

  const rawIncome = chartData?.income ?? [];
  const rawExpense = chartData?.expense ?? [];
  const dataLen = chartData ? getLengthUntilNull(rawIncome) : 0;

  const incomeSlice  = rawIncome.slice(0, dataLen) as number[];
  const expenseSlice = rawExpense.slice(0, dataLen) as number[];
  const hasRealData  = incomeSlice.some(v => v > 0) || expenseSlice.some(v => v > 0);

  const debtRemaining = debtData?.remaining ?? [];
  const debtDataLen = debtData ? getLengthUntilNull(debtRemaining) : 0;
  const hasDebtData = debtRemaining.slice(0, debtDataLen).some(v => v != null && (v as number) > 0);

  return {
    months: CHART_MONTHS,
    comparativa: {
      months: CHART_MONTHS.slice(0, dataLen),
      income: incomeSlice,
      expense: expenseSlice,
      badge: hasRealData ? `${dataLen}m` : '-',
      hasData: hasRealData,
    },
    deuda: {
      months: CHART_MONTHS.slice(0, debtDataLen),
      remaining: debtRemaining.slice(0, debtDataLen),
      badge: hasDebtData ? `${debtDataLen}m` : '-',
    },
  };
}
