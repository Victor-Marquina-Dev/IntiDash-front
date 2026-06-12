'use client';

import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { DASHBOARD_NAV_ITEMS, SETTINGS_NAV_ITEM, type ScreenId } from './navigation';
import { IntiDashIcon } from '@/components/brand/IntiDashLogo';

const PanelLeftIcon = Icon.panelLeft;

interface SidebarProps {
  active: ScreenId;
  setActive: (id: ScreenId) => void;
  expanded: boolean;
  setExpanded: (fn: (prev: boolean) => boolean) => void;
  mobile?: boolean;
  mobileOpen?: boolean;
}

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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: show ? '6px 8px 14px' : '6px 0 14px',
        justifyContent: show ? 'flex-start' : 'center',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(143,168,143,0.15)',
          display: 'grid', placeItems: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(143,168,143,0.25)',
        }}>
          <IntiDashIcon size={24} variant="white" />
        </div>
        {show && (
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'inline-flex', letterSpacing: '0.18em', lineHeight: 1, userSelect: 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>INTI</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#fff', fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>DASH</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.navbarTextDim, letterSpacing: 0.2, marginTop: 3 }}>finanzas personal</div>
          </div>
        )}
      </div>

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

      <div style={{ height: 1, background: C.navbarBorder, margin: '0 4px 10px' }} />

      {DASHBOARD_NAV_ITEMS.map(n => {
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
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: isActive ? 600 : 500,
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
        onClick={() => setActive(SETTINGS_NAV_ITEM.id)}
        className="fz-nav"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: show ? '10px 12px' : '10px',
          background: active === SETTINGS_NAV_ITEM.id ? 'rgba(255,255,255,0.10)' : 'transparent',
          color: active === SETTINGS_NAV_ITEM.id ? '#fff' : C.navbarText,
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active === SETTINGS_NAV_ITEM.id ? 600 : 500,
          justifyContent: show ? 'flex-start' : 'center',
          position: 'relative',
        }}>
        {active === SETTINGS_NAV_ITEM.id && (
          <span style={{
            position: 'absolute', left: -12, top: '50%',
            transform: 'translateY(-50%)',
            width: 3, height: 18,
            background: C.olive, borderRadius: '0 2px 2px 0',
          }} />
        )}
        <SETTINGS_NAV_ITEM.I size={18} />
        {show && <span>{SETTINGS_NAV_ITEM.label}</span>}
      </button>

      {!mobile && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="fz-nav" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: show ? '10px 12px' : '10px',
            background: 'transparent', color: C.navbarTextDim,
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: 12,
            justifyContent: show ? 'flex-start' : 'center',
          }}>
          <PanelLeftIcon size={16} />
          {show && <span>Colapsar</span>}
        </button>
      )}
    </aside>
  );
}
