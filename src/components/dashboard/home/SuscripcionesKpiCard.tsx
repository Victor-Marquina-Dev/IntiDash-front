'use client';

import { KpiCard } from './KpiCard';
import { Icon } from '@/components/icons';

interface SuscripcionesKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  count: number;
  onDetail?: () => void;
  onCreate?: () => void;
}

export function SuscripcionesKpiCard({ darkMode, amount, count, onDetail, onCreate }: Readonly<SuscripcionesKpiCardProps>) {
  return (
    <KpiCard
      darkMode={darkMode}
      theme="neutral"
      icon={<Icon.bell size={16} strokeWidth={2.2} />}
      label="Suscripciones"
      badge={`${count} activas`}
      amount={amount}
      subtitle="total mensual de suscripciones"
      onCardClick={onDetail}
      onCreate={onCreate}
      createTitle="Nueva suscripcion"
      centerAmount
    />
  );
}
