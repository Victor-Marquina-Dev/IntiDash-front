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
  let subtitle = `${accounts.length} cuentas de ahorro`;
  if (accounts.length === 0) subtitle = 'Sin cuentas';
  else if (accounts.length === 1) subtitle = `${accounts[0].banco} - ${accounts[0].nombre}`;

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
    />
  );
}
