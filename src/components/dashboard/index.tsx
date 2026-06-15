'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { DashboardHome } from './DashboardHome';
import { DashboardScreenFrame } from './DashboardScreenFrame';
import { DashboardStub } from './DashboardStub';
import { TopBar } from './TopBar';
import type { Tweaks } from '@/components/tweaks';
import type { AuthUser } from '@/shared/services/auth.service';
import { useWorkspaces } from '@/shared/hooks/use-workspaces';
import type { ScreenId } from './navigation';
import type { SettingsSection } from '@/components/screens/NotionScreen';
import { useDashboardNavigation } from './use-dashboard-navigation';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { useDashboardScale } from './use-dashboard-scale';

interface DashboardProps {
  tweaks: Tweaks;
  user?: AuthUser | null;
  onLogout?: () => void;
  AccountsScreen?: React.ComponentType<{ accent: string; canWrite?: boolean; darkMode?: boolean }>;
  GoalsScreen?: React.ComponentType<{ accent: string; darkMode?: boolean }>;
  AnalyticsScreen?: React.ComponentType<{ accent: string; darkMode?: boolean }>;
  DeudaScreen?: React.ComponentType<{ accent: string; canWrite?: boolean; darkMode?: boolean }>;
  NotionScreen?: React.ComponentType<{ accent: string; user?: AuthUser | null; darkMode: boolean; onToggleDark: () => void; canWrite?: boolean; initialSection?: SettingsSection }>;
}

export function Dashboard({
  tweaks,
  user = null,
  onLogout,
  AccountsScreen,
  GoalsScreen,
  AnalyticsScreen,
  DeudaScreen,
  NotionScreen,
}: Readonly<DashboardProps>) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notionSection, setNotionSection] = React.useState<SettingsSection>('profile');
  const { canWrite, wsVersion } = useWorkspaces(Boolean(user));
  const { screen, dir, navigateTo } = useDashboardNavigation();
  const accent = tweaks.accent;
  const { scale, isScaled, physicalHeaderHeight, logicalWidth } = useDashboardScale();

  const navigateToNotionSync = React.useCallback(() => {
    setNotionSection('notionSync');
    navigateTo('notion');
  }, [navigateTo]);

  // Onboarding de bienvenida: se muestra una sola vez tras el registro (?onboarding=1)
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const onboardingKey = `intidash_onboarding_done_${user?.email ?? ''}`;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('onboarding') === '1' && !localStorage.getItem(onboardingKey)) {
      queueMicrotask(() => setShowOnboarding(true));
    }
  }, [onboardingKey]);

  const closeOnboarding = React.useCallback(() => {
    localStorage.setItem(onboardingKey, '1');
    window.history.replaceState(null, '', window.location.pathname);
    setShowOnboarding(false);
  }, [onboardingKey]);

  const onboardingToNotion = React.useCallback(() => {
    closeOnboarding();
    navigateToNotionSync();
  }, [closeOnboarding, navigateToNotionSync]);

  const animatingRef = React.useRef(false);

  const toggleDarkMode = React.useCallback((origin?: { x: number; y: number }) => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const nextDark = !darkMode;
    const done = () => { animatingRef.current = false; };

    type VT = { ready: Promise<void>; finished: Promise<void> };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };

    if (!doc.startViewTransition || !origin) {
      setDarkMode(nextDark);
      done();
      return;
    }

    const { x, y } = origin;
    const vt = doc.startViewTransition(() => { setDarkMode(nextDark); });

    vt.ready.then(() => {
      // Solo el círculo se expande — el tema anterior no se modifica
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(200vmax at ${x}px ${y}px)`] },
        { duration: 1600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});

    vt.finished.then(done).catch(done);
  }, [darkMode]);

  const screens: Record<ScreenId, React.ReactNode> = {
    home: (
      <DashboardHome
        tweaks={tweaks}
        onNavigate={(next) => navigateTo(next as ScreenId)}
        darkMode={darkMode}
        canWrite={canWrite}
      />
    ),
    cards: AccountsScreen
      ? <AccountsScreen accent={accent} canWrite={canWrite} darkMode={darkMode} />
      : <DashboardStub label="Cuentas" />,
    goals: GoalsScreen
      ? <GoalsScreen accent={accent} darkMode={darkMode} />
      : <DashboardStub label="Objetivos" />,
    charts: AnalyticsScreen
      ? <AnalyticsScreen accent={accent} darkMode={darkMode} />
      : <DashboardStub label="Análisis" />,
    debts: DeudaScreen
      ? <DeudaScreen accent={accent} canWrite={canWrite} darkMode={darkMode} />
      : <DashboardStub label="Deudas" />,
    notion: NotionScreen
      ? <NotionScreen accent={accent} user={user} darkMode={darkMode} onToggleDark={toggleDarkMode} canWrite={canWrite} initialSection={notionSection} />
      : <DashboardStub label="Ajustes" />,
  };

  const topBar = (
    <TopBar
      screen={screen}
      setActive={navigateTo}
      onNavigateToNotionSync={navigateToNotionSync}
      darkMode={darkMode}
      onToggleDark={toggleDarkMode}
      user={user}
      onLogout={onLogout}
      canWrite={canWrite}
    />
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#12141A' : C.bg,
      color: darkMode ? 'rgba(255,255,255,0.88)' : C.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-ui), system-ui, sans-serif', letterSpacing: -0.1,
      transition: 'background 0.25s ease',
    }}>
      {isScaled ? (
        <div style={{ height: physicalHeaderHeight, flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ width: logicalWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {topBar}
          </div>
        </div>
      ) : topBar}
      <main style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div key={`${screen}-${wsVersion}`} className={dir === 'left' ? 'fz-screen-left' : 'fz-screen-right'} style={{ flex: 1, minHeight: 0 }}>
          {screen === 'home' ? screens[screen] : (
            <DashboardScreenFrame darkMode={darkMode}>
              {screens[screen]}
            </DashboardScreenFrame>
          )}
        </div>
      </main>

      {showOnboarding && (
        <OnboardingFlow
          userName={user?.name}
          onFinish={closeOnboarding}
          onGoToNotion={onboardingToNotion}
        />
      )}
    </div>
  );
}
