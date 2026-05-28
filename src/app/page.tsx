'use client';

import { useTweaks, TweaksPanel } from '@/components/tweaks';
import { Dashboard } from '@/components/dashboard';
import { TransactionsScreen } from '@/components/screens/TransactionsScreen';
import { AccountsScreen } from '@/components/screens/AccountsScreen';
import { GoalsScreen } from '@/components/screens/GoalsScreen';
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen';
import { NotionScreen } from '@/components/screens/NotionScreen';

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
        NotionScreen={NotionScreen}
      />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}
