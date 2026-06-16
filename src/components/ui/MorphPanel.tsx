'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icons';

interface OrbProps {
  dimension?: string;
  className?: string;
  tones?: { base?: string; accent1?: string; accent2?: string; accent3?: string };
  spinDuration?: number;
}

export const ColorOrb: React.FC<OrbProps> = ({ dimension = '192px', className, tones, spinDuration = 20 }) => {
  const fallbackTones = {
    base: 'oklch(95% 0.02 264.695)',
    accent1: 'oklch(75% 0.15 350)',
    accent2: 'oklch(80% 0.12 200)',
    accent3: 'oklch(78% 0.14 280)',
  };
  const palette = { ...fallbackTones, ...tones };
  const dimValue = parseInt(dimension.replace('px', ''), 10);

  const blurStrength     = dimValue < 50 ? Math.max(dimValue * 0.008, 1)   : Math.max(dimValue * 0.015, 4);
  const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5);
  const pixelDot         = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05): Math.max(dimValue * 0.008, 0.1);
  const shadowRange      = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2);
  const maskRadius       = dimValue < 30 ? '0%' : dimValue < 50 ? '5%' : dimValue < 100 ? '15%' : '25%';
  const adjustedContrast = dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength;

  return (
    <div
      className={cn('color-orb', className)}
      style={{
        width: dimension,
        height: dimension,
        '--base': palette.base,
        '--accent1': palette.accent1,
        '--accent2': palette.accent2,
        '--accent3': palette.accent3,
        '--spin-duration': `${spinDuration}s`,
        '--blur': `${blurStrength}px`,
        '--contrast': adjustedContrast,
        '--dot': `${pixelDot}px`,
        '--shadow': `${shadowRange}px`,
        '--mask': maskRadius,
      } as React.CSSProperties}
    />
  );
};

// Prompts frecuentes (maqueta, sin acción aún) — adaptados a finanzas.
const PROMPTS = [
  { label: 'Resumen del mes',    I: Icon.gauge,    color: '#2563EB' },
  { label: 'Analizar gastos',    I: Icon.chart,    color: '#d97706' },
  { label: 'Plan de ahorro',     I: Icon.target,   color: '#16a34a' },
  { label: 'Revisar deudas',     I: Icon.cards,    color: '#DB2777' },
  { label: 'Consejo financiero', I: Icon.sparkles, color: '#7C3AED' },
  { label: 'Más',                I: Icon.more,     color: '#6B7280' },
] as const;

const SPEED_FACTOR = 1;
const FORM_WIDTH = 400;
const FORM_HEIGHT = 472;

interface ContextShape {
  showForm: boolean;
  triggerOpen: () => void;
  triggerClose: () => void;
  dark: boolean;
  userName: string;
}

const FormContext = React.createContext({} as ContextShape);
const useFormContext = () => React.useContext(FormContext);

export interface MorphPanelProps {
  darkMode?: boolean;
  userName?: string;
}

export function MorphPanel({ darkMode = false, userName = 'Victor' }: Readonly<MorphPanelProps>) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const triggerClose = React.useCallback(() => {
    setShowForm(false);
    textareaRef.current?.blur();
  }, []);

  const triggerOpen = React.useCallback(() => {
    setShowForm(true);
    setTimeout(() => { textareaRef.current?.focus(); });
  }, []);

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose();
      }
    }
    document.addEventListener('mousedown', clickOutsideHandler);
    return () => document.removeEventListener('mousedown', clickOutsideHandler);
  }, [showForm, triggerClose]);

  const ctx = React.useMemo(
    () => ({ showForm, triggerOpen, triggerClose, dark: darkMode, userName }),
    [showForm, triggerOpen, triggerClose, darkMode, userName],
  );

  const bg  = darkMode ? '#1A1D21' : '#FFFFFF';
  const brd = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.12)';

  return (
    <div
      style={{
        position: 'fixed',
        right: 'calc(24px + env(safe-area-inset-right))',
        bottom: 'calc(24px + env(safe-area-inset-bottom))',
        zIndex: 250,
        display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end',
      }}
    >
      <motion.div
        ref={wrapperRef}
        data-panel
        className="relative flex flex-col items-center overflow-hidden"
        style={{
          background: bg,
          border: `1px solid ${brd}`,
          boxShadow: '0 16px 40px rgba(17,24,39,0.20)',
          fontFamily: 'var(--font-ui), system-ui, sans-serif',
        }}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : 'auto',
          height: showForm ? FORM_HEIGHT : 44,
          borderRadius: showForm ? 16 : 20,
        }}
        transition={{ type: 'spring', stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7, delay: showForm ? 0 : 0.08 }}
      >
        <FormContext.Provider value={ctx}>
          <DockBar />
          <InputForm ref={textareaRef} />
        </FormContext.Provider>
      </motion.div>
    </div>
  );
}

