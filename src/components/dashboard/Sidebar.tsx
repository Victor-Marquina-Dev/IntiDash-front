'use client';

import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';

export type ScreenId = 'home' | 'tx' | 'cards' | 'goals' | 'charts' | 'debts' | 'notion';

const GearIcon      = Icon.gear;
const PanelLeftIcon = Icon.panelLeft;

interface SidebarProps {
  active: ScreenId;
  setActive: (id: ScreenId) => void;
  expanded: boolean;
  setExpanded: (fn: (prev: boolean) => boolean) => void;
  mobile?: boolean;
  mobileOpen?: boolean;
}

const NAV: { id: ScreenId; label: string; I: (typeof Icon)[keyof typeof Icon] }[] = [
  { id: 'home',   label: 'Dashboard',      I: Icon.home },
  { id: 'cards',  label: 'Cuentas',        I: Icon.wallet },
  { id: 'tx',     label: 'Transacciones',  I: Icon.list },
  { id: 'charts', label: 'Análisis',       I: Icon.chart },
  { id: 'goals',  label: 'Objetivos',      I: Icon.target },
  { id: 'debts',  label: 'Deudas',         I: Icon.cards },
];

export function Sidebar({ active, setActive, expanded, setExpanded, mobile = false, mobileOpen = false }: Readonly<SidebarProps>) {
  const show = mobile ? true : expanded;
  const w = show ? 220 : 68;

  return (
    <aside style={{
      width: mobile ? 220 : w,
      flexShrink: 0,
      background: C.navbar,
      borderRight: `1px solid ${C.navbarBorder}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: 4,
      ...(mobile ? {
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 100,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
        boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
      } : {
        transition: 'width .25s cubic-bezier(.2,.8,.2,1)',
      }),
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: show ? '6px 8px 14px' : '6px 0 14px',
        justifyContent: show ? 'flex-start' : 'center',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #A8C066 0%, #6B8A30 100%)',
          display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 800, fontSize: 17,
          letterSpacing: -1, flexShrink: 0,
          boxShadow: '0 6px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22)',
        }}>F</div>
        {show && (
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>Florín</div>
            <div style={{ fontSize: 10.5, color: C.navbarTextDim, letterSpacing: 0.2, marginTop: 1 }}>finanzas personal</div>
          </div>
        )}
      </div>

      {/* User card */}
      {show && (
        <div style={{
          margin: '0 0 12px',
          padding: '10px 12px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.22)',
          border: `1px solid ${C.navbarBorder}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #B8CC78 0%, #8CA05A 100%)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
            letterSpacing: -0.3, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
          }}>VM</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>Victor Marquina</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#8ECC5C',
                boxShadow: '0 0 0 2px rgba(142,204,92,0.3)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 10.5, color: C.navbarTextDim, letterSpacing: 0.1 }}>Personal</span>
            </div>
          </div>
        </div>
      )}

      {/* Separador */}
      <div style={{ height: 1, background: C.navbarBorder, margin: '0 4px 10px' }} />

      {NAV.map(n => {
        const isActive = n.id === active;
        return (
          <button key={n.id}
            onClick={() => setActive(n.id)}
            className="fz-nav"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: show ? '10px 12px' : '10px',
              background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: isActive ? '#fff' : C.navbarText,
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'Inter', fontSize: 13, fontWeight: isActive ? 600 : 500,
              justifyContent: show ? 'flex-start' : 'center',
              transition: 'all .15s',
              position: 'relative',
            }}>
            {isActive && (
              <span style={{
                position: 'absolute', left: -12, top: '50%',
                transform: 'translateY(-50%)',
                width: 3, height: 18,
                background: C.olive, borderRadius: '0 2px 2px 0',
              }} />
            )}
            <n.I size={18} />
            {show && <span>{n.label}</span>}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        onClick={() => setActive('notion')}
        className="fz-nav"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: show ? '10px 12px' : '10px',
          background: active === 'notion' ? 'rgba(255,255,255,0.10)' : 'transparent',
          color: active === 'notion' ? '#fff' : C.navbarText,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'Inter', fontSize: 13, fontWeight: active === 'notion' ? 600 : 500,
          justifyContent: show ? 'flex-start' : 'center',
          position: 'relative',
        }}>
        {active === 'notion' && (
          <span style={{
            position: 'absolute', left: -12, top: '50%',
            transform: 'translateY(-50%)',
            width: 3, height: 18,
            background: C.olive, borderRadius: '0 2px 2px 0',
          }} />
        )}
        <GearIcon size={18} />
        {show && <span>Ajustes</span>}
      </button>

      {!mobile && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="fz-nav" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: show ? '10px 12px' : '10px',
            background: 'transparent', color: C.navbarTextDim,
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'Inter', fontSize: 12,
            justifyContent: show ? 'flex-start' : 'center',
          }}>
          <PanelLeftIcon size={16} />
          {show && <span>Colapsar</span>}
        </button>
      )}
    </aside>
  );
}
