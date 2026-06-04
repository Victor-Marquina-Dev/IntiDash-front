'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { ScreenId } from './Sidebar';
import { useBreakpoint } from '@/lib/breakpoints';

const GearIcon     = Icon.gear;
const MoonIcon     = Icon.moon;
const SunIcon      = Icon.sun;
const CalendarIcon = Icon.calendar;
const TrashIcon    = Icon.trash;

function MomotechLogo({ dark = false }: Readonly<{ dark?: boolean }>) {
  const textColor = dark ? '#f0f0ee' : '#0a120a';
  const accentColor = dark ? '#22c55e' : '#16a34a';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      {/* Ícono cuadrado estilo Vectra */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: 'block', flexShrink: 0 }}>
        <rect width="28" height="28" rx="7" fill={dark ? '#1a2a1a' : '#0d1f0d'} />
        <path d="M8 8 L14 20 L20 8" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M11 14 L17 14" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{
        fontSize: 15, fontWeight: 800, letterSpacing: -0.5,
        color: textColor,
        fontFamily: 'var(--font-ui), system-ui, sans-serif',
      }}>
        Florín
      </span>
    </div>
  );
}

const NAV_TABS: { id: ScreenId; label: string; I: (typeof Icon)[keyof typeof Icon] }[] = [
  { id: 'home',   label: 'Dashboard',     I: Icon.home },
  { id: 'cards',  label: 'Cuentas',       I: Icon.wallet },
  { id: 'tx',     label: 'Transacciones', I: Icon.list },
  { id: 'charts', label: 'Análisis',      I: Icon.chart },
  { id: 'goals',  label: 'Objetivos',     I: Icon.target },
  { id: 'debts',  label: 'Deudas',        I: Icon.cards },
];

type Period = 'today' | 'week' | 'month' | '6months' | 'year';

const PERIOD_LABELS: { id: Period; label: string }[] = [
  { id: 'today',   label: 'Hoy'     },
  { id: 'week',    label: 'Semana'  },
  { id: 'month',   label: 'Mes'     },
  { id: '6months', label: '6 meses' },
  { id: 'year',    label: 'Año'     },
];

const FMT_SHORT = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
const FMT_LONG  = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

function getDateRange(period: Period): string {
  const now = new Date();
  if (period === 'today') return FMT_SHORT(now);
  if (period === 'week') {
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${FMT_SHORT(mon)} – ${FMT_SHORT(sun)}`;
  }
  if (period === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${FMT_SHORT(first)} – ${FMT_SHORT(last)}`;
  }
  if (period === '6months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return `${FMT_SHORT(start)} – ${FMT_SHORT(now)}`;
  }
  return `1 ene – 31 dic`;
}

