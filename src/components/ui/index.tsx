'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';

// ── Card ────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hoverable?: boolean;
  pad?: number;
  className?: string;
}

export function Card({ children, style, hoverable, pad = 20, className = '' }: CardProps) {
  return (
    <div
      className={`fz-card ${hoverable ? 'fz-card--hover' : ''} ${className}`}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: pad,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
      }}>
      {children}
    </div>
  );
}

// ── Tag ─────────────────────────────────────────────────────────────────
interface TagProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  dot?: string;
  style?: React.CSSProperties;
}

export function Tag({ children, color = C.textDim, bg, dot, style }: TagProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
      color, background: bg || 'rgba(63,86,28,0.06)',
      border: bg ? 'none' : `1px solid ${C.border}`,
      lineHeight: 1.4, whiteSpace: 'nowrap', flexShrink: 0,
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {children}
    </span>
  );
}

// ── Delta ────────────────────────────────────────────────────────────────
interface DeltaProps {
  value: string;
  kind?: 'pos' | 'neg' | 'auto';
  style?: React.CSSProperties;
}

export function Delta({ value, kind = 'auto', style }: DeltaProps) {
  const positive = kind === 'pos' || (kind === 'auto' && (value.startsWith('+') || value.startsWith('↑')));
  const negative = kind === 'neg' || (kind === 'auto' && (value.startsWith('-') || value.startsWith('−') || value.startsWith('↓')));
  const color = positive ? C.pos : negative ? C.neg : C.textDim;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500, color, ...style }}>
      {positive && <Icon.trendUp size={12} />}
      {negative && <Icon.trendDown size={12} />}
      {value}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────────────────
interface ButtonProps {
  children?: React.ReactNode;
  primary?: boolean;
  ghost?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Button({ children, primary, ghost, icon, onClick, style, size = 'md', disabled }: Readonly<ButtonProps>) {
  const sizes = {
    sm: { padding: '6px 10px', fontSize: 12.5 },
    md: { padding: '8px 14px', fontSize: 13.5 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fz-btn ${primary ? 'fz-btn--primary' : ghost ? 'fz-btn--ghost' : 'fz-btn--default'}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        border: '1px solid', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500, fontFamily: 'Inter', letterSpacing: -0.1,
        transition: 'all .15s', opacity: disabled ? 0.5 : 1,
        ...sizes[size],
        background: primary ? C.primary : ghost ? 'transparent' : '#fff',
        color: primary ? '#fff' : C.text,
        borderColor: primary ? C.primary : ghost ? 'transparent' : C.border,
        ...style,
      }}>
      {icon}
      {children}
    </button>
  );
}

// ── CardHeader ───────────────────────────────────────────────────────────
interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: string;
  right?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, right }: CardHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, letterSpacing: -0.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
      {action && (
        <button className="fz-link" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: 12, display: 'inline-flex',
          alignItems: 'center', gap: 4, fontFamily: 'Inter',
        }}>
          {action} <Icon.arrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ── Eyebrow ──────────────────────────────────────────────────────────────
interface EyebrowProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Eyebrow({ children, icon }: EyebrowProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontSize: 10.5, color: C.textDim, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'Inter',
    }}>
      {icon}
      {children}
    </div>
  );
}

// ── SubKpi ───────────────────────────────────────────────────────────────
interface SubKpiProps {
  label: string;
  value: string;
  pos?: boolean;
  muted?: boolean;
}

export function SubKpi({ label, value, pos, muted }: SubKpiProps) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 14.5, fontWeight: 500, marginTop: 4,
        color: pos ? C.pos : muted ? C.textDim : C.text,
        fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2,
      }}>{value}</div>
    </div>
  );
}
