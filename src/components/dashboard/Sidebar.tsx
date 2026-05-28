'use client';

import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';

export type ScreenId = 'home' | 'tx' | 'cards' | 'goals' | 'charts' | 'debts' | 'notion';

const GearIcon     = Icon.gear;
const PanelLeftIcon = Icon.panelLeft;

interface SidebarProps {
  active: ScreenId;
  setActive: (id: ScreenId) => void;
  expanded: boolean;
  setExpanded: (fn: (prev: boolean) => boolean) => void;
}

const NAV: { id: ScreenId; label: string; I: (typeof Icon)[keyof typeof Icon] }[] = [
  { id: 'home',   label: 'Dashboard',      I: Icon.home },
  { id: 'cards',  label: 'Cuentas',        I: Icon.wallet },
  { id: 'tx',     label: 'Transacciones',  I: Icon.list },
  { id: 'charts', label: 'Análisis',       I: Icon.chart },
  { id: 'goals',  label: 'Objetivos',      I: Icon.target },
  { id: 'debts',  label: 'Deudas',         I: Icon.cards },
];

export function Sidebar({ active, setActive, expanded, setExpanded }: Readonly<SidebarProps>) {
  const w = expanded ? 220 : 68;
  return (
    <aside style={{
      width: w, flexShrink: 0,
      background: C.navbar,
      borderRight: `1px solid ${C.navbarBorder}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      transition: 'width .25s cubic-bezier(.2,.8,.2,1)',
      gap: 4,
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 6px 18px', borderBottom: `1px solid ${C.navbarBorder}`,
        marginBottom: 8,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: C.olive,
          display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 700, fontSize: 15,
          letterSpacing: -0.5, flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        }}>F</div>
        {expanded && (
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Florín</div>
            <div style={{ fontSize: 11, color: C.navbarTextDim }}>Victor Marquina</div>
          </div>
        )}
      </div>

      {NAV.map(n => {
        const isActive = n.id === active;
        return (
          <button key={n.id}
            onClick={() => setActive(n.id)}
            className="fz-nav"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: expanded ? '10px 12px' : '10px',
              background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: isActive ? '#fff' : C.navbarText,
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'Inter', fontSize: 13, fontWeight: isActive ? 600 : 500,
              justifyContent: expanded ? 'flex-start' : 'center',
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
            {expanded && <span>{n.label}</span>}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        onClick={() => setActive('notion')}
        className="fz-nav"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: expanded ? '10px 12px' : '10px',
          background: active === 'notion' ? 'rgba(255,255,255,0.10)' : 'transparent',
          color: active === 'notion' ? '#fff' : C.navbarText,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'Inter', fontSize: 13, fontWeight: active === 'notion' ? 600 : 500,
          justifyContent: expanded ? 'flex-start' : 'center',
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
        {expanded && <span>Ajustes</span>}
      </button>

      <button
        onClick={() => setExpanded(e => !e)}
        className="fz-nav" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: expanded ? '10px 12px' : '10px',
          background: 'transparent', color: C.navbarTextDim,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'Inter', fontSize: 12,
          justifyContent: expanded ? 'flex-start' : 'center',
        }}>
        <PanelLeftIcon size={16} />
        {expanded && <span>Colapsar</span>}
      </button>
    </aside>
  );
}
