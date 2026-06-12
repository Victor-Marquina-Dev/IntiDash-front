'use client';

import React from 'react';
import { DASHBOARD_SCREEN_ORDER, isDashboardScreen, type ScreenId } from './navigation';

export function useDashboardNavigation(initialScreen: ScreenId = 'home') {
  const [screen, setScreen] = React.useState<ScreenId>(initialScreen);
  const [dir, setDir] = React.useState<'left' | 'right'>('left');

  const navigateTo = React.useCallback((next: ScreenId) => {
    setScreen(current => {
      const curr = DASHBOARD_SCREEN_ORDER.indexOf(current);
      const dest = DASHBOARD_SCREEN_ORDER.indexOf(next);
      setDir(dest >= curr ? 'left' : 'right');
      return next;
    });
  }, []);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const nextScreen = (event as CustomEvent<{ screen: string }>).detail?.screen;
      if (nextScreen && isDashboardScreen(nextScreen)) navigateTo(nextScreen);
    };

    window.addEventListener('florin:navigate', handler);
    return () => window.removeEventListener('florin:navigate', handler);
  }, [navigateTo]);

  return { screen, dir, navigateTo };
}
