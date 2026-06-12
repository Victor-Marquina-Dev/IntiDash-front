'use client';

import { KpiCard, MiniBars } from './KpiCard';
import { Icon } from '@/components/icons';

interface GastosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  monthlyData?: number[];
  monthlyLabels?: string[];
  onCardClick?: () => void;
  onCreate?: () => void;
  createSign?: 'plus' | 'minus';
}

export function GastosKpiCard({ darkMode, amount, monthlyData, monthlyLabels, onCardClick, onCreate, createSign = 'minus' }: Readonly<GastosKpiCardProps>) {
  const month = new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  const bars = monthlyData?.length ? monthlyData : [];

  return (
    <KpiCard
      darkMode={darkMode}
      theme="red"
      icon={<Icon.trendDown size={16} strokeWidth={2.2} />}
      label="Gastos"
      amount={amount}
      subtitle={`vs mes anterior - ${month}`}
      onCardClick={onCardClick}
      onCreate={onCreate}
      createTitle="Nuevo gasto"
      createSign={createSign}
      footer={bars.length > 0 ? <MiniBars data={bars} labels={monthlyLabels} darkMode={darkMode} theme="red" invertPct /> : undefined}
    />
  );
}
