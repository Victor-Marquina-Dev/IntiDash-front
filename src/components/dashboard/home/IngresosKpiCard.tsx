'use client';

import { KpiCard, MiniBars } from './KpiCard';
import { Icon } from '@/components/icons';

const DEFAULT_BARS = [4900, 4600, 5000, 4800, 5100, 5200];

interface IngresosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  monthlyData?: number[];
  monthlyLabels?: string[];
  onDetail?: () => void;
  onCreate?: () => void;
}

export function IngresosKpiCard({ darkMode, amount, monthlyData, monthlyLabels, onDetail, onCreate }: Readonly<IngresosKpiCardProps>) {
  const month = new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  const bars = monthlyData?.length === 6 ? monthlyData : DEFAULT_BARS;

  return (
    <KpiCard
      darkMode={darkMode}
      theme="green"
      icon="📈"
      label="Ingresos"
      badge="+8.2%"
      amount={amount}
      subtitle={`vs mes anterior - ${month}`}
      onDetail={onDetail}
      onCreate={onCreate}
      detailTitle="Ir a transacciones"
      detailIcon={Icon.list}
      createTitle="Nuevo ingreso"
      footer={<MiniBars data={bars} labels={monthlyLabels} darkMode={darkMode} theme="green" />}
    />
  );
}
