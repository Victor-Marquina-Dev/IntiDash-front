'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTweaks } from '@/components/tweaks';
import { Dashboard } from '@/components/dashboard';
import { AccountsScreen } from '@/components/screens/AccountsScreen';
import { GoalsScreen } from '@/components/screens/GoalsScreen';
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen';
import { NotionScreen } from '@/components/screens/NotionScreen';
import { DeudaScreen } from '@/components/screens/DeudaScreen';
import { AdminDashboard } from '@/components/screens/AdminDashboard';
import { useAuth } from '@/shared/hooks/use-auth';
import { WorkspaceProvider } from '@/shared/context/WorkspaceContext';
import { DemoBadge } from '@/components/landing/DemoBadge';
import { DEMO_EMAIL } from '@/shared/services/auth.service';

export default function AppPage() {
  const router = useRouter();
  const [tweaks] = useTweaks();
  const { status, user, logout } = useAuth();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'anonymous') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
        <div style={{ color: '#6B7280', fontSize: 14 }}>Cargando…</div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={logout} />;
  }

  const isDemo = user?.email === DEMO_EMAIL;

  return (
    <>
      {isDemo && <DemoBadge />}
      <WorkspaceProvider>
        <Dashboard
          tweaks={tweaks}
          user={user}
          onLogout={logout}
          AccountsScreen={AccountsScreen}
          GoalsScreen={GoalsScreen}
          AnalyticsScreen={AnalyticsScreen}
          DeudaScreen={DeudaScreen}
          NotionScreen={NotionScreen}
        />
      </WorkspaceProvider>
    </>
  );
}
