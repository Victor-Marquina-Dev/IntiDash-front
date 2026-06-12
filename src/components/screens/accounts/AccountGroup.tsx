'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { formatIntegerCurrency } from '@/lib/format';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';
import { AccountItem } from './AccountItem';

function AccountGroupPanel({ isOpen, darkMode = false, children }: Readonly<{ isOpen: boolean; darkMode?: boolean; children: React.ReactNode }>) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: isOpen ? '1fr' : '0fr',
      opacity: isOpen ? 1 : 0,
      background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.015)',
      transition: 'grid-template-rows 240ms ease, opacity 180ms ease',
    }}>
      <div style={{
        overflow: 'hidden',
        padding: isOpen ? '6px 0 8px' : '0 0',
        transition: 'padding 240ms ease',
      }}>
        {children}
      </div>
    </div>
  );
}

function AccountGroupHeader({ label, count, isOpen, darkMode = false, onToggle }: Readonly<{
  label: string;
  count: number;
  isOpen: boolean;
  darkMode?: boolean;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 52,
        padding: '0 30px',
        border: 'none',
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : C.border}`,
        borderBottom: isOpen ? `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : C.border}` : '1px solid transparent',
        background: isOpen
          ? (darkMode ? 'linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))' : 'linear-gradient(90deg, rgba(17,24,39,0.045), rgba(17,24,39,0.018))')
          : (darkMode ? 'rgba(255,255,255,0.03)' : '#fff'),
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.16s ease, border-color 0.16s ease',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <span style={{
        width: 7,
        height: 7,
        borderRadius: 99,
        background: isOpen ? C.primary : (darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.18)'),
        boxShadow: isOpen ? `0 0 0 4px ${C.primary}14` : 'none',
        flexShrink: 0,
        transition: 'background 0.16s ease, box-shadow 0.16s ease',
      }} />
      <span style={{ fontSize: 12, fontWeight: 900, color: isOpen ? (darkMode ? 'rgba(255,255,255,0.88)' : C.text) : (darkMode ? 'rgba(255,255,255,0.50)' : C.textMute), textTransform: 'uppercase', letterSpacing: 1.1 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 900, color: isOpen ? C.primary : (darkMode ? 'rgba(255,255,255,0.88)' : C.textMute), background: isOpen ? 'rgba(37,99,235,0.12)' : (darkMode ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.06)'), padding: '2px 8px', borderRadius: 99 }}>
        {count}
      </span>
      <Icon.chevron
        size={16}
        strokeWidth={2.2}
        style={{
          marginLeft: 'auto',
          color: isOpen ? C.primary : (darkMode ? 'rgba(255,255,255,0.38)' : C.textMute),
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 180ms ease, color 160ms ease',
        }}
      />
    </button>
  );
}

export function AccountListGroup({ label, accounts, isOpen, activeCuentaId, isGroupActive = false, groupTotal, darkMode = false, onToggle, onSelect, onGroupSelect }: Readonly<{
  label: string;
  accounts: CuentaBancariaRow[];
  isOpen: boolean;
  activeCuentaId?: string;
  isGroupActive?: boolean;
  groupTotal?: number;
  darkMode?: boolean;
  onToggle: () => void;
  onSelect: (cuenta: CuentaBancariaRow) => void;
  onGroupSelect?: () => void;
}>) {
  const [hovGroup, setHovGroup] = React.useState(false);
  if (accounts.length === 0) return null;

  const showGroupRow = accounts.length > 1 && onGroupSelect;

  return (
    <>
      <AccountGroupHeader label={label} count={accounts.length} isOpen={isOpen} darkMode={darkMode} onToggle={onToggle} />
      <AccountGroupPanel isOpen={isOpen} darkMode={darkMode}>
        {showGroupRow && (
          <div
            onClick={onGroupSelect}
            onMouseEnter={() => setHovGroup(true)}
            onMouseLeave={() => setHovGroup(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px 10px 16px', cursor: 'pointer',
              background: isGroupActive ? 'rgba(17,24,39,0.06)' : hovGroup ? 'rgba(17,24,39,0.03)' : 'transparent',
              borderLeft: `3px solid ${isGroupActive ? C.primary : 'transparent'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: isGroupActive ? C.primary : hovGroup ? 'rgba(17,24,39,0.12)' : 'rgba(17,24,39,0.07)',
              color: isGroupActive ? '#fff' : C.textDim,
              display: 'grid', placeItems: 'center',
              transition: 'background 0.2s',
            }}>
              <Icon.list size={15} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text }}>Todas · {label}</div>
              <div style={{ fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.38)' : C.textMute, fontWeight: 600, marginTop: 1 }}>Vista agregada</div>
            </div>
            {groupTotal != null && (
              <div style={{ fontSize: 13, fontWeight: 900, color: darkMode ? 'rgba(255,255,255,0.88)' : C.text, fontVariantNumeric: 'tabular-nums' }}>
                {formatIntegerCurrency(groupTotal)}
              </div>
            )}
          </div>
        )}
        {accounts.map(cuenta => (
          <AccountItem key={cuenta.id} cuenta={cuenta}
            active={activeCuentaId === cuenta.id}
            onSelect={() => onSelect(cuenta)}
            darkMode={darkMode}
          />
        ))}
      </AccountGroupPanel>
    </>
  );
}

