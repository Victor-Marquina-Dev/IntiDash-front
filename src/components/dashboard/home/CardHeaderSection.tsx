'use client';

import React from 'react';
import { Icon } from '@/components/icons';

const TITLE_ROW_HEIGHT = 42;
const TABS_ROW_HEIGHT = 46;
const HEADER_BLOCK_HEIGHT = TITLE_ROW_HEIGHT + TABS_ROW_HEIGHT;
const ROW_PAD_X = '0 16px';
const ACTION_BTN_SIZE = 28;
const ACTION_BTN_RADIUS = 8;
const TAB_HEIGHT = 32;
const TAB_PADDING = '0 14px';
const TAB_GAP = 6;

const DARK = {
  labelC: 'rgba(255,255,255,0.38)',
  tActiveBg: 'rgba(255,255,255,0.90)',
  tActiveC: '#111',
  tActiveSh: 'none',
  tInBg: 'rgba(255,255,255,0.04)',
  tInC: 'rgba(255,255,255,0.38)',
  tInBrd: 'rgba(255,255,255,0.08)',
  btnBg: 'rgba(255,255,255,0.06)',
  btnBrd: 'rgba(255,255,255,0.12)',
  btnC: 'rgba(255,255,255,0.65)',
  btnHovBg: 'rgba(255,255,255,0.14)',
  btnHovC: '#fff',
};

const LIGHT = {
  labelC: '#6B7280',
  tActiveBg: '#111827',
  tActiveC: '#fff',
  tActiveSh: 'none',
  tInBg: 'rgba(17,24,39,0.04)',
  tInC: '#6B7280',
  tInBrd: 'rgba(17,24,39,0.08)',
  btnBg: 'rgba(17,24,39,0.04)',
  btnBrd: 'rgba(17,24,39,0.10)',
  btnC: '#374151',
  btnHovBg: '#111827',
  btnHovC: '#fff',
};

export interface CardTab {
  id: string;
  label: string;
  badge: string | number;
}

interface CardHeaderSectionProps {
  icon: React.ReactNode;
  label: string;
  tabs: CardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onDetail?: () => void;
  onCreate?: () => void;
  onChart?: () => void;
  detailTitle?: string;
  createTitle?: string;
  chartTitle?: string;
  chartActive?: boolean;
  darkMode?: boolean;
}

export function CardHeaderSection({
  icon,
  label,
  tabs,
  activeTab,
  onTabChange,
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

  return (
    <div style={{ minHeight: HEADER_BLOCK_HEIGHT, flexShrink: 0 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: TITLE_ROW_HEIGHT,
        padding: ROW_PAD_X,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', color: tokens.labelC, flexShrink: 0 }}>{icon}</span>
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

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: TAB_GAP,
        height: TABS_ROW_HEIGHT,
        padding: ROW_PAD_X,
        boxSizing: 'border-box',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
              height: TAB_HEIGHT,
              padding: TAB_PADDING,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: `1px solid ${active ? tokens.tActiveBg : tokens.tInBrd}`,
              background: active ? tokens.tActiveBg : tokens.tInBg,
              color: active ? tokens.tActiveC : tokens.tInC,
              fontFamily: 'var(--font-ui),system-ui,sans-serif',
              boxShadow: active && darkMode ? tokens.tActiveSh : 'none',
              transition: 'all .18s',
              flexShrink: 0,
            }}>
              {tab.label}
              <span style={{ fontSize: 10, fontWeight: 900, padding: '1px 5px', borderRadius: 8, background: 'rgba(255,255,255,.2)' }}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
