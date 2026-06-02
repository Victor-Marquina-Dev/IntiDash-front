'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { ScreenId } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardHome } from './DashboardHome';
import type { Tweaks } from '@/components/tweaks';

function Stub({ label }: Readonly<{ label: string }>) {
  return (
    <div style={{ padding: '60px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 480, padding: 32, textAlign: 'center',
        background: C.card, border: `1px dashed ${C.borderHi}`, borderRadius: 16,
      }}>
        <div style={{ fontSize: 11, color: C.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>
          Pantalla en construcción
        </div>
        <div style={{ fontSize: 26, color: C.text, fontWeight: 600, marginTop: 8, letterSpacing: -0.6 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.textMute, marginTop: 10 }}>
          Aún no está implementada. Vuelve al Dashboard desde la barra de navegación.
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  tweaks: Tweaks;
  TransactionsScreen?: React.ComponentType<{ accent: string; density: string; onGoSettings?: () => void }>;
  AccountsScreen?: React.ComponentType<{ accent: string }>;
  GoalsScreen?: React.ComponentType<{ accent: string }>;
  AnalyticsScreen?: React.ComponentType<{ accent: string }>;
  DeudaScreen?: React.ComponentType<{ accent: string }>;
  NotionScreen?: React.ComponentType<{ accent: string }>;
}

export function Dashboard({ tweaks, TransactionsScreen, AccountsScreen, GoalsScreen, AnalyticsScreen, DeudaScreen, NotionScreen }: Readonly<DashboardProps>) {
  const [screen, setScreen] = React.useState<ScreenId>('home');
  const accent = tweaks.accent;

  const screens: Record<ScreenId, React.ReactNode> = {
    home:   <DashboardHome tweaks={tweaks} />,
    tx:     TransactionsScreen ? <TransactionsScreen accent={accent} density={tweaks.density} onGoSettings={() => setScreen('notion')} /> : <Stub label="Transacciones" />,
    cards:  AccountsScreen     ? <AccountsScreen accent={accent} />  : <Stub label="Cuentas" />,
    goals:  GoalsScreen        ? <GoalsScreen accent={accent} />     : <Stub label="Objetivos" />,
    charts: AnalyticsScreen    ? <AnalyticsScreen accent={accent} /> : <Stub label="Análisis" />,
    debts:  DeudaScreen        ? <DeudaScreen accent={accent} />     : <Stub label="Deudas" />,
    notion: NotionScreen       ? <NotionScreen accent={accent} />    : <Stub label="Ajustes" />,
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: -0.1,
    }}>
      <TopBar screen={screen} setActive={setScreen} />
      <main style={{ flex: 1, minWidth: 0 }}>
        {screens[screen]}
      </main>
    </div>
  );
}
