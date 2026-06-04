'use client';

import React from 'react';
import type { BP } from '@/lib/breakpoints';
import { useDashboardKpis } from '@/shared/hooks/use-dashboard-kpis';
import {
  AhorroKpiCard,
  GastosKpiCard,
  GastosModal,
  IngresosKpiCard,
  IngresosModal,
  NewGastoModal,
  NewIngresoModal,
  NewSuscripcionModal,
  SuscripcionesKpiCard,
  SuscripcionesModal,
} from './KpiRailParts';

export { DeudasModal, NewDeudaModal } from './KpiRailParts';

export function KpiRail({ showCharts: _showCharts, bp, darkMode }: Readonly<{ showCharts: boolean; bp: BP; darkMode?: boolean }>) {
  const [showIngModal, setShowIngModal] = React.useState(false);
  const [showGasModal, setShowGasModal] = React.useState(false);
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
        monthlyData={kpis.ingresos.monthly}
        monthlyLabels={kpis.ingresos.monthlyLabels}
        onDetail={() => setShowIngModal(true)}
        onCreate={() => setShowNewIngModal(true)}
      />
      <GastosKpiCard
        darkMode={isDark}
        amount={kpis.gastos.total}
        monthlyData={kpis.gastos.monthly}
        monthlyLabels={kpis.gastos.monthlyLabels}
        onDetail={() => setShowGasModal(true)}
        onCreate={() => setShowNewGasModal(true)}
      />
      <AhorroKpiCard
        darkMode={isDark}
        amount={kpis.ahorro.total}
        delta={kpis.ahorro.delta}
        accounts={kpis.ahorro.accounts}
      />
      <SuscripcionesKpiCard
        darkMode={isDark}
        amount={kpis.suscripciones.total}
        count={kpis.suscripciones.count}
        onDetail={() => setShowSuscModal(true)}
        onCreate={() => setShowNewSuscModal(true)}
      />
    </div>
  );

  const modals = (
    <>
      {showIngModal && <IngresosModal onClose={() => setShowIngModal(false)} />}
      {showGasModal && <GastosModal onClose={() => setShowGasModal(false)} />}
      {showSuscModal && <SuscripcionesModal onClose={() => setShowSuscModal(false)} />}
      {showNewIngModal && <NewIngresoModal onClose={() => setShowNewIngModal(false)} onSuccess={kpis.refresh} />}
      {showNewGasModal && <NewGastoModal onClose={() => setShowNewGasModal(false)} onSuccess={kpis.refresh} />}
      {showNewSuscModal && <NewSuscripcionModal onClose={() => setShowNewSuscModal(false)} onSuccess={kpis.refresh} />}
    </>
  );

  return (
    <>
      {cards}
      {modals}
    </>
  );
}
