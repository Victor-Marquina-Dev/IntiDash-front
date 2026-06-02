'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { ScreenId } from './Sidebar';
import { useBreakpoint } from '@/lib/breakpoints';

const GearIcon = Icon.gear;

const NAV_TABS: { id: ScreenId; label: string; I: (typeof Icon)[keyof typeof Icon] }[] = [
  { id: 'home',   label: 'Dashboard',     I: Icon.home },
  { id: 'cards',  label: 'Cuentas',       I: Icon.wallet },
  { id: 'tx',     label: 'Transacciones', I: Icon.list },
  { id: 'charts', label: 'Análisis',      I: Icon.chart },
  { id: 'goals',  label: 'Objetivos',     I: Icon.target },
  { id: 'debts',  label: 'Deudas',        I: Icon.cards },
];

interface TopBarProps {
  screen?: ScreenId;
  setActive?: (id: ScreenId) => void;
}

/* ─── NavTab ─────────────────────────────────────────────────────────────── */
function NavTab({
  tab, isActive, showLabel, onClick,
}: Readonly<{
  tab: (typeof NAV_TABS)[number];
  isActive: boolean;
  showLabel: boolean;
  onClick: () => void;
}>) {
  const [hovered, setHovered] = React.useState(false);

  let bg: string = 'transparent';
  if (isActive)     bg = C.olive;
  else if (hovered) bg = `${C.olive}18`;

  let color: string = C.textDim;
  if (isActive)     color = '#fff';
  else if (hovered) color = C.text;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: showLabel ? '7px 13px' : '7px 10px',
        borderRadius: 8,
        background: bg,
        border: 'none',
        color,
        cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        letterSpacing: isActive ? -0.2 : 0,
        transition: 'background 0.14s, color 0.14s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <tab.I size={13} strokeWidth={isActive ? 2.1 : 1.7} />
      {showLabel && tab.label}
    </button>
  );
}

/* ─── TopBar ─────────────────────────────────────────────────────────────── */
export function TopBar({ screen = 'home', setActive }: Readonly<TopBarProps>) {
  const bp = useBreakpoint();
  const isMobile  = bp === 'mobile';
  const isTablet  = bp === 'tablet';
  const isDesktop = bp === 'desktop';

  const isSettingsActive = screen === 'notion';
  const [gearHovered, setGearHovered] = React.useState(false);

  const activeLabel = NAV_TABS.find(t => t.id === screen)?.label ?? 'Dashboard';
  const ActiveIcon  = NAV_TABS.find(t => t.id === screen)?.I;

  let sidePad = 36;
  if (isMobile)      sidePad = 18;
  else if (isTablet) sidePad = 24;

  let gearBg: string = 'transparent';
  if (isSettingsActive) gearBg = `${C.olive}14`;
  else if (gearHovered) gearBg = `${C.olive}09`;

  let gearBorder: string = `${C.olive}22`;
  if (isSettingsActive) gearBorder = `${C.olive}55`;
  else if (gearHovered) gearBorder = `${C.olive}33`;

  let gearColor: string = C.textDim;
  if (isSettingsActive) gearColor = C.navbar;
  else if (gearHovered) gearColor = C.text;

  return (
    <header style={{
      height: isMobile ? 58 : 68,
      background: 'rgba(250,251,248,0.94)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky', top: 0, zIndex: 20,
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', height: '100%', gap: 8,
        maxWidth: 1800, marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: sidePad, paddingRight: sidePad,
        boxSizing: 'border-box',
      }}>

      {/* ── Mobile ── */}
      {isMobile && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {ActiveIcon && (
            <span style={{ color: C.olive, display: 'flex' }}>
              <ActiveIcon size={16} strokeWidth={2} />
            </span>
          )}
          <span style={{
            fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.5,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {activeLabel}
          </span>
        </div>
      )}

      {/* ── Spacer izquierdo ── */}
      {!isMobile && <div style={{ flex: 1 }} />}

      {/* ── Nav tabs ── */}
      {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 2 : 3 }}>
          {NAV_TABS.map(tab => (
            <NavTab
              key={tab.id}
              tab={tab}
              isActive={tab.id === screen}
              showLabel={isDesktop || tab.id === screen}
              onClick={() => setActive?.(tab.id)}
            />
          ))}
        </nav>
      )}

      {/* ── Zona derecha ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0, flexGrow: isMobile ? 0 : 1,
        justifyContent: isMobile ? 'flex-start' : 'flex-end',
      }}>

        {/* Ajustes */}
        <button
          onClick={() => setActive?.('notion')}
          onMouseEnter={() => setGearHovered(true)}
          onMouseLeave={() => setGearHovered(false)}
          title="Ajustes"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: gearBg,
            border: `1px solid ${gearBorder}`,
            color: gearColor,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            transition: 'all 0.14s', flexShrink: 0,
          }}
        >
          <GearIcon size={14} strokeWidth={isSettingsActive ? 2 : 1.7} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: C.border, flexShrink: 0 }} />

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(140deg, #A4BE6A 0%, ${C.navbar} 100%)`,
          display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.4,
          fontFamily: 'Inter, system-ui, sans-serif', flexShrink: 0,
          boxShadow: `0 0 0 2px rgba(250,251,248,1), 0 0 0 3px ${C.olive}40`,
          userSelect: 'none', cursor: 'default',
        }}>
          VM
        </div>
      </div>
      </div>
    </header>
  );
}
