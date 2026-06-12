'use client';

import { KpiCard, MiniBars } from './KpiCard';
import { Icon } from '@/components/icons';

interface IngresosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  monthlyData?: number[];
  monthlyLabels?: string[];
  onCardClick?: () => void;
  onCreate?: () => void;
}

export function IngresosKpiCard({ darkMode, amount, monthlyData, monthlyLabels, onCardClick, onCreate }: Readonly<IngresosKpiCardProps>) {
  const month = new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  const bars = monthlyData?.length ? monthlyData : [];

  return (
    <KpiCard
      darkMode={darkMode}
      theme="green"
      icon={<Icon.trendUp size={16} strokeWidth={2.2} />}
      label="Ingresos"
      amount={amount}
      subtitle={`vs mes anterior - ${month}`}
      onCardClick={onCardClick}
      onCreate={onCreate}
      createTitle="Nuevo ingreso"
      footer={bars.length > 0 ? <MiniBars data={bars} labels={monthlyLabels} darkMode={darkMode} theme="green" /> : undefined}
    />
  );
}