/* ─── DateRangePicker ────────────────────────────────────────────────────── */
const WEEK_DAYS   = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const total  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DateRangePicker({ startDate, endDate, onSelect, dark }: Readonly<{
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date, end: Date | null) => void;
  dark: boolean;
}>) {
  const seed = startDate ?? new Date();
  const [viewYear,  setViewYear]  = React.useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(seed.getMonth());
  const [hover,     setHover]     = React.useState<Date | null>(null);
  const [visible,   setVisible]   = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cells       = buildCalendarDays(viewYear, viewMonth);
  const accent      = C.olive;
  const accentLight = `${C.olive}28`;
  const bg          = dark ? '#1a1f1a' : '#fff';
  const textC       = dark ? 'rgba(255,255,255,0.85)' : C.text;
  const muteC       = dark ? 'rgba(255,255,255,0.32)' : C.textMute;
  const borderC     = dark ? 'rgba(255,255,255,0.1)' : C.border;
  const btnC        = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function goToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelect(now, now);
  }

  function handleDay(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    if (!startDate || endDate) {
      onSelect(clicked, null);
    } else if (clicked < startDate) {
      onSelect(clicked, startDate);
    } else {
      onSelect(startDate, clicked);
    }
  }

  function inRange(day: number): boolean {
    const d   = new Date(viewYear, viewMonth, day);
    const end = endDate ?? hover;
    if (!startDate || !end) return false;
    const [lo, hi] = startDate <= end ? [startDate, end] : [end, startDate];
    return d > lo && d < hi;
  }

  function isEdge(day: number, which: 'start' | 'end'): boolean {
    const ref = which === 'start' ? startDate : (endDate ?? hover);
    if (!ref) return false;
    return sameDay(new Date(viewYear, viewMonth, day), ref);
  }

  const navBtnStyle: React.CSSProperties = {
    background: btnC, border: `1px solid ${borderC}`,
    borderRadius: 8, cursor: 'pointer',
    color: textC, fontSize: 14, lineHeight: 1,
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.12s',
  };

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
      background: bg, border: `1px solid ${borderC}`,
      borderRadius: 18, padding: '16px 16px 14px',
      boxShadow: dark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 20px 56px rgba(0,0,0,0.14)',
      width: 308,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
      transition: 'opacity 0.18s ease, transform 0.18s ease',
      transformOrigin: 'top right',
    }}>
      {/* Encabezado: mes+año a la izq, Hoy + flechas a la der */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: textC, fontFamily: 'var(--font-ui),sans-serif', letterSpacing: -0.3 }}>
          {MONTH_NAMES[viewMonth].toLowerCase()} {viewYear}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={goToday} style={{
            ...navBtnStyle, width: 'auto', padding: '0 8px',
            fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-ui),sans-serif',
          }}>
            Hoy
          </button>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <button onClick={nextMonth} style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Cabecera días semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: muteC, padding: '2px 0 6px', fontFamily: 'var(--font-ui),sans-serif', letterSpacing: 0.5 }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: borderC, marginBottom: 6 }} />

      {/* Grid días — filas con más altura */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const start   = isEdge(day, 'start');
          const end     = isEdge(day, 'end');
          const rangeIn = inRange(day);
          const isToday = sameDay(new Date(viewYear, viewMonth, day), new Date());
          return (
            <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}
              onClick={() => handleDay(day)}
              onMouseEnter={() => !endDate && setHover(new Date(viewYear, viewMonth, day))}
              onMouseLeave={() => setHover(null)}
            >
              {rangeIn && <div style={{ position: 'absolute', inset: '4px 0', background: accentLight, zIndex: 0 }} />}
              {start && endDate && <div style={{ position: 'absolute', inset: '4px 0', background: accentLight, zIndex: 0, borderRadius: '50% 0 0 50%' }} />}
              {end && startDate && !sameDay(startDate, new Date(viewYear, viewMonth, day)) && (
                <div style={{ position: 'absolute', inset: '4px 0', background: accentLight, zIndex: 0, borderRadius: '0 50% 50% 0' }} />
              )}
              <span style={{
                position: 'relative', zIndex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: '50%',
                background: start || end ? accent : 'transparent',
                color: start || end ? '#fff' : isToday ? accent : textC,
                fontSize: 13, fontWeight: start || end || isToday ? 700 : 400,
                fontFamily: 'var(--font-ui),sans-serif',
                cursor: 'pointer',
                outline: isToday && !start && !end ? `2px solid ${accent}` : 'none',
                outlineOffset: '-2px',
                transition: 'background 0.12s, transform 0.1s',
              }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 10, background: btnC, fontSize: 11.5, color: muteC, fontFamily: 'var(--font-ui),sans-serif', textAlign: 'center' }}>
        {!startDate && 'Selecciona fecha de inicio'}
        {startDate && !endDate && '↗ Ahora selecciona la fecha de fin'}
        {startDate && endDate && `✓ ${FMT_SHORT(startDate)} – ${FMT_SHORT(endDate)}`}
      </div>
    </div>
  );
}

