'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { RADIUS } from '@/lib/radius';

const TITLE_ROW_HEIGHT = 42;
const TABS_ROW_HEIGHT  = 34;
const ROW_PAD_X = '0 16px';
const ACTION_BTN_SIZE = 28;
const ACTION_BTN_RADIUS = 8;
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
  detailTitle = 'Ver tabla',
  createTitle = 'Nuevo',
  chartTitle = 'Ver grafico',
  chartActive = false,
  darkMode = false,
}: Readonly<CardHeaderSectionProps>) {
  const tokens = darkMode ? DARK : LIGHT;
  const [btnHov, setBtnHov] = React.useState<'detail' | 'create' | 'chart' | null>(null);

  const btnStyle = (key: 'detail' | 'create' | 'chart', active = false): React.CSSProperties => ({
    width: ACTION_BTN_SIZE,
    height: ACTION_BTN_SIZE,
    borderRadius: ACTION_BTN_RADIUS,
    background: active
      ? (darkMode ? 'rgba(255,255,255,.90)' : '#111827')
      : (btnHov === key ? tokens.btnHovBg : tokens.btnBg),
    border: `1px solid ${active ? (darkMode ? 'rgba(255,255,255,0.90)' : '#111827') : tokens.btnBrd}`,
    color: active
      ? (darkMode ? '#111' : '#fff')
      : (btnHov === key ? tokens.btnHovC : tokens.btnC),
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    transition: 'all .2s',
    flexShrink: 0,
  });

  const hasSubTabs = subTabs && subTabs.length > 0;

  return (
    <div style={{ flexShrink: 0 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {onDetail && (
              <button
                onClick={onDetail}
                aria-label={detailTitle}
                title={detailTitle}
                onMouseEnter={() => setBtnHov('detail')}
                onMouseLeave={() => setBtnHov(null)}
                style={btnStyle('detail')}
              >
                <Icon.chart size={12} strokeWidth={1.7} />
              </button>
            )}
            {onChart && (
              <button
                onClick={onChart}
                aria-label={chartTitle}
                title={chartTitle}
                onMouseEnter={() => setBtnHov('chart')}
                onMouseLeave={() => setBtnHov(null)}
                style={btnStyle('chart', chartActive)}
              >
                <Icon.target size={12} strokeWidth={1.7} />
              </button>
            )}
            {onCreate && (
              <button
                onClick={onCreate}
                aria-label={createTitle}
                title={createTitle}
                onMouseEnter={() => setBtnHov('create')}
                onMouseLeave={() => setBtnHov(null)}
                style={btnStyle('create')}
              >
                <Icon.plus size={12} strokeWidth={2} />
              </button>
            )}
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
