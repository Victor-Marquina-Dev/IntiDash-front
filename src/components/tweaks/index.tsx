'use client';

import React from 'react';
import { C } from '@/lib/colors';

export interface Tweaks {
  accent: string;
  chartType: 'area' | 'bars';
  density: 'compact' | 'regular';
  microCharts: boolean;
}

const DEFAULTS: Tweaks = {
  accent: '#111111',   // accent estandarizado (negro elegante)
  chartType: 'area',
  density: 'compact',
  microCharts: false,
};

const STORAGE_KEY = 'fz.tweaks';

export function useTweaks(): [Tweaks, <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void] {
  const [tweaks, setTweaks] = React.useState<Tweaks>(() => {
    if (typeof window === 'undefined') return DEFAULTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // accent ya no es configurable: se fuerza al valor estandarizado aunque
      // exista un valor antiguo (verde) guardado en localStorage.
      return stored ? { ...DEFAULTS, ...JSON.parse(stored), accent: DEFAULTS.accent } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const setTweak = React.useCallback(<K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaks(prev => {
      const next = { ...prev, [k]: v };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return [tweaks, setTweak];
}

interface TweaksPanelProps {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
}

function MomotechLogo() {
  return (
    <svg width="108" height="20" viewBox="0 0 310 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="50" height="50" rx="12" fill="none" stroke="url(#mm-g)" strokeWidth="2" />
      <rect x="9" y="9" width="38" height="38" rx="7" fill="#22c55e" fillOpacity=".06" />
      <rect x="14" y="15" width="5" height="24" rx="1.5" fill="#16a34a" />
      <rect x="37" y="15" width="5" height="24" rx="1.5" fill="#16a34a" />
      <polygon points="19,15 28,27 28,15" fill="#16a34a" />
      <polygon points="28,15 37,15 28,27" fill="#16a34a" />
      <rect x="0" y="17.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="0" y="26.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="0" y="35.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="53" y="17.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="53" y="26.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="53" y="35.5" width="3" height="2.5" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="17.5" y="0" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="26.5" y="0" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="35.5" y="0" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="17.5" y="53" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="26.5" y="53" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <rect x="35.5" y="53" width="2.5" height="3" rx="1" fill="#16a34a" fillOpacity=".7" />
      <text x="72" y="40" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="34" fill="#0a120a" letterSpacing="-1.5">momo</text>
      <text x="187" y="40" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="34" fill="url(#mm-g)" letterSpacing="-1.5">tech</text>
    </svg>
  );
}

export function TweaksPanel({ tweaks, setTweak }: TweaksPanelProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 9999,
      fontFamily: 'var(--font-ui), system-ui, sans-serif',
    }}>
      {open && (
        <div style={{
          width: 264,
          marginBottom: 8,
          background: '#fff',
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MomotechLogo />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Graficas
          </div>

          <Row label="Comparativa">
            <SegControl
              options={['area', 'bars']}
              value={tweaks.chartType}
              onChange={value => setTweak('chartType', value as Tweaks['chartType'])}
            />
          </Row>

          <Row label="Sparklines">
            <Toggle value={tweaks.microCharts} onChange={value => setTweak('microCharts', value)} />
          </Row>
        </div>
      )}

      <button
        aria-label="Abrir ajustes visuales"
        onClick={() => setOpen(value => !value)}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: C.primary,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        CFG
      </button>
    </div>
  );
}

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: C.text }}>{label}</span>
      {children}
    </div>
  );
}

function SegControl({ options, value, onChange }: Readonly<{ options: string[]; value: string; onChange: (v: string) => void }>) {
  return (
    <div style={{
      display: 'flex',
      borderRadius: 8,
      overflow: 'hidden',
      border: `1px solid ${C.border}`,
      background: C.bg,
    }}>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            padding: '4px 10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11.5,
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            background: value === option ? C.primary : 'transparent',
            color: value === option ? '#fff' : C.textDim,
            transition: 'all .15s',
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: Readonly<{ value: boolean; onChange: (v: boolean) => void }>) {
  return (
    <button
      aria-label="Alternar sparklines"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        background: value ? C.primary : C.border,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .2s',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: value ? 18 : 2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}
