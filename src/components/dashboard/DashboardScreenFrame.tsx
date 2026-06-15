'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { RADIUS } from '@/lib/radius';
import { useBreakpoint } from '@/lib/breakpoints';

interface DashboardScreenFrameProps {
  darkMode: boolean;
  children: React.ReactNode;
}

export function DashboardScreenFrame({ darkMode, children }: Readonly<DashboardScreenFrameProps>) {
  const bp = useBreakpoint();
  let sideMargin = 64;
  if (bp === 'mobile') sideMargin = 12;
  else if (bp === 'tablet') sideMargin = 24;

  return (
    <div style={{
      margin: `8px ${sideMargin}px 16px`,
      borderRadius: RADIUS.dashboardCard,
      overflow: 'hidden',
      background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.07)'}`,
      boxShadow: darkMode ? '0 2px 24px rgba(0,0,0,0.25)' : '0 2px 24px rgba(17,24,39,0.05)',
      height: 'calc(100% - 24px)',
      overflowY: 'auto',
      color: darkMode ? 'rgba(255,255,255,0.88)' : C.text,
    }}>
      {children}
    </div>
  );
}
