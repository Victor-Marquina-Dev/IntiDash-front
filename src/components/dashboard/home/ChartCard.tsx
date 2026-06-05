'use client';

import React from 'react';
import type { BP } from '@/lib/breakpoints';
import { useDashboardChart } from '@/shared/hooks/use-dashboard-chart';
import { AreaLineChart, DebtLineChart } from './ChartVisuals';
import { CardHeaderSection } from './CardHeaderSection';

const CARD_BG = {
  dark: { bg: 'linear-gradient(145deg,#1A1D21,#16181C)', brd: 'rgba(255,255,255,0.08)', sh: '0 4px 24px rgba(0,0,0,.5)' },
  light: { bg: '#FFFFFF', brd: 'rgba(17,24,39,0.08)', sh: '0 1px 2px rgba(17,24,39,.04)' },
};

type ChartSection = 'comparativa' | 'deuda';

export function ChartCard({ bp, darkMode }: Readonly<{ accent?: string; bp: BP; darkMode?: boolean }>) {
  const [section, setSection] = React.useState<ChartSection>('comparativa');
  const [hovered, setHovered] = React.useState(false);
  const chart = useDashboardChart();
  const isDark = darkMode ?? false;
  const card = isDark ? CARD_BG.dark : CARD_BG.light;
  const span = bp === 'desktop' ? '1 / span 2' : 'span 12';
  const chartHeight = bp === 'mobile' ? 200 : 320;

  const tabs = [
    { id: 'comparativa', label: 'Comparativa', badge: chart.comparativa.badge },
    { id: 'deuda', label: 'Deuda', badge: chart.deuda.badge },
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: span,
        borderRadius: 22,
        overflow: 'hidden',
        background: card.bg,
        border: `1px solid ${hovered ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : card.brd}`,
        boxShadow: hovered ? (isDark ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : card.sh,
        fontFamily: 'var(--font-ui),system-ui,sans-serif',
        height: bp === 'desktop' ? '100%' : undefined,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
      }}>
      <CardHeaderSection
        icon="📈"
        label="Analisis"
        tabs={tabs}
        activeTab={section}
        onTabChange={id => setSection(id as ChartSection)}
        darkMode={isDark}
      />

      <div style={{ padding: bp === 'mobile' ? '0 10px 10px' : '0 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {section === 'comparativa' && (
          <AreaLineChart
            months={chart.comparativa.months}
            income={chart.comparativa.income}
            expense={chart.comparativa.expense}
            height={chartHeight}
            darkMode={isDark}
          />
        )}
        {section === 'deuda' && (
          <DebtLineChart
            months={chart.deuda.months}
            remaining={chart.deuda.remaining}
            height={chartHeight}
            darkMode={isDark}
          />
        )}
      </div>
    </div>
  );
}
