'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';

export const FORM_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 9,
  border: `1px solid ${C.border}`,
  background: '#fff',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  color: C.text,
  outline: 'none',
  boxSizing: 'border-box',
};

export const FORM_LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.textMute,
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  display: 'block',
  marginBottom: 5,
};

export const FORM_CANCEL_BUTTON_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: 'none',
  cursor: 'pointer',
  color: C.textDim,
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
};

export const FORM_SUBMIT_BUTTON_STYLE: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 10,
  border: 'none',
  color: '#fff',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  fontWeight: 600,
  transition: 'all 0.15s',
};

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
  /** "Ver tabla →" style: text link, olive, no border */
  link?: boolean;
  /** "+ Nuevo" style: pill with tinted background */
  create?: boolean;
  /** accent color for create variant (defaults to C.neg) */
  accent?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Button({ children, primary, ghost, link, create, accent, icon, onClick, style, size = 'md', disabled }: Readonly<ButtonProps>) {
  const sizes = {
    sm: { padding: '6px 10px', fontSize: 12.5 },
    md: { padding: '8px 14px', fontSize: 13.5 },
  };

  if (link) {
    return (
      <button onClick={onClick} disabled={disabled} style={{
        background: 'none', border: 'none', padding: '4px 0',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: C.olive,
        fontFamily: 'var(--font-ui), system-ui, sans-serif', letterSpacing: -0.1,
        ...style,
      }}>
        {icon}{children} →
      </button>
    );
  }

  if (create) {
    const c = accent ?? C.neg;
    return (
      <button onClick={onClick} disabled={disabled} style={{
        padding: '4px 10px', borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: c,
        background: `${c}15`, border: `1px solid ${c}30`,
        fontFamily: 'var(--font-ui), system-ui, sans-serif', letterSpacing: -0.1,
        opacity: disabled ? 0.5 : 1, transition: 'all .15s',
        ...style,
      }}>
        {icon}{children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fz-btn ${primary ? 'fz-btn--primary' : ghost ? 'fz-btn--ghost' : 'fz-btn--default'}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        border: '1px solid', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500, fontFamily: 'var(--font-ui)', letterSpacing: -0.1,
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
          alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)',
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
      textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'var(--font-ui)',
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
      <div style={{ fontSize: 11, color: C.textMute, textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: 600 }}>{label}</div>
      <div style={{
        fontSize: 17, fontWeight: 600, marginTop: 5,
        color: pos ? C.pos : muted ? C.textDim : C.text,
        fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4,
      }}>{value}</div>
    </div>
  );
}

// ── ModalShell ───────────────────────────────────────────────────────────
// Wrapper animado reutilizable para todos los modales.
// Fade + scale al entrar; al cerrar usa onClose directamente.
interface ModalShellProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  zIndex?: number;
}

export function ModalShell({ onClose, children, maxWidth = 480, zIndex = 300 }: Readonly<ModalShellProps>) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex,
        background: visible ? 'rgba(17,24,39,0.40)' : 'rgba(17,24,39,0)',
        backdropFilter: visible ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, boxSizing: 'border-box',
        transition: 'background 0.25s ease, backdrop-filter 0.25s ease',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: 'opacity 0.25s cubic-bezier(.2,.8,.2,1), transform 0.25s cubic-bezier(.2,.8,.2,1)',
      }}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
