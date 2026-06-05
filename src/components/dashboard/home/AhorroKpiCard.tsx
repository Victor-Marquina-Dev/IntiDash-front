'use client';

import { KpiCard } from './KpiCard';

interface AhorroKpiCardProps {
  darkMode: boolean;
  amount: number | null;
  delta: string;
  accounts: { nombre: string; banco: string; balance: number | null }[];
  onDetail?: () => void;
  onCreate?: () => void;
}

export function AhorroKpiCard({ darkMode, amount, delta, accounts, onDetail, onCreate }: Readonly<AhorroKpiCardProps>) {
  const subtitle = accounts.length === 0
    ? 'Sin cuentas de ahorro'
    : `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} de ahorro`;

  return (
    <KpiCard
      darkMode={darkMode}
      theme="neutral"
      icon="💰"
      label="Ahorro"
      badge={delta}
      amount={amount}
      subtitle={subtitle}
      onDetail={onDetail}
      onCreate={onCreate}
      detailTitle="Ver historial"
      createTitle="Nueva cuenta"
      centerAmount
    />
  );
}
