'use client';

import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import { ScreenId } from './Sidebar';
import { useBreakpoint } from '@/lib/breakpoints';

const PanelLeftIcon = Icon.panelLeft;
const SearchIcon    = Icon.search;
const CalendarIcon  = Icon.calendar;
const ChevronIcon   = Icon.chevron;
const BellIcon      = Icon.bell;
const PlusIcon      = Icon.plus;

interface TopBarProps {
  screen?: ScreenId;
  onToggleSidebar?: () => void;
}

const TITLES: Record<ScreenId, { t: string; s: string }> = {
  home:   { t: 'Buenos días, Victor',  s: 'Martes, 18 de noviembre · esto pasó en tus finanzas' },
  tx:     { t: 'Transacciones',        s: '24 movimientos este mes · sincronizadas hace 5 min' },
  cards:  { t: 'Cuentas',              s: '3 cuentas activas · 1 tarjeta de crédito' },
  goals:  { t: 'Objetivos',            s: '3 activas · 2 completadas este año' },
  charts: { t: 'Análisis',             s: 'Inteligencia sobre tus finanzas' },
  debts:  { t: 'Deudas',               s: '2 activas · próximo pago en 9 días' },
  notion: { t: 'Ajustes',              s: 'Configuración de Notion y sincronización' },
};

const iconBtn: React.CSSProperties = {
  position: 'relative',
  width: 36, height: 36, borderRadius: 10,
  background: 'rgba(63,86,28,0.04)',
  border: `1px solid ${C.border}`,
  color: C.textDim, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
};

export function TopBar({ screen = 'home', onToggleSidebar }: Readonly<TopBarProps>) {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';
  const tt = TITLES[screen] ?? TITLES.home;

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
      padding: isMobile ? '14px 16px' : '18px 28px',
      borderBottom: `1px solid ${C.border}`,
      background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {onToggleSidebar && (
        <button onClick={onToggleSidebar} className="fz-icon-btn" aria-label="Alternar barra lateral" style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'transparent', border: '1px solid transparent',
          color: C.textDim, cursor: 'pointer',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <PanelLeftIcon size={17} />
        </button>
      )}

      <div style={{ flex: isMobile ? 1 : undefined, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 600, letterSpacing: -0.4, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tt.t}
        </div>
        {!isMobile && (
          <div style={{ fontSize: 12.5, color: C.textMute, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: C.pos }} />
            {tt.s}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {isDesktop && (
        <div className="fz-search" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 10,
          background: 'rgba(63,86,28,0.04)', border: `1px solid ${C.border}`,
          minWidth: 240, color: C.textDim, fontSize: 13,
        }}>
          <SearchIcon size={15} />
          <span style={{ flex: 1 }}>Buscar transacciones…</span>
          <kbd style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            border: `1px solid ${C.border}`, background: '#fff',
            fontFamily: 'Inter', color: C.textDim,
          }}>⌘K</kbd>
        </div>
      )}

      {isDesktop && (
        <Button icon={<CalendarIcon size={14} />}>
          Últimos 30 días
          <ChevronIcon size={14} style={{ marginLeft: 2, opacity: 0.6 }} />
        </Button>
      )}

      {!isMobile && (
        <button className="fz-icon-btn" style={iconBtn}>
          <BellIcon size={17} />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%', background: C.olive,
            border: '2px solid #fff',
          }} />
        </button>
      )}

      {isDesktop && <Button primary icon={<PlusIcon size={14} />}>Nueva transacción</Button>}

      {isMobile && (
        <button className="fz-icon-btn" style={iconBtn}>
          <PlusIcon size={16} />
        </button>
      )}

      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: C.olive, display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 600, fontSize: 13,
        marginLeft: 4, border: `1.5px solid ${C.border}`,
        flexShrink: 0,
      }}>VM</div>
    </header>
  );
}