interface TopBarProps {
  screen?: ScreenId;
  setActive?: (id: ScreenId) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

/* ─── NavTab estilo Vectra ────────────────────────────────────────────────── */
function NavTab({
  tab, isActive, onClick, dark,
}: Readonly<{
  tab: (typeof NAV_TABS)[number];
  isActive: boolean;
  onClick: () => void;
  dark: boolean;
}>) {
  const [hovered, setHovered] = React.useState(false);

  if (isActive) {
    return (
      <button
        onClick={onClick}
        aria-label={tab.label}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          borderRadius: 24,
          background: dark ? '#f0f0ee' : '#111111',
          border: 'none',
          color: dark ? '#0d1f0d' : '#ffffff',
          cursor: 'pointer',
          fontFamily: 'var(--font-ui), system-ui, sans-serif',
          fontSize: 13, fontWeight: 650,
          letterSpacing: -0.2,
          whiteSpace: 'nowrap', flexShrink: 0,
          userSelect: 'none',
          transition: 'background 0.14s',
        }}
      >
        <tab.I size={15} strokeWidth={2.2} />
        {tab.label}
      </button>
    );
  }

  return (
    <button
      onClick={() => { setHovered(false); onClick(); }}
      aria-label={tab.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '9px 16px',
        borderRadius: 24,
        background: hovered ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)') : 'transparent',
        border: 'none',
        color: dark ? 'rgba(255,255,255,0.55)' : '#6b7280',
        cursor: 'pointer',
        fontFamily: 'var(--font-ui), system-ui, sans-serif',
        fontSize: 13, fontWeight: 500,
        whiteSpace: 'nowrap', flexShrink: 0,
        userSelect: 'none',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {tab.label}
    </button>
  );
}

/* ─── Botón ícono derecha ─────────────────────────────────────────────────── */
function IconBtn({
  onClick, label, children, dark, active = false,
}: Readonly<{
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  dark: boolean;
  active?: boolean;
}>) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34, height: 34, borderRadius: 10,
        background: active
          ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)')
          : hovered
            ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)')
            : 'transparent',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        color: dark ? 'rgba(255,255,255,0.6)' : '#6b7280',
        cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        transition: 'background 0.12s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Opción del selector de período ─────────────────────────────────────── */
