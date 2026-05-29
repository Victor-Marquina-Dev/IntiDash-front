'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Sidebar, ScreenId } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardHome } from './DashboardHome';
import { useBreakpoint } from '@/lib/breakpoints';
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
          Aún no está implementada. Vuelve al Dashboard desde la barra lateral.
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
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    if (globalThis.window === undefined) return true;
    try { return localStorage.getItem('fz.sidebar') !== 'closed'; } catch { return true; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('fz.sidebar', sidebarOpen ? 'open' : 'closed'); } catch {}
  }, [sidebarOpen]);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileDrawerOpen = isMobile && mobileOpen;

  const [screen, setScreen] = React.useState<ScreenId>('home');
  const accent = tweaks.accent;

  const handleSetScreen = (id: ScreenId) => {
    setScreen(id);
    if (isMobile) setMobileOpen(false);
  };

  const handleToggle = () => {
    if (isMobile) setMobileOpen(o => !o);
    else setSidebarOpen(o => !o);
  };

  const screens: Record<ScreenId, React.ReactNode> = {
    home:   <DashboardHome tweaks={tweaks} />,
    tx:     TransactionsScreen ? <TransactionsScreen accent={accent} density={tweaks.density} onGoSettings={() => handleSetScreen('notion')} /> : <Stub label="Transacciones" />,
    cards:  AccountsScreen     ? <AccountsScreen accent={accent} />    : <Stub label="Cuentas" />,
    goals:  GoalsScreen        ? <GoalsScreen accent={accent} />       : <Stub label="Objetivos" />,
    charts: AnalyticsScreen    ? <AnalyticsScreen accent={accent} />   : <Stub label="Análisis" />,
    debts:  DeudaScreen ? <DeudaScreen accent={accent} /> : <Stub label="Deudas" />,
    notion: NotionScreen       ? <NotionScreen accent={accent} />      : <Stub label="Ajustes" />,
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      display: 'flex', fontFamily: 'Inter, system-ui, sans-serif',
      letterSpacing: -0.1,
    }}>
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }}
        />
      )}
      <Sidebar
        active={screen} setActive={handleSetScreen}
        expanded={sidebarOpen} setExpanded={setSidebarOpen}
        mobile={isMobile} mobileOpen={mobileDrawerOpen}
      />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar screen={screen} onToggleSidebar={handleToggle} />
        {screens[screen]}
      </main>
    </div>
  );
}
