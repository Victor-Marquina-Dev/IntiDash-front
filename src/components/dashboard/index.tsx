'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { ScreenId } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardHome } from './DashboardHome';
import type { Tweaks } from '@/components/tweaks';
import type { AuthUser } from '@/shared/services/auth.service';
import { useWorkspaces } from '@/shared/hooks/use-workspaces';

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
  user?: AuthUser | null;
  onLogout?: () => void;
  TransactionsScreen?: React.ComponentType<{ accent: string; density: string; onGoSettings?: () => void; canWrite?: boolean }>;
  AccountsScreen?: React.ComponentType<{ accent: string; canWrite?: boolean }>;
  GoalsScreen?: React.ComponentType<{ accent: string }>;
  AnalyticsScreen?: React.ComponentType<{ accent: string }>;
  DeudaScreen?: React.ComponentType<{ accent: string; canWrite?: boolean }>;
  NotionScreen?: React.ComponentType<{ accent: string; user?: AuthUser | null; darkMode: boolean; onToggleDark: () => void; canWrite?: boolean }>;
}

const SCREEN_ORDER: ScreenId[] = ['home', 'cards', 'tx', 'charts', 'goals', 'debts', 'notion'];

export function Dashboard({ tweaks, user = null, onLogout, TransactionsScreen, AccountsScreen, GoalsScreen, AnalyticsScreen, DeudaScreen, NotionScreen }: Readonly<DashboardProps>) {
  const [screen, setScreen] = React.useState<ScreenId>('home');
  const [dir, setDir]       = React.useState<'left' | 'right'>('left');
  const [darkMode, setDarkMode] = React.useState(false);
  const { canWrite } = useWorkspaces(Boolean(user));
  const accent = tweaks.accent;

  const toggleDarkMode = React.useCallback(() => {
    setDarkMode(d => !d);
  }, []);

  function navigateTo(next: ScreenId) {
    const curr = SCREEN_ORDER.indexOf(screen);
    const dest = SCREEN_ORDER.indexOf(next);
    setDir(dest >= curr ? 'left' : 'right');
    setScreen(next);
  }

  const screens: Record<ScreenId, React.ReactNode> = {
    home:   <DashboardHome tweaks={tweaks} onNavigate={(s) => setScreen(s as ScreenId)} darkMode={darkMode} canWrite={canWrite} />,
    tx:     TransactionsScreen ? <TransactionsScreen accent={accent} density={tweaks.density} onGoSettings={() => setScreen('notion')} canWrite={canWrite} /> : <Stub label="Transacciones" />,
    cards:  AccountsScreen     ? <AccountsScreen accent={accent} canWrite={canWrite} />  : <Stub label="Cuentas" />,
    goals:  GoalsScreen        ? <GoalsScreen accent={accent} />     : <Stub label="Objetivos" />,
    charts: AnalyticsScreen    ? <AnalyticsScreen accent={accent} /> : <Stub label="Análisis" />,
    debts:  DeudaScreen        ? <DeudaScreen accent={accent} canWrite={canWrite} />     : <Stub label="Deudas" />,
    notion: NotionScreen       ? <NotionScreen accent={accent} user={user} darkMode={darkMode} onToggleDark={toggleDarkMode} canWrite={canWrite} /> : <Stub label="Ajustes" />,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#12141A' : C.bg,
      color: darkMode ? 'rgba(255,255,255,0.88)' : C.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-ui), system-ui, sans-serif', letterSpacing: -0.1,
      transition: 'background 0.25s ease',
    }}>
      <TopBar screen={screen} setActive={navigateTo} darkMode={darkMode} onToggleDark={toggleDarkMode} user={user} onLogout={onLogout} canWrite={canWrite} />
      <main style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div key={screen} className={dir === 'left' ? 'fz-screen-left' : 'fz-screen-right'} style={{ flex: 1, minHeight: 0 }}>
          {screen === 'home' ? screens[screen] : (
            <div style={{
              margin: '8px 64px 16px',
              borderRadius: 32,
              overflow: 'hidden',
              background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)'}`,
              boxShadow: darkMode ? '0 2px 24px rgba(0,0,0,0.25)' : '0 2px 24px rgba(17,24,39,0.05)',
              height: 'calc(100% - 24px)',
              overflowY: 'auto',
            }}>
              {screens[screen]}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
