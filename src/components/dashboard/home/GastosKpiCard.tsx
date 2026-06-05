'use client';

import { KpiCard, MiniBars } from './KpiCard';
import { Icon } from '@/components/icons';

const DEFAULT_BARS = [2800, 3000, 3200, 2900, 3400, 3300];

interface GastosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  monthlyData?: number[];
  monthlyLabels?: string[];
  onDetail?: () => void;
  onCreate?: () => void;
}

export function GastosKpiCard({ darkMode, amount, monthlyData, monthlyLabels, onDetail, onCreate }: Readonly<GastosKpiCardProps>) {
  const month = new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  const bars = monthlyData?.length === 6 ? monthlyData : DEFAULT_BARS;

  return (
    <KpiCard
      darkMode={darkMode}
      theme="red"
      icon="📉"
      label="Gastos"
      badge="-2.1%"
      amount={amount}
      subtitle={`vs mes anterior - ${month}`}
      onDetail={onDetail}
      onCreate={onCreate}
      detailTitle="Ir a transacciones"
      detailIcon={Icon.list}
      createTitle="Nuevo gasto"
      footer={<MiniBars data={bars} labels={monthlyLabels} darkMode={darkMode} theme="red" invertPct />}
    />
  );
}
