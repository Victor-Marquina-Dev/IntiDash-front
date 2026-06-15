'use client';

import React from 'react';
import type { BP } from '@/lib/breakpoints';
import { useDashboardChart } from '@/shared/hooks/use-dashboard-chart';
import { AreaLineChart, EmptyLineChart, NetLineChart } from './ChartVisuals';
import { CardHeaderSection } from './CardHeaderSection';
import { Icon } from '@/components/icons';
import { DASHBOARD_CARD } from '@/lib/dashboard-spacing';
import { RADIUS } from '@/lib/radius';
import { useElementSize } from '@/lib/use-element-size';

const CARD_BG = {
  dark:  { bg: 'linear-gradient(145deg,#1A1D21,#16181C)', brd: 'rgba(255,255,255,0.08)', sh: '0 4px 24px rgba(0,0,0,.5)' },
  light: { bg: 'rgba(234,224,213,0.97)',                  brd: 'rgba(198,172,143,0.60)', sh: '0 1px 4px rgba(94,80,63,.08)' },
};

type ChartSection = 'comparativa' | 'deuda' | 'neto';

export function ChartCard({ bp, darkMode, onNavigate }: Readonly<{ accent?: string; bp: BP; darkMode?: boolean; onNavigate?: (screen: string) => void }>) {
  const [section, setSection] = React.useState<ChartSection>('comparativa');
  const [hovered, setHovered] = React.useState(false);
  const chart = useDashboardChart();
  const isDark = darkMode ?? false;
  const card = isDark ? CARD_BG.dark : CARD_BG.light;
  const span = bp === 'desktop' ? '1 / span 2' : 'span 12';
  const chartHeight = bp === 'mobile' ? 200 : 320;
  // Mide el área real del gráfico para que el SVG use ese tamaño como viewBox
  // (responsive sin deformar). Fallback a chartHeight/ancho intrínseco al inicio.
  const [chartBodyRef, chartBodySize] = useElementSize<HTMLDivElement>();
  const cw = chartBodySize.width > 0 ? chartBodySize.width : undefined;
  const ch = chartBodySize.height > 0 ? chartBodySize.height : chartHeight;
  const hasDebtData = chart.deuda.remaining.some(value => value != null && value > 0);

  const tabs = [
    { id: 'comparativa', label: 'Comparativa', badge: chart.comparativa.badge },
    { id: 'deuda', label: 'Deuda', badge: chart.deuda.badge },
    { id: 'neto', label: 'Neto', badge: chart.neto.badge },
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: span,
        borderRadius: RADIUS.dashboardCard,
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
        icon={<Icon.list size={16} strokeWidth={2.2} />}
        label="Analisis"
        tabs={tabs}
        activeTab={section}
        onTabChange={id => setSection(id as ChartSection)}
        onDetail={onNavigate ? () => onNavigate('charts') : undefined}
        detailIcon={<Icon.arrowRight size={13} strokeWidth={2} />}
        detailTitle="Ir a Análisis"
        darkMode={isDark}
      />

      <div ref={chartBodyRef} style={{ padding: bp === 'mobile' ? `0 ${DASHBOARD_CARD.padXCss} 10px` : `0 ${DASHBOARD_CARD.padXCss} 12px`, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {section === 'comparativa' && (
          chart.comparativa.hasData
            ? <AreaLineChart
                key="comparativa-line-chart"
                months={chart.comparativa.months}
                income={chart.comparativa.income}
                expense={chart.comparativa.expense}
                width={cw}
                height={ch}
                darkMode={isDark}
              />
            : <EmptyLineChart
                months={chart.comparativa.months.length > 0 ? chart.comparativa.months : ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']}
                width={cw}
                height={ch}
                darkMode={isDark}
              />
        )}
        {section === 'deuda' && (
          hasDebtData
            ? <AreaLineChart
                key="deuda-line-chart"
                months={chart.deuda.months}
                income={chart.deuda.months.map(() => null)}
                expense={chart.deuda.months.map(() => null)}
                debt={chart.deuda.remaining}
                width={cw}
                height={ch}
                darkMode={isDark}
              />
            : <EmptyLineChart
                months={chart.deuda.months.length > 0 ? chart.deuda.months : ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']}
                width={cw}
                height={ch}
                darkMode={isDark}
                legendItems={[
                  { label: 'Deudas', color: '#D9A86C' },
                ]}
              />
        )}
        {section === 'neto' && (
          chart.neto.hasData
            ? <NetLineChart
                months={chart.neto.months}
                net={chart.neto.net}
                width={cw}
                height={ch}
                darkMode={isDark}
              />
            : <EmptyLineChart
                months={chart.neto.months.length > 0 ? chart.neto.months : ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']}
                width={cw}
                height={ch}
                darkMode={isDark}
                legendItems={[
                  { label: 'Neto positivo', color: '#3C7828' },
                  { label: 'Neto negativo', color: '#B43232' },
                ]}
              />
        )}
      </div>
    </div>
  );
}
