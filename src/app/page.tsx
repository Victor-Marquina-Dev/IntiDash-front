'use client';

import { useTweaks } from '@/components/tweaks';
import { Dashboard } from '@/components/dashboard';
import { TransactionsScreen } from '@/components/screens/TransactionsScreen';
import { AccountsScreen } from '@/components/screens/AccountsScreen';
import { GoalsScreen } from '@/components/screens/GoalsScreen';
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen';
import { NotionScreen } from '@/components/screens/NotionScreen';
import { DeudaScreen } from '@/components/screens/DeudaScreen';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { AdminDashboard } from '@/components/screens/AdminDashboard';
import { useAuth } from '@/shared/hooks/use-auth';
import { WorkspaceProvider } from '@/shared/context/WorkspaceContext';

export default function Home() {
  const [tweaks] = useTweaks();
  const { status, user, errorMessage, login, register, logout } = useAuth();

  if (status !== 'authenticated') {
    return (
      <LoginScreen
        loading={status === 'loading'}
        errorMessage={errorMessage}
        onLogin={login}
        onRegister={register}
      />
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={logout} />;
  }

  return (
    <WorkspaceProvider>
      <Dashboard
        tweaks={tweaks}
        user={user}
        onLogout={logout}
        TransactionsScreen={TransactionsScreen}
        AccountsScreen={AccountsScreen}
        GoalsScreen={GoalsScreen}
        AnalyticsScreen={AnalyticsScreen}
        DeudaScreen={DeudaScreen}
        NotionScreen={NotionScreen}
      />
    </WorkspaceProvider>
  );
}
