'use client';

import Image from 'next/image';
import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { IntiDashWordmark } from '@/components/brand/IntiDashLogo';
import { useBreakpoint } from '@/lib/breakpoints';
import type { AuthUser } from '@/shared/services/auth.service';
import { notionPaymentsService, NOTION_SYNC_ENDPOINTS } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { getActiveWorkspace } from '@/shared/services/workspace.service';
import { DASHBOARD_NAV_ITEMS, getDashboardNavItem, type DashboardNavItem, type ScreenId } from './navigation';
import { WorkspaceSelector } from './WorkspaceSelector';
import { NotificationBell } from './NotificationBell';

const lsSyncKey = () => `notion_last_sync_${getActiveWorkspace() ?? 'default'}`;

const GearIcon     = Icon.gear;
const MoonIcon     = Icon.moon;
const SunIcon      = Icon.sun;
const TrashIcon    = Icon.trash;

function MomotechLogo({ dark = false }: Readonly<{ dark?: boolean }>) {
  return <IntiDashWordmark dark={dark} size={28} />;
}


interface TopBarProps {
  screen?: ScreenId;
  setActive?: (id: ScreenId) => void;
  onNavigateToNotionSync?: () => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  canWrite?: boolean;
}

/* Nav tab estilo Vectra */
function NavTab({
  tab, isActive, onClick, dark,
}: Readonly<{
  tab: DashboardNavItem;
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
          background: dark ? '#f0f0ee' : '#111827',
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

/* Boton icono derecha */
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

/* Opcion del selector de periodo */
function getInitials(user: TopBarProps['user']) {
  const source = user?.name || user?.email || 'VM';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export function TopBar({ screen = 'home', setActive, onNavigateToNotionSync, darkMode = false, onToggleDark, user = null, onLogout, canWrite = true }: Readonly<TopBarProps>) {
  const bp = useBreakpoint();
  const isMobile  = bp === 'mobile';
  const isTablet  = bp === 'tablet';

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [scrolled, setScrolled]       = React.useState(false);
  const [syncLabel,   setSyncLabel]   = React.useState<string | null>(null);
  const [syncing,     setSyncing]     = React.useState(false);
  const [syncHovered, setSyncHovered] = React.useState(false);
  const [syncDone,    setSyncDone]    = React.useState(0);
  const [hasConfig,   setHasConfig]   = React.useState(false);
  const [hasToken,    setHasToken]    = React.useState(false);
  const [exportHovered, setExportHovered] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    notionPaymentsService.getConfig()
      .then((d: { notionTokenMasked?: string | null; isConfigured?: boolean } | null) => {
        setHasToken(Boolean(d?.notionTokenMasked));
        setHasConfig(Boolean(d?.isConfigured));
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    function update() {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(lsSyncKey()) : null;
      if (!raw) { setSyncLabel(null); return; }
      const mins = Math.floor((Date.now() - new Date(raw).getTime()) / 60000);
      if (mins < 1)        setSyncLabel('Sync · ahora');
      else if (mins < 60)  setSyncLabel(`Sync · ${mins}m`);
      else                 setSyncLabel(`Sync · ${Math.floor(mins / 60)}h`);
    }
    update();
    const id = setInterval(update, 60000);
    window.addEventListener('storage', update);
    return () => { clearInterval(id); window.removeEventListener('storage', update); };
  }, []);

  async function handleHeaderSync() {
    if (syncing || !hasConfig || !canWrite) return;
    setSyncing(true); setSyncDone(0);
    let ok = 0;
    await Promise.allSettled(
      NOTION_SYNC_ENDPOINTS.map(ep =>
        notionPaymentsService.sync(ep).then(() => { ok++; setSyncDone(ok); }).catch(() => {})
      )
    );
    if (ok > 0) {
      const now = new Date().toISOString();
      localStorage.setItem(lsSyncKey(), now);
      setSyncLabel('Sync · ahora');
      dispatchDataSynced();
    }
    setSyncing(false);
  }

  async function handleExportSpreadsheet() {
    if (exporting) return;
    setExporting(true);
    try {
      const { blob, filename } = await notionPaymentsService.downloadFinanceExport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo descargar la hoja de calculo.');
    } finally {
      setExporting(false);
    }
  }
  const profileRef = React.useRef<HTMLDivElement | null>(null);

  const activeItem = getDashboardNavItem(screen);
  const activeLabel = activeItem.label;
  const ActiveIcon  = activeItem.I;

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

  const glassBg     = darkMode ? 'rgba(18,20,26,0.82)'      : 'rgba(245,245,247,0.75)';
  const glassBorder = darkMode ? 'rgba(255,255,255,0.08)'   : 'rgba(17,24,39,0.08)';
  const glassShadow = darkMode ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 22px rgba(17,24,39,0.06)';
  // En dark mode el header siempre tiene fondo (no transparente) para que sea visible sobre el fondo oscuro
  const headerBgBase = darkMode ? 'rgba(18,20,26,0.95)' : 'transparent';

  React.useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [profileOpen]);

  const initials = getInitials(user);

  return (
    <header style={{
      height: isMobile ? 56 : 68,
      background: scrolled ? glassBg : headerBgBase,
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

        {/* Mobile: icono y label activo */}
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

        {/* Logo izquierdo y selector de workspace */}
        {!isMobile && (
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 24 }}>
            <button
              type="button"
              onClick={() => setActive?.('home')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Ir al dashboard"
            >
              <MomotechLogo dark={darkMode} />
            </button>
            <WorkspaceSelector darkMode={darkMode} user={user} />
          </div>
        )}

        {/* Nav tabs centrados */}
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
              {DASHBOARD_NAV_ITEMS.map(tab => (
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

        {/* Zona derecha */}
        <div style={{
          flex: isMobile ? '0 0 auto' : '1 1 0',
          minWidth: 0,
          display: 'flex', alignItems: 'center', gap: 6,
          justifyContent: 'flex-end',
        }}>


          {/* Notion — siempre visible en desktop */}
          {!isMobile && (
            <button
              onClick={() => hasToken && hasConfig ? handleHeaderSync() : (onNavigateToNotionSync ? onNavigateToNotionSync() : setActive?.('notion'))}
              onMouseEnter={() => setSyncHovered(true)}
              onMouseLeave={() => setSyncHovered(false)}
              disabled={syncing}
              title={!hasToken ? 'Conectar Notion' : !hasConfig ? 'Configurar tablas de Notion' : 'Sincronizar Notion'}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                height: 34, padding: '0 10px 0 8px', borderRadius: 10, flexShrink: 0,
                background: syncHovered
                  ? (darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.07)')
                  : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.04)'),
                border: `1px solid ${!hasToken ? 'rgba(220,38,38,0.30)' : darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}`,
                cursor: syncing ? 'default' : 'pointer',
                transform: syncHovered && !syncing ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: syncHovered && !syncing ? (darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(17,24,39,0.08)') : 'none',
                transition: 'background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease',
              }}
            >
              <Image
                src="/Notion.png"
                alt="Notion"
                width={18}
                height={18}
                style={{
                  flexShrink: 0, borderRadius: 4, display: 'block', objectFit: 'contain',
                  animation: !hasToken ? 'notionBounce 1.2s ease-in-out infinite' : 'none',
                }}
              />
              <span style={{
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                color: !hasToken
                  ? '#dc2626'
                  : syncing
                    ? '#F59E0B'
                    : (darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(17,24,39,0.50)'),
                fontFamily: 'var(--font-ui)',
              }}>
                {!hasToken
                  ? 'No conectado'
                  : syncing
                    ? `${syncDone}/${NOTION_SYNC_ENDPOINTS.length}`
                    : syncLabel ?? 'Notion'}
              </span>
              {syncing && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: '#F59E0B', animation: 'skeletonPulse 1s ease-in-out infinite' }} />
              )}
            </button>
          )}

          {!isMobile && (
            <button
              onClick={handleExportSpreadsheet}
              onMouseEnter={() => setExportHovered(true)}
              onMouseLeave={() => setExportHovered(false)}
              disabled={exporting}
              title={exporting ? 'Generando Excel...' : 'Descargar hoja de calculo'}
              aria-label="Descargar hoja de calculo"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 34, padding: '0 9px 0 8px', borderRadius: 10, flexShrink: 0,
                background: exportHovered
                  ? (darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.07)')
                  : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.04)'),
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}`,
                cursor: exporting ? 'default' : 'pointer',
                transform: exportHovered && !exporting ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: exportHovered && !exporting ? (darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(17,24,39,0.08)') : 'none',
                transition: 'background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease',
              }}
            >
              <Image
                src="/hoja_calculo.png"
                alt=""
                width={18}
                height={18}
                style={{ flexShrink: 0, borderRadius: 4, display: 'block', objectFit: 'contain' }}
              />
              <Icon.download
                size={13}
                strokeWidth={2.1}
                style={{
                  color: exporting
                    ? '#F59E0B'
                    : (darkMode ? 'rgba(255,255,255,0.58)' : 'rgba(17,24,39,0.58)'),
                }}
              />
            </button>
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

          {/* Notificaciones (invitaciones a workspaces) */}
          {!isMobile && <NotificationBell dark={darkMode} />}

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
                  background: darkMode ? '#1A1D21' : '#FFFFFF',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.12)'}`,
                  borderRadius: 12,
                  boxShadow: darkMode ? '0 18px 55px rgba(0,0,0,0.50)' : '0 18px 55px rgba(17,24,39,0.14)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)'}` }}>
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


