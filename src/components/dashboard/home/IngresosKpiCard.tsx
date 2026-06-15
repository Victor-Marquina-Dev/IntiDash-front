'use client';

import { TrendKpiCard } from './TrendKpiCard';

interface IngresosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  delta?: string;
  monthlyData?: number[];
  onCardClick?: () => void;
  onCreate?: () => void;
  compact?: boolean;
}

export function IngresosKpiCard(props: Readonly<IngresosKpiCardProps>) {
  return (
    <TrendKpiCard
      {...props}
      label="Ingresos"
      buttonKind="plus"
      badgePriority="positive"
    />
  );
}
