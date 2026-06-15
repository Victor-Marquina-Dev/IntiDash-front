'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { IntiDashIcon } from '@/components/brand/IntiDashLogo';
import { DASHBOARD_NAV_ITEMS, SETTINGS_NAV_ITEM, type ScreenId } from './navigation';

const XIcon = Icon.x;

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
  userName?: string | null;
  userEmail?: string | null;
  initials: string;
}

function NavRow({
  item, isActive, onClick,
}: Readonly<{
  item: { id: ScreenId; label: string; I: (typeof Icon)[keyof typeof Icon] };
  isActive: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '13px 14px',
        background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
        color: isActive ? '#fff' : C.navbarText,
        border: 'none', borderRadius: 12, cursor: 'pointer',
        fontFamily: 'var(--font-ui), system-ui, sans-serif',
        fontSize: 15, fontWeight: isActive ? 650 : 500,
        letterSpacing: -0.2, textAlign: 'left',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isActive && (
        <span style={{
          position: 'absolute', left: -14, top: '50%',
          transform: 'translateY(-50%)',
          width: 3, height: 20,
          background: C.olive, borderRadius: '0 2px 2px 0',
        }} />
      )}
      <item.I size={20} strokeWidth={2} />
      <span>{item.label}</span>
    </button>
  );
}

export function MobileNavDrawer({
  open, onClose, active, onSelect, userName, userEmail, initials,
}: Readonly<MobileNavDrawerProps>) {
  // Cierre con Escape y bloqueo de scroll del fondo mientras está abierto.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const handleSelect = (id: ScreenId) => {
    onSelect(id);
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex',
        background: 'rgba(8,10,14,0.55)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        animation: 'fzOverlayIn 0.25s ease both',
      }}
    >
      {/* Backdrop interactivo: cierra al tocar fuera del panel */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        tabIndex={-1}
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'default', WebkitTapHighlightColor: 'transparent',
        }}
      />
      <aside
        aria-label="Menú de navegación"
        style={{
          position: 'relative', zIndex: 1,
          width: 'min(82vw, 300px)',
          height: '100%',
          background: C.navbar,
          borderRight: `1px solid ${C.navbarBorder}`,
          display: 'flex', flexDirection: 'column',
          padding: '16px 14px calc(16px + env(safe-area-inset-bottom))',
          boxShadow: '4px 0 32px rgba(0,0,0,0.35)',
          animation: 'fzDrawerIn 0.26s cubic-bezier(.2,.8,.2,1) both',
          boxSizing: 'border-box',
        }}
      >
        {/* Cabecera: logo + cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 14px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(143,168,143,0.15)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            border: '1px solid rgba(143,168,143,0.25)',
          }}>
            <IntiDashIcon size={24} variant="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', letterSpacing: '0.18em', lineHeight: 1, userSelect: 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>INTI</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#fff' }}>DASH</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.navbarTextDim, letterSpacing: 0.2, marginTop: 3 }}>finanzas personal</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.navbarBorder}`,
              color: C.navbarText, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <XIcon size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Perfil del usuario (datos reales) */}
        <div style={{
          margin: '0 0 12px',
          padding: '10px 12px', borderRadius: 12,
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
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Usuario'}
            </div>
            <div style={{ fontSize: 10.5, color: C.navbarTextDim, letterSpacing: 0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail || 'Sesión activa'}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.navbarBorder, margin: '0 4px 10px' }} />

        {/* Navegación principal */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', flex: 1 }}>
          {DASHBOARD_NAV_ITEMS.map(item => (
            <NavRow
              key={item.id}
              item={item}
              isActive={item.id === active}
              onClick={() => handleSelect(item.id)}
            />
          ))}
        </nav>

        <div style={{ height: 1, background: C.navbarBorder, margin: '10px 4px' }} />

        <NavRow
          item={SETTINGS_NAV_ITEM}
          isActive={SETTINGS_NAV_ITEM.id === active}
          onClick={() => handleSelect(SETTINGS_NAV_ITEM.id)}
        />
      </aside>
    </div>,
    document.body,
  );
}
