'use client';

import React from 'react';
import { C } from '@/lib/colors';

export function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: active ? C.primary : C.border,
      color: active ? '#fff' : C.textMute,
      fontSize: 10, fontWeight: 900,
      transition: 'all 0.2s',
    }}>
      {active ? '✓' : n}
    </span>
  );
}

export function Required() {
  return <span style={{ color: C.neg, fontWeight: 900 }}>*</span>;
}

export const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, boxSizing: 'border-box',
  borderRadius: 10, border: `1px solid ${C.border}`,
  background: '#fff', color: C.text,
  outline: 'none', padding: '0 11px',
  fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12.5,
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 38, padding: '0 16px', borderRadius: 10, border: 'none',
    background: disabled ? C.border : C.primary,
    color:      disabled ? C.textMute : '#fff',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-ui), system-ui, sans-serif',
    fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
  };
}