function DockBar() {
  const { showForm, triggerOpen, dark } = useFormContext();
  const [hov, setHov] = React.useState(false);
  const text = dark ? 'rgba(255,255,255,0.90)' : '#111827';
  return (
    <footer style={{ marginTop: 'auto', display: 'flex', height: 44, alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div key="blank" initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} style={{ height: 20, width: 20 }} />
          ) : (
            <motion.div key="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
              <ColorOrb dimension="24px" tones={{ base: dark ? 'oklch(90% 0 0)' : 'oklch(22.64% 0 0)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={triggerOpen}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: 'flex', flex: 1, justifyContent: 'flex-end',
            border: 'none', background: 'transparent', cursor: 'pointer',
            padding: '2px 6px', borderRadius: 999,
            color: text, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
            opacity: hov ? 0.7 : 1, transition: 'opacity .15s',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Pregúntame algo</span>
        </button>
      </div>
    </footer>
  );
}

function InputForm({ ref }: Readonly<{ ref: React.Ref<HTMLTextAreaElement> }>) {
  const { triggerClose, showForm, dark, userName } = useFormContext();
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [hovChip, setHovChip] = React.useState<number | null>(null);

  const text   = dark ? 'rgba(255,255,255,0.90)' : '#111827';
  const muted  = dark ? 'rgba(255,255,255,0.50)' : '#6B7280';
  const kbdBrd = dark ? 'rgba(255,255,255,0.16)' : 'rgba(17,24,39,0.16)';
  const chipBg  = dark ? 'rgba(255,255,255,0.06)' : '#F1F2F5';
  const chipHov = dark ? 'rgba(255,255,255,0.10)' : '#E9EBEF';
  const chipBrd = dark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)';
  const inputBrd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    triggerClose();
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') triggerClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      btnRef.current?.click();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ position: 'absolute', bottom: 0, width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? 'all' : 'none' }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            style={{ display: 'flex', height: '100%', flexDirection: 'column', padding: 14, boxSizing: 'border-box', gap: 12 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: text, fontSize: 13, fontWeight: 700, userSelect: 'none' }}>
                <ColorOrb dimension="22px" tones={{ base: dark ? 'oklch(90% 0 0)' : 'oklch(22.64% 0 0)' }} />
                Asistente IA
              </span>
              <button type="submit" ref={btnRef} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', userSelect: 'none' }}>
                <KeyHint borderColor={kbdBrd} color={muted}>⌘</KeyHint>
                <KeyHint borderColor={kbdBrd} color={muted}>Enter</KeyHint>
              </button>
            </div>

            {/* Bienvenida + prompts */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', minHeight: 0 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.3, color: muted }}>Hola {userName},</div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2, color: text }}>¿En qué te puedo ayudar?</div>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: muted, lineHeight: 1.5, maxWidth: 320 }}>
                Estoy aquí para ayudarte con tus finanzas. Elige una opción o dime qué necesitas.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {PROMPTS.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onMouseEnter={() => setHovChip(i)}
                    onMouseLeave={() => setHovChip(null)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 28, padding: '0 10px', borderRadius: 8,
                      background: hovChip === i ? chipHov : chipBg,
                      border: `1px solid ${chipBrd}`, color: text, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                      transition: 'background .15s',
                    }}
                  >
                    <span style={{ color: p.color, display: 'flex' }}><p.I size={14} strokeWidth={2} /></span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <textarea
              ref={ref}
              placeholder="Pregúntame lo que quieras..."
              name="message"
              required
              spellCheck={false}
              onKeyDown={handleKeys}
              style={{ width: '100%', height: 72, resize: 'none', borderRadius: 12, border: `1px solid ${inputBrd}`, outline: 'none', background: 'transparent', padding: 12, color: text, fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function KeyHint({ children, color, borderColor }: Readonly<{ children: string; color: string; borderColor: string }>) {
  return (
    <kbd style={{ display: 'flex', height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 4, border: `1px solid ${borderColor}`, padding: '0 6px', color, fontFamily: 'inherit', fontSize: 11 }}>
      {children}
    </kbd>
  );
}

export default MorphPanel;
