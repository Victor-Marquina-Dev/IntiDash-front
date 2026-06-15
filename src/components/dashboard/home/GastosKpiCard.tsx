'use client';

import { TrendKpiCard } from './TrendKpiCard';

interface GastosKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  delta?: string;
  monthlyData?: number[];
  onCardClick?: () => void;
  onCreate?: () => void;
  compact?: boolean;
}

export function GastosKpiCard(props: Readonly<GastosKpiCardProps>) {
  return (
    <TrendKpiCard
      {...props}
      label="Gastos"
      buttonKind="minus"
      badgePriority="negative"
    />
  );
}
