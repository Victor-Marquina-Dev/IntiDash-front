'use client';

import React from 'react';
import { workspaceService, setActiveWorkspace, type PendingInvite, type VisibilityMode } from '@/shared/services/workspace.service';

// Descripción de visibilidad desde la perspectiva del invitado
const VISIBILITY_INFO: Record<VisibilityMode, { label: string; desc: string; color: string; bg: string }> = {
  mutual: {
    label: 'Acceso mutuo',
    desc:  'Ambos podréis ver los datos del espacio.',
    color: '#166534',
    bg:    'rgba(134,239,172,0.15)',
  },
  owner_reads: {
    label: 'Solo el dueño lee',
    desc:  'El dueño ve tus datos pero tú no verás los suyos.',
    color: '#1e40af',
    bg:    'rgba(147,197,253,0.18)',
  },
  admin_only: {
    label: 'Solo admin',
    desc:  'El dueño gestiona todo. Sin acceso de lectura para ti.',
    color: '#92400e',
    bg:    'rgba(252,211,77,0.18)',
  },
};

export function NotificationBell({ dark }: Readonly<{ dark: boolean }>) {
  const [invites,   setInvites]   = React.useState<PendingInvite[]>([]);
  const [open,      setOpen]      = React.useState(false);
  const [busy,      setBusy]      = React.useState<string | null>(null);
  const [shareBack, setShareBack] = React.useState<Record<string, boolean>>({});
  const ref = React.useRef<HTMLDivElement | null>(null);

  const load = React.useCallback(() => {
    workspaceService.myInvites().then(setInvites).catch(() => {});
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  async function accept(inv: PendingInvite) {
    setBusy(inv.token);
    try {
      await workspaceService.acceptInvite(inv.token, shareBack[inv.token] ?? false);
      setActiveWorkspace(inv.workspaceId);
      window.location.reload();
    } catch { setBusy(null); }
  }

  async function reject(inv: PendingInvite) {
    setBusy(inv.token);
    try {
      await workspaceService.rejectInvite(inv.token);
      setInvites(prev => prev.filter(i => i.token !== inv.token));
    } catch { /* noop */ }
    finally { setBusy(null); }
  }

  const count    = invites.length;
  const panelBg  = dark ? '#1A1D21' : '#FFFFFF';
  const panelBrd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)';
  const fg       = dark ? 'rgba(255,255,255,0.88)' : '#111827';
  const subC     = dark ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const iconC    = dark ? 'rgba(255,255,255,0.6)'  : '#6b7280';
  const [hovered, setHovered] = React.useState(false);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* ── Botón campana ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Notificaciones"
        title="Notificaciones"
        style={{
          width: 34, height: 34, borderRadius: 10, position: 'relative',
          background: (open || hovered) ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)') : 'transparent',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          color: iconC, cursor: 'pointer', display: 'grid', placeItems: 'center',
          transition: 'background 0.12s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8,
            background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 800,
            display: 'grid', placeItems: 'center', fontFamily: 'var(--font-ui)',
            border: `2px solid ${dark ? '#12141A' : '#fff'}`,
          }}>
            {count}
          </span>
        )}
      </button>

      {/* ── Panel de notificaciones ────────────────────────────────────── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 300,
          width: 380, background: panelBg, border: `1px solid ${panelBrd}`, borderRadius: 16,
          boxShadow: dark ? '0 20px 56px rgba(0,0,0,0.55)' : '0 16px 44px rgba(17,24,39,0.14)',
          overflow: 'hidden', fontFamily: 'var(--font-ui)',
        }}>
          {/* Cabecera */}
          <div style={{
            padding: '13px 16px', borderBottom: `1px solid ${panelBrd}`,
            fontSize: 11, fontWeight: 900, color: fg,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Notificaciones
          </div>

          {count === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12.5, color: subC }}>
              No tienes invitaciones pendientes.
            </div>
          ) : (
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {invites.map(inv => {
                const vm   = (inv.visibilityMode ?? 'mutual') as VisibilityMode;
                const info = VISIBILITY_INFO[vm];
                const isB  = busy === inv.token;
                const sb   = shareBack[inv.token] ?? false;

                return (
                  <div key={inv.token} style={{
                    padding: '16px', borderBottom: `1px solid ${panelBrd}`,
                    display: 'grid', gap: 12,
                  }}>
                    {/* Workspace + invitador */}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: fg, marginBottom: 3 }}>
                        {inv.workspaceName}
                      </div>
                      {inv.invitedByName && (
                        <div style={{ fontSize: 11.5, color: subC }}>
                          Invitado por <strong style={{ color: fg }}>{inv.invitedByName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Badge visibilidad */}
                    <div style={{
                      padding: '10px 12px', borderRadius: 10,
                      background: info.bg,
                      border: `1px solid ${info.color}25`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: info.color, marginBottom: 3 }}>
                        {info.label}
                      </div>
                      <div style={{ fontSize: 11, color: info.color, opacity: 0.8, lineHeight: 1.4 }}>
                        {info.desc}
                      </div>
                    </div>

                    {/* Toggle: compartir mi espacio de vuelta */}
                    <button
                      type="button"
                      onClick={() => setShareBack(prev => ({ ...prev, [inv.token]: !sb }))}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 12px', borderRadius: 10,
                        border: `1.5px solid ${sb ? '#6366f1' : panelBrd}`,
                        background: sb ? 'rgba(99,102,241,0.08)' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Checkbox visual */}
                      <span style={{
                        flexShrink: 0,
                        width: 18, height: 18, borderRadius: 5, marginTop: 1,
                        border: `2px solid ${sb ? '#6366f1' : '#d1d5db'}`,
                        background: sb ? '#6366f1' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {sb && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: sb ? '#6366f1' : fg, lineHeight: 1.3 }}>
                          También permitir que{inv.invitedByName ? ` ${inv.invitedByName}` : ' el dueño'} vea mi espacio
                        </div>
                        <div style={{ fontSize: 10.5, color: subC, marginTop: 3, lineHeight: 1.4 }}>
                          Se enviará una invitación a tu espacio personal. Recibirá acceso de lectura.
                        </div>
                      </div>
                    </button>

                    {/* Botones aceptar/rechazar */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => accept(inv)}
                        disabled={isB}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                          cursor: isB ? 'default' : 'pointer',
                          background: isB ? '#d1d5db' : '#16a34a',
                          color: '#fff', fontSize: 12.5, fontWeight: 700,
                          fontFamily: 'var(--font-ui)',
                          transition: 'background 0.15s',
                        }}
                      >
                        {isB ? '…' : 'Aceptar'}
                      </button>
                      <button
                        onClick={() => reject(inv)}
                        disabled={isB}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 9,
                          cursor: isB ? 'default' : 'pointer',
                          background: 'transparent', color: subC,
                          border: `1px solid ${panelBrd}`,
                          fontSize: 12.5, fontWeight: 500,
                          fontFamily: 'var(--font-ui)',
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
