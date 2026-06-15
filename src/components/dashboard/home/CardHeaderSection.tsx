'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { DASHBOARD_CARD } from '@/lib/dashboard-spacing';
import { RADIUS } from '@/lib/radius';

const TITLE_ROW_HEIGHT = 34;
const TABS_ROW_HEIGHT  = 34;
const ROW_PAD_X = `0 ${DASHBOARD_CARD.padXCss}`;
const ACTION_OUTER = 34;
const ACTION_INNER = 24;
const TAB_HEIGHT = 26;
const TAB_GAP = 6;

const DARK = {
  labelC: 'rgba(255,255,255,0.38)',
  tActiveBg: '#6B4F33',
  tActiveC: '#fff',
  tActiveSh: 'none',
  tInBg: 'transparent',
  tInC: 'rgba(255,255,255,0.35)',
  tInBrd: 'transparent',
  btnBg: 'rgba(255,255,255,0.06)',
  btnBrd: 'rgba(255,255,255,0.12)',
  btnC: 'rgba(255,255,255,0.65)',
  btnHovBg: 'rgba(255,255,255,0.14)',
  btnHovC: '#fff',
};

const LIGHT = {
  labelC: '#5E503F',
  tActiveBg: '#7D5A38',
  tActiveC: '#fff',
  tActiveSh: 'none',
  tInBg: 'transparent',
  tInC: 'rgba(60,32,8,0.38)',
  tInBrd: 'transparent',
  btnBg: 'rgba(94,80,63,0.08)',
  btnBrd: 'rgba(94,80,63,0.20)',
  btnC: '#5E503F',
  btnHovBg: '#7D5A38',
  btnHovC: '#fff',
};

export interface CardTab {
  id: string;
  label: string;
  badge?: string | number;
}

interface CardHeaderSectionProps {
  icon: React.ReactNode;
  label: string;
  tabs: CardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  subTabs?: CardTab[];
  activeSubTab?: string;
  onSubTabChange?: (id: string) => void;
  onDetail?: () => void;
  onCreate?: () => void;
  onChart?: () => void;
  detailIcon?: React.ReactNode;
  chartIcon?: React.ReactNode;
  detailTitle?: string;
  createTitle?: string;
  chartTitle?: string;
  chartActive?: boolean;
  darkMode?: boolean;
}

// Fila de tabs principales reutilizable — garantiza tabs idénticos en todas las cards
export function CardTabsRow({
  tabs,
  activeTab,
  onTabChange,
  darkMode = false,
  padX = ROW_PAD_X,
  style,
}: Readonly<{
  tabs: CardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  darkMode?: boolean;
  padX?: string;
  style?: React.CSSProperties;
}>) {
  const tokens = darkMode ? DARK : LIGHT;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: TAB_GAP,
      height: TABS_ROW_HEIGHT,
      padding: padX,
      boxSizing: 'border-box',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      ...style,
    }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            height: TAB_HEIGHT,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            borderRadius: RADIUS.dashboardHeader,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            border: 'none',
            background: active ? tokens.tActiveBg : tokens.tInBg,
            color: active ? tokens.tActiveC : tokens.tInC,
            fontFamily: 'var(--font-ui),system-ui,sans-serif',
            boxShadow: 'none',
            transition: 'all .18s',
          }}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function CardHeaderSection({
  label,
  tabs,
  activeTab,
  onTabChange,
  subTabs,
  activeSubTab,
  onSubTabChange,
  onDetail,
  onCreate,
  onChart,
  detailIcon,
  chartIcon,
  detailTitle = 'Ver tabla',
  createTitle = 'Nuevo',
  chartTitle = 'Ver grafico',
  chartActive = false,
  darkMode = false,
}: Readonly<CardHeaderSectionProps>) {
  const tokens = darkMode ? DARK : LIGHT;
  const [btnHov, setBtnHov] = React.useState<'detail' | 'create' | 'chart' | null>(null);

  // Botón de acción estandarizado al estilo de la card de Cuentas:
  // círculo exterior translúcido + círculo interior sólido café con icono blanco.
  const renderAction = (
    key: 'detail' | 'create' | 'chart',
    onClick: () => void,
    title: string,
    icon: React.ReactNode,
    _active = false,
  ) => (
    <div style={{
      width: ACTION_OUTER, height: ACTION_OUTER, borderRadius: '50%',
      background: darkMode ? 'rgba(156,128,94,0.28)' : 'rgba(125,99,71,0.18)',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      <button
        onClick={onClick}
        aria-label={title}
        title={title}
        onMouseEnter={() => setBtnHov(key)}
        onMouseLeave={() => setBtnHov(null)}
        style={{
          width: ACTION_INNER, height: ACTION_INNER, borderRadius: '50%', border: 'none',
          background: darkMode ? '#9C805E' : '#7D6347',
          color: 'rgba(255,255,255,0.92)',
          cursor: 'pointer', display: 'grid', placeItems: 'center',
          transform: btnHov === key ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform .2s cubic-bezier(0.34,1.56,0.64,1), background .2s',
        }}
      >
        {icon}
      </button>
    </div>
  );

  const hasSubTabs = subTabs && subTabs.length > 0;

  return (
    <div style={{ flexShrink: 0, paddingTop: DASHBOARD_CARD.headerTop }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: TITLE_ROW_HEIGHT,
        padding: ROW_PAD_X,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: tokens.labelC,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-ui),system-ui,sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        </div>

        {(onDetail || onChart || onCreate) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {onDetail && renderAction('detail', onDetail, detailTitle, detailIcon ?? <Icon.chart size={12} strokeWidth={1.9} />)}
            {onChart && renderAction('chart', onChart, chartTitle, chartIcon ?? <Icon.target size={12} strokeWidth={1.9} />, chartActive)}
            {onCreate && renderAction('create', onCreate, createTitle, <Icon.plus size={13} strokeWidth={2.2} />)}
          </div>
        )}
      </div>

      {/* Fila de tabs principales */}
      <CardTabsRow
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        darkMode={darkMode}
      />

      {/* Fila de sub-tabs (opcional) */}
      {hasSubTabs && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: TAB_GAP,
          height: 38,
          padding: ROW_PAD_X,
          boxSizing: 'border-box',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 6,
        }}>
          {subTabs!.map(sub => {
            const active = activeSubTab === sub.id;
            return (
              <button key={sub.id} onClick={() => onSubTabChange?.(sub.id)} style={{
                height: 28,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                borderRadius: RADIUS.dashboardHeader,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
                background: active ? tokens.tActiveBg : tokens.tInBg,
                color: active ? tokens.tActiveC : tokens.tInC,
                fontFamily: 'var(--font-ui),system-ui,sans-serif',
                boxShadow: 'none',
                transition: 'all .18s',
                flexShrink: 0,
              }}>
                {sub.label}
                <span style={{
                  fontSize: 9, fontWeight: 900, padding: '1px 5px', borderRadius: 6,
                  background: active ? 'rgba(255,255,255,0.22)' : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(60,32,8,0.10)'),
                  color: active ? '#fff' : tokens.tInC,
                }}>
                  {sub.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
