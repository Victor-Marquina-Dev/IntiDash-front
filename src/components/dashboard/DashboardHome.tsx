'use client';

import type { CSSProperties } from 'react';
import { useBreakpoint } from '@/lib/breakpoints';
import type { Tweaks } from '@/components/tweaks';
import { ChartCard } from './home/ChartCard';
import { CategoriesDonut } from './home/CategoriesDonut';
import { HeroBalance } from './home/HeroBalance';
import { KpiRail } from './home/KpiRail';
import { TarjetasCard } from './home/TarjetasCard';
import { NotionSync } from './home/NotionSync';
import { Debts } from './home/DebtsCard';

interface DashboardHomeProps {
  tweaks: Tweaks;
  onNavigate?: (screen: string) => void;
  darkMode?: boolean;
  canWrite?: boolean;
}

export function DashboardHome({ tweaks, onNavigate, darkMode, canWrite = true }: Readonly<DashboardHomeProps>) {
  const bp = useBreakpoint();
  const accent = tweaks.accent;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';

  const gap = isMobile ? 10 : tweaks.density === 'compact' ? 12 : 14;
  const padX = 'clamp(24px, 3.2vw, 75px)';
  const padding = isMobile
    ? '10px 12px 14px'
    : tweaks.density === 'compact'
      ? `14px ${padX} 16px`
      : `16px ${padX} 20px`;

  let mainColumns = '1fr 320px';
  if (isDesktop) mainColumns = '3fr 1fr';
  if (isMobile) mainColumns = '1fr';

  const dashboardStyle: CSSProperties = {
    padding,
    display: 'grid',
    gridTemplateColumns: mainColumns,
    gap,
    height: isDesktop ? 'calc(100vh - 68px)' : 'auto',
    overflow: isDesktop ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    width: '100%',
  };

  const contentGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? '4fr 2fr 3fr' : 'repeat(12, 1fr)',
    gridTemplateRows: isDesktop ? 'auto 1fr' : undefined,
    gap,
    minWidth: 0,
  };

  const railStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap,
    minWidth: 0,
    ...(isDesktop ? { height: '100%' } : {}),
  };

  return (
    <div style={dashboardStyle}>
      <div style={contentGridStyle}>
        <HeroBalance bp={bp} darkMode={darkMode} onNavigate={onNavigate} />
        <KpiRail showCharts={tweaks.microCharts} bp={bp} darkMode={darkMode} onNavigate={onNavigate} canWrite={canWrite} />
        <ChartCard accent={accent} bp={bp} darkMode={darkMode} />
        <div style={{ gridColumn: isDesktop ? '3' : 'span 12', display: 'flex', flexDirection: 'column', alignSelf: isDesktop ? 'stretch' : undefined }}>
          <CategoriesDonut darkMode={darkMode} canWrite={canWrite} />
        </div>
      </div>

      <div style={railStyle}>
        <TarjetasCard darkMode={darkMode} canWrite={canWrite} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Debts bp={bp} darkMode={darkMode} canWrite={canWrite} />
        </div>
        <div style={{ flexShrink: 0 }}>
          <NotionSync darkMode={darkMode} canWrite={canWrite} />
        </div>
      </div>
    </div>
  );
}
