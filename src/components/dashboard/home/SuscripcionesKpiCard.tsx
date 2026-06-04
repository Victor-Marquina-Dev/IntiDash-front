'use client';

import { KpiCard } from './KpiCard';

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
      icon="🔔"
      label="Suscripciones"
      badge={`${count} activas`}
      amount={amount}
      subtitle="total mensual de suscripciones"
      onDetail={onDetail}
      onCreate={onCreate}
      detailTitle="Ver suscripciones"
      createTitle="Nueva suscripcion"
    />
  );
}