function PeriodOption({
  label, isActive, dark, onClick,
}: Readonly<{
  label: string;
  isActive: boolean;
  dark: boolean;
  onClick: () => void;
}>) {
  const [hovered, setHovered] = React.useState(false);
  const accent   = C.success;
  const activeBg = dark ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.10)';
  const hoverBg  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  let background = 'transparent';
  if (isActive)      background = activeBg;
  else if (hovered)  background = hoverBg;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '9px 12px', borderRadius: 10, border: 'none', textAlign: 'left',
        background,
        color: isActive ? accent : (dark ? 'rgba(255,255,255,0.65)' : '#4b5563'),
        fontSize: 13, fontWeight: isActive ? 700 : 450,
        cursor: 'pointer', fontFamily: 'var(--font-ui), system-ui, sans-serif',
        whiteSpace: 'nowrap', userSelect: 'none',
        transform: hovered && !isActive ? 'translateX(3px)' : 'translateX(0)',
        transition: 'background 0.16s ease, color 0.16s ease, transform 0.16s ease',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <span style={{ flex: 1 }}>{label}</span>
      {isActive && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6 L5 9 L10 3" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

/* ─── TopBar ─────────────────────────────────────────────────────────────── */
function getInitials(user: TopBarProps['user']) {
  const source = user?.name || user?.email || 'VM';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export function TopBar({ screen = 'home', setActive, darkMode = false, onToggleDark, user = null, onLogout }: Readonly<TopBarProps>) {
  const bp = useBreakpoint();
  const isMobile  = bp === 'mobile';
  const isTablet  = bp === 'tablet';

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [scrolled, setScrolled]       = React.useState(false);
  const [period, setPeriod]         = React.useState<Period>('6months');
  const [periodExpanded, setPeriodExpanded] = React.useState(false);
  const periodRef = React.useRef<HTMLDivElement | null>(null);
  const [customStart, setCustomStart] = React.useState<Date | null>(() => new Date());
  const [customEnd,   setCustomEnd]   = React.useState<Date | null>(() => new Date());
  const [pickerOpen,  setPickerOpen]  = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement | null>(null);
  const profileRef = React.useRef<HTMLDivElement | null>(null);

  const activeLabel = NAV_TABS.find(t => t.id === screen)?.label ?? 'Dashboard';
  const ActiveIcon  = NAV_TABS.find(t => t.id === screen)?.I;

  let sidePad = 32;
  if (isMobile)      sidePad = 16;
  else if (isTablet) sidePad = 20;

  // Compensa el paddingTop del dashboard (16px) para que el aire arriba del
  // contenido (hasta la ventana) iguale al de abajo (hasta la primera card).
  const headerPadTop = isMobile ? 6 : 16;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const glassBg     = darkMode ? 'rgba(16,18,14,0.72)'      : 'rgba(229,229,231,0.70)';
  const glassBorder = darkMode ? 'rgba(255,255,255,0.08)'   : 'rgba(63,86,28,0.10)';
  const glassShadow = darkMode ? '0 4px 24px rgba(0,0,0,0.34)' : '0 4px 22px rgba(40,59,19,0.07)';

  React.useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [profileOpen]);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [pickerOpen]);

  React.useEffect(() => {
    if (!periodExpanded) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!periodRef.current?.contains(event.target as Node)) setPeriodExpanded(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [periodExpanded]);

  const today = new Date();
  const isCustomToday = customStart !== null && sameDay(customStart, today) && (!customEnd || sameDay(customEnd, today));
  const displayRange = customStart
    ? isCustomToday
      ? `Hoy · ${FMT_LONG(today)}`
      : customEnd && !sameDay(customStart, customEnd)
        ? `${FMT_SHORT(customStart)} – ${FMT_SHORT(customEnd)}`
        : FMT_SHORT(customStart)
    : period === 'today'
      ? `Hoy · ${FMT_LONG(today)}`
      : getDateRange(period);

  const initials = getInitials(user);

  return (
    <header style={{
      height: isMobile ? 56 : 68,
      background: scrolled ? glassBg : 'transparent',
      backdropFilter: scrolled ? 'blur(14px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(180%)' : 'none',
      borderBottom: `1px solid ${scrolled ? glassBorder : 'transparent'}`,
      boxShadow: scrolled ? glassShadow : 'none',
      position: 'sticky', top: 0, zIndex: 20,
      flexShrink: 0,
      transition: 'background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    }}>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', height: '100%', gap: 6,
        maxWidth: 1800, marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: sidePad, paddingRight: sidePad,
        paddingTop: headerPadTop,
        boxSizing: 'border-box',
      }}>

        {/* ── Mobile: icono + label activo ── */}
        {isMobile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {ActiveIcon && (
              <span style={{ color: C.olive, display: 'flex' }}>
                <ActiveIcon size={16} strokeWidth={2} />
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 700, color: darkMode ? '#f0f0ee' : C.text, letterSpacing: -0.5 }}>
              {activeLabel}
            </span>
          </div>
        )}

        {/* ── Logo izquierdo ── */}
        {!isMobile && (
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <MomotechLogo dark={darkMode} />
          </div>
        )}

        {/* ── Nav tabs centrados con caja (centrado absoluto respecto al header) ── */}
        {!isMobile && (
          <nav style={{
            position: 'absolute', left: '50%', top: headerPadTop, bottom: 0,
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: isTablet ? 1 : 2,
              padding: '5px 6px',
              borderRadius: 28,
              background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              {NAV_TABS.map(tab => (
                <NavTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === screen}
                  onClick={() => setActive?.(tab.id)}
                  dark={darkMode}
                />
              ))}
            </div>
          </nav>
        )}

        {/* ── Zona derecha ── */}
        <div style={{
          flex: isMobile ? '0 0 auto' : '1 1 0',
          minWidth: 0,
          display: 'flex', alignItems: 'center', gap: 6,
          justifyContent: 'flex-end',
        }}>
          {/* Selector de período — colapsa al seleccionar */}
          {!isMobile && (() => {
            const ap = PERIOD_LABELS.find(p => p.id === period)!;
            return (
              <div ref={periodRef} style={{ position: 'relative' }}>
                {/* Pill colapsado */}
                <button
                  onClick={() => setPeriodExpanded(o => !o)}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  style={{
                    padding: '7px 14px', borderRadius: 18,
                    border: '1px solid transparent', boxSizing: 'border-box',
                    background: darkMode ? '#f0f0ee' : '#111',
                    color: darkMode ? '#0d1f0d' : '#fff',
                    fontSize: 13, fontWeight: 650,
                    cursor: 'pointer', fontFamily: 'var(--font-ui), system-ui, sans-serif',
                    whiteSpace: 'nowrap', userSelect: 'none',
                    display: 'flex', alignItems: 'center', gap: 7,
                    boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.18)',
                    transition: 'filter 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease',
                  }}
                >
                  {ap.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transform: periodExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dropdown vertical con colores */}
                {periodExpanded && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 300,
                    background: darkMode ? '#1a1f1a' : '#fff',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}`,
                    borderRadius: 16,
                    boxShadow: darkMode ? '0 20px 56px rgba(0,0,0,0.55)' : '0 16px 44px rgba(0,0,0,0.13)',
                    padding: '6px', minWidth: 150,
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    {PERIOD_LABELS.map(({ id, label }) => (
                      <PeriodOption
                        key={id}
                        label={label}
                        isActive={id === period}
                        dark={darkMode}
                        onClick={() => {
                          setPeriod(id);
                          setPeriodExpanded(false);
                          if (id === 'today') {
                            const t = new Date();
                            setCustomStart(t);
                            setCustomEnd(t);
                          } else {
                            setCustomStart(null);
                            setCustomEnd(null);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Botón fecha + picker dropdown */}
          {!isMobile && (
            <div ref={pickerRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setPickerOpen(o => !o)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 18, boxSizing: 'border-box',
                  background: pickerOpen
                    ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)')
                    : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  cursor: 'pointer',
                  color: customStart ? (darkMode ? '#f0f0ee' : C.text) : (darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280'),
                  fontSize: 13, fontWeight: customStart ? 600 : 500,
                  fontFamily: 'var(--font-ui), system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.16s ease, transform 0.16s ease',
                }}
              >
                <CalendarIcon size={13} strokeWidth={1.8} />
                {displayRange}
              </button>
              {pickerOpen && (
                <DateRangePicker
                  startDate={customStart}
                  endDate={customEnd}
                  onSelect={(start, end) => {
                    setCustomStart(start);
                    setCustomEnd(end);
                    if (end && !sameDay(start, end)) setPickerOpen(false);
                  }}
                  dark={darkMode}
                />
              )}
            </div>
          )}

          {/* Ajustes */}
          <IconBtn
            onClick={() => setActive?.('notion')}
            label="Ajustes"
            dark={darkMode}
            active={screen === 'notion'}
          >
            <GearIcon size={15} strokeWidth={1.8} />
          </IconBtn>

          {/* Dark mode */}
          <IconBtn onClick={onToggleDark} label={darkMode ? 'Modo claro' : 'Modo oscuro'} dark={darkMode}>
            {darkMode
              ? <SunIcon  size={15} strokeWidth={1.8} />
              : <MoonIcon size={15} strokeWidth={1.8} />
            }
          </IconBtn>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)', flexShrink: 0, marginLeft: 2 }} />

          {/* Avatar */}
          <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Abrir menu de usuario"
              onClick={() => setProfileOpen(open => !open)}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(140deg, #374151 0%, ${C.navbar} 100%)`,
                display: 'grid', placeItems: 'center',
                color: '#fff', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.4,
                fontFamily: 'var(--font-ui), system-ui, sans-serif',
                boxShadow: `0 0 0 2px ${darkMode ? 'rgba(12,14,18,1)' : 'rgba(255,255,255,1)'}, 0 0 0 3px rgba(17,24,39,0.12)`,
                userSelect: 'none', cursor: 'pointer',
                border: 'none', padding: 0, flexShrink: 0,
              }}
            >
              {initials}
            </button>

            {profileOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute', right: 0, top: 44,
                  width: 220, zIndex: 100,
                  background: darkMode ? '#1a1f1a' : C.card,
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : C.border}`,
                  borderRadius: 12,
                  boxShadow: '0 18px 55px rgba(20,24,18,0.18)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#f0f0ee' : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Usuario'}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMute, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || 'Sesión activa'}
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); onLogout?.(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 14px', border: 'none',
                    background: 'transparent', color: C.neg,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui), system-ui, sans-serif',
                    fontSize: 13, fontWeight: 600, textAlign: 'left',
                  }}
                >
                  <TrashIcon size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
