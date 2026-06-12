'use client';

import React from 'react';
import { useWorkspaces } from '@/shared/hooks/use-workspaces';
import type { AuthUser } from '@/shared/services/auth.service';

const ROLE_LABEL: Record<string, string> = { owner: 'Dueño', editor: 'Editor', viewer: 'Lectura' };

function firstName(user: AuthUser | null | undefined): string {
  if (!user) return '';
  const src = user.name || user.email || '';
  return src.split(/[\s@._-]+/)[0] ?? '';
}

export function WorkspaceSelector({ darkMode, user }: Readonly<{ darkMode: boolean; user?: AuthUser | null }>) {
  const ws = useWorkspaces(true);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  if (ws.loading || ws.list.length === 0) return null;

  const active = ws.active;
  const fg     = darkMode ? 'rgba(255,255,255,0.85)' : '#111827';
  const subC   = darkMode ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const panelBg = darkMode ? '#1A1D21' : '#FFFFFF';
  const panelBrd = darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)';

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Cambiar espacio de trabajo"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 34, padding: '0 12px', borderRadius: 10,
          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.05)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.08)'}`,
          cursor: 'pointer', fontFamily: 'var(--font-ui)',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8FA88F', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: fg, whiteSpace: 'nowrap', lineHeight: 1 }}>
          Espacio de {firstName(user)}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 3.5 L5 6.5 L8 3.5" stroke={subC} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300,
          minWidth: 240, background: panelBg,
          border: `1px solid ${panelBrd}`, borderRadius: 14,
          boxShadow: darkMode ? '0 20px 56px rgba(0,0,0,0.55)' : '0 16px 44px rgba(17,24,39,0.13)',
          padding: 6, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: subC, textTransform: 'uppercase', letterSpacing: 0.8, padding: '6px 10px 4px' }}>
            Espacios de trabajo
          </div>
          {ws.list.filter(w => !((w.memberCount ?? 1) <= 1 && (w.pendingInvites ?? 0) > 0)).map(w => {
            const isActive = w.id === ws.activeId;
            return (
              <button
                key={w.id}
                onClick={() => { setOpen(false); ws.switchTo(w.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                  padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: isActive ? (darkMode ? 'rgba(143,168,143,0.16)' : 'rgba(143,168,143,0.14)') : 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#8FA88F' : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(17,24,39,0.2)'), flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#8FA88F' : fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Espacio de {firstName(user)}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: subC }}>{ROLE_LABEL[w.role] ?? w.role}</span>
                </span>
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6 L5 9 L10 3" stroke="#8FA88F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
