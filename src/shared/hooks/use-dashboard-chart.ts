import React from 'react';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

const CHART_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const FALLBACK_INCOME: (number | null)[] = [3800, 4200, 4500, 4100, 4700, 4900, 4600, 5000, 4800, 5100, 5200, null];
const FALLBACK_EXPENSE: (number | null)[] = [2800, 3000, 3200, 2900, 3400, 3300, 3100, 3500, 3200, 3250, 3180, null];

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

  const rawIncome = chartData?.income ?? FALLBACK_INCOME;
  const rawExpense = chartData?.expense ?? FALLBACK_EXPENSE;
  const dataLen = getLengthUntilNull(rawIncome);

  const debtRemaining = debtData?.remaining ?? (new Array(12).fill(null) as (number | null)[]);
  const debtDataLen = getLengthUntilNull(debtRemaining);

  return {
    months: CHART_MONTHS,
    comparativa: {
      months: CHART_MONTHS.slice(0, dataLen),
      income: rawIncome.slice(0, dataLen) as number[],
      expense: rawExpense.slice(0, dataLen) as number[],
      badge: `${dataLen}m`,
    },
    deuda: {
      months: CHART_MONTHS.slice(0, debtDataLen),
      remaining: debtRemaining.slice(0, debtDataLen),
      badge: debtData ? `${debtDataLen}m` : '-',
    },
  };
}
