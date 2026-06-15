'use client';

import React from 'react';
import type { BP } from '@/lib/breakpoints';
import { useDashboardKpis } from '@/shared/hooks/use-dashboard-kpis';
import {
  AhorroKpiCard,
  GastosKpiCard,
  IngresosKpiCard,
  NewGastoModal,
  NewIngresoModal,
  NewSuscripcionModal,
  SuscripcionesKpiCard,
  SuscripcionesModal,
} from './KpiRailParts';

export { DeudasModal, NewDeudaModal } from './KpiRailParts';

export function KpiRail({ showCharts: _showCharts, bp, darkMode, onNavigate, canWrite = true }: Readonly<{ showCharts: boolean; bp: BP; darkMode?: boolean; onNavigate?: (screen: string) => void; canWrite?: boolean }>) {
  const [showSuscModal, setShowSuscModal] = React.useState(false);
  const [showNewIngModal, setShowNewIngModal] = React.useState(false);
  const [showNewGasModal, setShowNewGasModal] = React.useState(false);
  const [showNewSuscModal, setShowNewSuscModal] = React.useState(false);

  const kpis = useDashboardKpis();
  const isDark = darkMode ?? false;
  const gridStyle: React.CSSProperties = bp === 'desktop'
    ? { gridColumn: '2 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 12 }
    : {
        gridColumn: 'span 12',
        display: 'grid',
        gridTemplateColumns: bp === 'mobile' ? '1fr' : '1fr 1fr',
        gridTemplateRows: 'auto',
        gap: 12,
        alignContent: 'start',
        alignItems: 'start',
      };

  const cards = (
    <div style={gridStyle}>
      <IngresosKpiCard
        darkMode={isDark}
        amount={kpis.ingresos.total}
        delta={kpis.ingresos.delta}
        monthlyData={kpis.ingresos.monthly}
        onCardClick={() => onNavigate?.('cards')}
        onCreate={canWrite ? () => setShowNewIngModal(true) : undefined}
      />
      <GastosKpiCard
        darkMode={isDark}
        amount={kpis.gastos.total}
        delta={kpis.gastos.delta}
        monthlyData={kpis.gastos.monthly}
        onCardClick={() => onNavigate?.('cards')}
        onCreate={canWrite ? () => setShowNewGasModal(true) : undefined}
      />
      <AhorroKpiCard
        darkMode={isDark}
        amount={kpis.ahorro.total}
        delta={kpis.ahorro.delta}
        accounts={kpis.ahorro.accounts}
        onDetail={() => {
          try { localStorage.setItem('florin:pending-group', 'AHORRO'); } catch {}
          onNavigate?.('cards');
        }}
      />
      <SuscripcionesKpiCard
        darkMode={isDark}
        amount={kpis.suscripciones.total}
        count={kpis.suscripciones.count}
        onDetail={() => setShowSuscModal(true)}
        onCreate={undefined}
      />
    </div>
  );

  const modals = (
    <>
      {showSuscModal && <SuscripcionesModal onClose={() => setShowSuscModal(false)} />}
      {canWrite && showNewIngModal && <NewIngresoModal onClose={() => setShowNewIngModal(false)} onSuccess={async () => { await kpis.refresh(); }} />}
      {canWrite && showNewGasModal && <NewGastoModal onClose={() => setShowNewGasModal(false)} onSuccess={async () => { await kpis.refresh(); }} />}
      {canWrite && showNewSuscModal && <NewSuscripcionModal onClose={() => setShowNewSuscModal(false)} onSuccess={kpis.refresh} />}
    </>
  );

  return (
    <>
      {cards}
      {modals}
    </>
  );
}
