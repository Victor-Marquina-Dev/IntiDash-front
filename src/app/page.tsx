'use client';

import { useTweaks } from '@/components/tweaks';
import { Dashboard } from '@/components/dashboard';
import { TransactionsScreen } from '@/components/screens/TransactionsScreen';
import { AccountsScreen } from '@/components/screens/AccountsScreen';
import { GoalsScreen } from '@/components/screens/GoalsScreen';
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen';
import { NotionScreen } from '@/components/screens/NotionScreen';
import { DeudaScreen } from '@/components/screens/DeudaScreen';

export default function Home() {
  const [tweaks, setTweak] = useTweaks();

  return (
    <>
      <Dashboard
        tweaks={tweaks}
        TransactionsScreen={TransactionsScreen}
        AccountsScreen={AccountsScreen}
        GoalsScreen={GoalsScreen}
        AnalyticsScreen={AnalyticsScreen}
        DeudaScreen={DeudaScreen}
        NotionScreen={NotionScreen}
      />
    </>
  );
}
