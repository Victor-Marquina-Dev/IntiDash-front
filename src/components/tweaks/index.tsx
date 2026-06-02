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
  accent: '#3F561C',
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
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const setTweak = React.useCallback(<K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaks(prev => {
      const next = { ...prev, [k]: v };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [tweaks, setTweak];
}

const ACCENT_OPTIONS = ['#3F561C', '#8CA05A', '#C9D5A5', '#AEB5C0'];

interface TweaksPanelProps {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
}

export function TweaksPanel({ tweaks, setTweak }: TweaksPanelProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {open && (
        <div style={{
          width: 264, marginBottom: 8,
          background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: 14, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Apariencia
          </div>

          <Row label="Acento">
            <div style={{ display: 'flex', gap: 6 }}>
              {ACCENT_OPTIONS.map(c => (
                <button key={c} onClick={() => setTweak('accent', c)} style={{
                  width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: tweaks.accent === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                }} />
              ))}
            </div>
          </Row>

          <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 4 }}>
            Gráficas
          </div>

          <Row label="Comparativa">
            <SegControl
              options={['area', 'bars']}
              value={tweaks.chartType}
              onChange={v => setTweak('chartType', v as Tweaks['chartType'])}
            />
          </Row>

          <Row label="Sparklines">
            <Toggle value={tweaks.microCharts} onChange={v => setTweak('microCharts', v)} />
          </Row>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: C.primary, color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          fontSize: 16,
        }}>
        ⚙
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: C.text }}>{label}</span>
      {children}
    </div>
  );
}

function SegControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex', borderRadius: 8, overflow: 'hidden',
      border: `1px solid ${C.border}`, background: C.bg,
    }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding: '4px 10px', border: 'none', cursor: 'pointer',
          fontSize: 11.5, fontFamily: 'Inter', fontWeight: 500,
          background: value === o ? C.primary : 'transparent',
          color: value === o ? '#fff' : C.textDim,
          transition: 'all .15s',
        }}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 999,
      background: value ? C.primary : C.border,
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 2,
        left: value ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}
