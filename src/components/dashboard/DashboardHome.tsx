'use client';

import type { CSSProperties } from 'react';
import { useDashboardScale } from './use-dashboard-scale';
import type { Tweaks } from '@/components/tweaks';
import { ChartCard } from './home/ChartCard';
import { CategoriesDonut } from './home/CategoriesDonut';
import { HeroBalance } from './home/HeroBalance';
import { KpiRail } from './home/KpiRail';
import { TarjetasCard } from './home/TarjetasCard';
import { Debts } from './home/DebtsCard';
import { useMobileParallax } from './use-mobile-parallax';

interface DashboardHomeProps {
  tweaks: Tweaks;
  onNavigate?: (screen: string) => void;
  darkMode?: boolean;
  canWrite?: boolean;
}

const MOBILE_PARALLAX_DEPTHS = [20, 34, 28, 40, 32] as const;

export function DashboardHome({ tweaks, onNavigate, darkMode, canWrite = true }: Readonly<DashboardHomeProps>) {
  const {
    breakpoint: bp,
    scale,
    viewportHeight,
    isDesktop,
    isScaled,
    availableHeight,
    logicalAvailableHeight,
    logicalWidth,
  } = useDashboardScale();
  const accent = tweaks.accent;
  const isMobile = bp === 'mobile';
  const parallaxRefs = useMobileParallax(isMobile, MOBILE_PARALLAX_DEPTHS);

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

  // Alto del home en desktop. Si está escalado, el lienzo lógico mide el alto
  // disponible ÷ factor (y luego transform: scale lo amplía a pantalla completa).
  let desktopHeight = 'auto';
  if (isDesktop) {
    if (isScaled) desktopHeight = `${logicalAvailableHeight}px`;
    else if (viewportHeight > 0) desktopHeight = `${availableHeight}px`;
    else desktopHeight = 'calc(100vh - 68px)';
  }

  const dashboardStyle: CSSProperties = {
    padding,
    display: 'grid',
    gridTemplateColumns: mainColumns,
    gridTemplateRows: isDesktop ? '100%' : undefined,
    gap,
    height: desktopHeight,
    overflow: isDesktop ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    width: isScaled ? `${logicalWidth}px` : '100%',
    ...(isScaled ? { transform: `scale(${scale})`, transformOrigin: 'top left' } : {}),
  };

  const contentGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? '4fr 2fr 3fr' : 'repeat(12, 1fr)',
    gridTemplateRows: isDesktop ? 'auto 1fr' : undefined,
    gap,
    minWidth: 0,
    ...(isDesktop ? { height: '100%', overflowY: 'hidden' } : {}),
  };

  const railStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap,
    minWidth: 0,
    ...(isDesktop ? { height: '100%' } : {}),
  };

  const mobileParallaxGridItemStyle: CSSProperties = {
    gridColumn: 'span 12',
    willChange: 'transform',
    transition: 'transform 80ms linear',
  };

  const mobileParallaxStackItemStyle: CSSProperties = {
    willChange: 'transform',
    transition: 'transform 80ms linear',
  };

  const setParallaxRef = (index: number) => (el: HTMLDivElement | null) => {
    parallaxRefs.current[index] = el;
  };

  const heroBalance = <HeroBalance bp={bp} darkMode={darkMode} onNavigate={onNavigate} />;
  const chartCard = <ChartCard accent={accent} bp={bp} darkMode={darkMode} onNavigate={onNavigate} />;
  const categoriesCard = (
    <div style={{ gridColumn: isDesktop ? '3' : 'span 12', display: 'flex', flexDirection: 'column', alignSelf: isDesktop ? 'stretch' : undefined }}>
      <CategoriesDonut darkMode={darkMode} canWrite={canWrite} />
    </div>
  );
  const accountsCard = <TarjetasCard darkMode={darkMode} canWrite={canWrite} onNavigate={onNavigate} />;
  const debtsCard = (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Debts bp={bp} darkMode={darkMode} canWrite={canWrite} />
    </div>
  );

  const content = (
    <div style={dashboardStyle}>
      <div style={contentGridStyle}>
        {isMobile ? (
          <div ref={setParallaxRef(0)} style={mobileParallaxGridItemStyle}>{heroBalance}</div>
        ) : heroBalance}
        <KpiRail showCharts={tweaks.microCharts} bp={bp} darkMode={darkMode} onNavigate={onNavigate} canWrite={canWrite} />
        {isMobile ? (
          <div ref={setParallaxRef(1)} style={mobileParallaxGridItemStyle}>{chartCard}</div>
        ) : chartCard}
        {isMobile ? (
          <div ref={setParallaxRef(2)} style={mobileParallaxGridItemStyle}>{categoriesCard}</div>
        ) : categoriesCard}
      </div>

      <div style={railStyle}>
        {isMobile ? (
          <div ref={setParallaxRef(3)} style={mobileParallaxStackItemStyle}>{accountsCard}</div>
        ) : accountsCard}
        {isMobile ? (
          <div ref={setParallaxRef(4)} style={mobileParallaxStackItemStyle}>{debtsCard}</div>
        ) : debtsCard}
      </div>
    </div>
  );

  // En monitores grandes, el lienzo lógico (content) se amplía con transform y
  // se contiene en un wrapper del tamaño físico real para que llene la pantalla.
  if (isScaled) {
    return (
      <div style={{ width: '100%', height: `${availableHeight}px`, overflow: 'hidden' }}>
        {content}
      </div>
    );
  }

  return content;
}
