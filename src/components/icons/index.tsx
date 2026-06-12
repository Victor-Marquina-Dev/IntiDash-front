'use client';

import React from 'react';

export interface IconProps {
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const _ico = (p: React.ReactNode, vb = '0 0 24 24') =>
  function SvgIcon({ size = 18, strokeWidth = 1.75, style }: IconProps) {
    return (
      <svg width={size} height={size} viewBox={vb} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" style={style}>
        {p}
      </svg>
    );
  };

export const Icon = {
  home:      _ico(<><path d="M3 12 L12 4 L21 12" /><path d="M5 10 V20 H19 V10" /></>),
  cards:     _ico(<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10 H21" /><path d="M7 15 H10" /></>),
  chart:     _ico(<><path d="M4 20 V10" /><path d="M10 20 V4" /><path d="M16 20 V14" /><path d="M3 20 H21" /></>),
  wallet:    _ico(<><path d="M3 7 V18 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 V10 H7 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h13" /><circle cx="17" cy="14" r="1.2" /></>),
  target:    _ico(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>),
  list:      _ico(<><path d="M8 6 H21" /><path d="M8 12 H21" /><path d="M8 18 H21" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>),
  gear:      _ico(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  plus:      _ico(<><path d="M12 5 V19" /><path d="M5 12 H19" /></>),
  search:    _ico(<><circle cx="11" cy="11" r="7" /><path d="M21 21 L16 16" /></>),
  bell:      _ico(<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>),
  calendar:  _ico(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9 H21" /><path d="M8 3 V7" /><path d="M16 3 V7" /></>),
  arrowUp:   _ico(<><path d="M7 17 L17 7" /><path d="M9 7 H17 V15" /></>),
  arrowDown: _ico(<><path d="M7 7 L17 17" /><path d="M17 9 V17 H9" /></>),
  arrowRight:_ico(<><path d="M5 12 H19" /><path d="M13 6 L19 12 L13 18" /></>),
  chevron:   _ico(<path d="M6 9 L12 15 L18 9" />),
  sparkles:  _ico(<><path d="M12 3 L13.5 9 L20 10.5 L13.5 12 L12 18 L10.5 12 L4 10.5 L10.5 9 Z" /><path d="M19 4 L19.5 6 L21.5 6.5 L19.5 7 L19 9 L18.5 7 L16.5 6.5 L18.5 6 Z" /></>),
  utensils:  _ico(<><path d="M3 2 V9 a2 2 0 0 0 2 2 a2 2 0 0 0 2 -2 V2" /><path d="M5 11 V22" /><path d="M19 2 C17 2 16 4 16 8 V14 H19 V22" /></>),
  car:       _ico(<><path d="M5 17 H3 V11 L5 6 H19 L21 11 V17 H19" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>),
  music:     _ico(<><path d="M9 18 V5 L21 3 V16" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>),
  bag:       _ico(<><path d="M6 7 H18 L19 21 H5 Z" /><path d="M9 7 V4 a3 3 0 0 1 6 0 V7" /></>),
  film:      _ico(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3 V21" /><path d="M17 3 V21" /><path d="M3 8 H7" /><path d="M3 16 H7" /><path d="M17 8 H21" /><path d="M17 16 H21" /></>),
  heart:     _ico(<path d="M12 21 C 8 17 3 13 3 8 a5 5 0 0 1 9 -3 a5 5 0 0 1 9 3 c 0 5 -5 9 -9 13 Z" />),
  book:      _ico(<><path d="M4 4 V20 a2 2 0 0 0 2 2 H20 V4 H6 a2 2 0 0 0 -2 2 z" /><path d="M8 7 H17" /><path d="M8 11 H14" /></>),
  house:     _ico(<><path d="M3 12 L12 4 L21 12 V21 H3 Z" /><path d="M10 21 V14 H14 V21" /></>),
  more:      _ico(<><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /></>),
  flame:     _ico(<path d="M12 22 c 5 0 8 -3 8 -8 c 0 -4 -3 -6 -3 -8 c 0 -2 1 -3 0 -4 c -2 1 -3 4 -3 6 c -1 -1 -2 -3 -2 -5 c -3 2 -6 5 -6 11 c 0 5 1 8 6 8 z" />),
  check:     _ico(<path d="M5 12 L10 17 L20 7" />),
  alert:     _ico(<><circle cx="12" cy="12" r="9" /><path d="M12 8 V13" /><circle cx="12" cy="16" r="0.6" fill="currentColor" /></>),
  trendUp:   _ico(<><path d="M3 17 L9 11 L13 15 L21 7" /><path d="M15 7 H21 V13" /></>),
  trendDown: _ico(<><path d="M3 7 L9 13 L13 9 L21 17" /><path d="M15 17 H21 V11" /></>),
  panelLeft: _ico(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4 V20" /></>),
  download:  _ico(<><path d="M12 4 V15" /><path d="M7 11 L12 16 L17 11" /><path d="M5 20 H19" /></>),
  filter:    _ico(<path d="M3 5 H21 L14 13 V20 L10 18 V13 Z" />),
  link:      _ico(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
  db:        _ico(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5 V12 C3 13.66 7.03 15 12 15 S21 13.66 21 12 V5" /><path d="M3 12 V19 C3 20.66 7.03 22 12 22 S21 20.66 21 19 V12" /></>),
  trash:     _ico(<><path d="M3 6 H21" /><path d="M8 6 V4 a1 1 0 0 1 1 -1 H15 a1 1 0 0 1 1 1 V6" /><path d="M19 6 L18 20 a1 1 0 0 1 -1 1 H7 a1 1 0 0 1 -1 -1 L5 6" /></>),
  refresh:   _ico(<><path d="M21 8 A9 9 0 0 0 5 5 L2 8" /><path d="M3 16 A9 9 0 0 0 19 19 L22 16" /><path d="M21 2 V8 H15" /><path d="M3 22 V16 H9" /></>),
  edit:      _ico(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>),
  moon:      _ico(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />),
  sun:       _ico(<><circle cx="12" cy="12" r="4.5" /><path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" /></>),
  shield:    _ico(<><path d="M12 3 L4 7 V13 C4 17.4 7.5 20.5 12 22 C16.5 20.5 20 17.4 20 13 V7 Z" /><path d="M9 12 L11 14 L15 10" /></>),
  gauge:     _ico(<><path d="M3.05 11 A9 9 0 1 1 20.95 11" /><path d="M12 20 L12 12" /><path d="M9 9 L12 12" /><circle cx="12" cy="20" r="1.5" fill="currentColor" strokeWidth="0" /></>),
};

export type IconKey = keyof typeof Icon;
export type IconComponent = (typeof Icon)[IconKey];
