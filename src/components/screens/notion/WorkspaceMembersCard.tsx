'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui';
import { useWorkspaces } from '@/shared/hooks/use-workspaces';
import {
  workspaceService,
  type WorkspaceMember,
  type WorkspaceInvite,
  type WorkspaceRole,
  type VisibilityMode,
  VISIBILITY_LABELS,
} from '@/shared/services/workspace.service';

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner:  'Admin',
  editor: 'Editor',
  viewer: 'Lectura',
};

const VISIBILITY_SHORT: Record<VisibilityMode, string> = {
  mutual:      'Mutuo',
  owner_reads: 'Solo yo leo',
  admin_only:  'Admin solo',
};

const VISIBILITY_MODES: VisibilityMode[] = ['mutual', 'owner_reads', 'admin_only'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_EMOJI = '🏠';
const EMOJI_OPTIONS = [
  '🏠','🏢','💼','💰','💑','👫','🌍','🎯',
  '📊','📈','⭐','🚀','💡','🎉','🌱','🤝',
  '💻','🎓','🏦','🌟','🔥','💪','🎨','🌈',
];

type InviteeRow = { id: string; email: string; visibility: VisibilityMode };

function createEmptyInvitee(): InviteeRow {
  return { id: crypto.randomUUID(), email: '', visibility: 'mutual' };
}

interface WorkspaceMembersCardProps {
  accent: string;
  embedded?: boolean;
}

export function WorkspaceMembersCard({ accent: _accent, embedded = false }: Readonly<WorkspaceMembersCardProps>) {
  const { list, activeId, active, activeRole, canWrite, loading, switchTo, refresh } = useWorkspaces(true);

  // ── Crear nuevo espacio ───────────────────────────────────────────────────
  const [newWsOpen,   setNewWsOpen]   = React.useState(false);
  const [newWsName,   setNewWsName]   = React.useState('');
  const [invitees,    setInvitees]    = React.useState<InviteeRow[]>([]);
  const [newWsStatus, setNewWsStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [newWsMsg,    setNewWsMsg]    = React.useState('');
  const [newWsEmoji,  setNewWsEmoji]  = React.useState(DEFAULT_EMOJI);
  const [emojiOpen,   setEmojiOpen]   = React.useState(false);
  const emojiRef = React.useRef<HTMLDivElement | null>(null);

  // ── Miembros expandibles por fila ────────────────────────────────────────
  const [membersRowId,   setMembersRowId]   = React.useState<string | null>(null);
  const [membersCache,   setMembersCache]   = React.useState<Record<string, WorkspaceMember[]>>({});
  const [membersLoading, setMembersLoading] = React.useState<Record<string, boolean>>({});
  const [invitesCache,   setInvitesCache]   = React.useState<Record<string, WorkspaceInvite[]>>({});
  const [invitesLoading, setInvitesLoading] = React.useState<Record<string, boolean>>({});

  // ── Invite inline por fila ────────────────────────────────────────────────
  const [inviteRowId, setInviteRowId] = React.useState<string | null>(null);
  const [email,       setEmail]       = React.useState('');
  const [visibility,  setVisibility]  = React.useState<VisibilityMode>('mutual');
  const [invStatus,   setInvStatus]   = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [invMsg,      setInvMsg]      = React.useState('');

  const emailValid = EMAIL_RE.test(email.trim());

  // ── Helpers invitados ─────────────────────────────────────────────────────
  function addInvitee() {
    setInvitees(prev => [...prev, createEmptyInvitee()]);
  }

  function removeInvitee(id: string) {
    setInvitees(prev => {
      const next = prev.filter(r => r.id !== id);
      // Siempre mantener al menos 1 fila
      return next.length === 0 ? [createEmptyInvitee()] : next;
    });
  }

  function updateInvitee(id: string, field: 'email' | 'visibility', value: string) {
    setInvitees(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  // ── Validación creación ───────────────────────────────────────────────────
  const hasValidInvitee = invitees.some(r => EMAIL_RE.test(r.email.trim()));
  const canCreate       = newWsName.trim().length > 0 && hasValidInvitee && newWsStatus !== 'loading';

  // ── Handlers ──────────────────────────────────────────────────────────────
  // Cerrar emoji picker al hacer click fuera
  React.useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: PointerEvent) => { if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [emojiOpen]);

  function toggleNewWorkspaceForm() {
    const opening = !newWsOpen;
    setNewWsOpen(opening);
    setNewWsMsg('');
    setNewWsStatus('idle');
    if (!opening) { setNewWsEmoji(DEFAULT_EMOJI); setEmojiOpen(false); }
    if (opening) setInvitees(prev => prev.length > 0 ? prev : [createEmptyInvitee()]);
  }

  async function handleCreateWorkspace(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canCreate) return;
    setNewWsStatus('loading'); setNewWsMsg('');
    try {
      const fullName = `${newWsEmoji} ${newWsName.trim()}`;
      const ws = await workspaceService.create(fullName);
      const valid = invitees.filter(r => EMAIL_RE.test(r.email.trim()));
      await Promise.allSettled(
        valid.map(r => workspaceService.invite(ws.id, r.email.trim(), 'editor', r.visibility))
      );
      const n = valid.length;
      setNewWsMsg(`Espacio "${ws.name}" creado con ${n} invitación${n > 1 ? 'es' : ''} enviada${n > 1 ? 's' : ''}.`);
      setNewWsName('');
      setNewWsEmoji(DEFAULT_EMOJI);
      setInvitees([createEmptyInvitee()]);
      setNewWsStatus('ok');
      setNewWsOpen(false);
      await refresh();
    } catch (err: unknown) {
      setNewWsMsg(err instanceof Error ? err.message : 'No se pudo crear el espacio.');
      setNewWsStatus('error');
    }
  }

  async function toggleMembersRow(wsId: string, wsRole: WorkspaceRole) {
    if (membersRowId === wsId) { setMembersRowId(null); return; }
    setMembersRowId(wsId);
    const fetches: Promise<void>[] = [];
    if (!membersCache[wsId]) {
      setMembersLoading(prev => ({ ...prev, [wsId]: true }));
      fetches.push(
        workspaceService.members(wsId)
          .then(rows => setMembersCache(prev => ({ ...prev, [wsId]: rows })))
          .catch(() => {})
          .finally(() => setMembersLoading(prev => ({ ...prev, [wsId]: false }))),
      );
    }
    if (!invitesCache[wsId] && (wsRole === 'owner' || wsRole === 'editor')) {
      setInvitesLoading(prev => ({ ...prev, [wsId]: true }));
      fetches.push(
        workspaceService.workspaceInvites(wsId)
          .then(rows => setInvitesCache(prev => ({ ...prev, [wsId]: rows })))
          .catch(() => {})
          .finally(() => setInvitesLoading(prev => ({ ...prev, [wsId]: false }))),
      );
    }
    await Promise.all(fetches);
  }

  async function removeMemberFromWs(wsId: string, member: WorkspaceMember) {
    if (!confirm(`¿Quitar a ${member.name || member.email} del espacio?`)) return;
    try {
      await workspaceService.removeMember(wsId, member.userId);
      setMembersCache(prev => ({ ...prev, [wsId]: (prev[wsId] ?? []).filter(m => m.userId !== member.userId) }));
      await refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo quitar al miembro.');
    }
  }

  async function handleChangeRole(wsId: string, member: WorkspaceMember, newRole: WorkspaceRole) {
    try {
      await workspaceService.changeRole(wsId, member.userId, newRole);
      setMembersCache(prev => ({
        ...prev,
        [wsId]: (prev[wsId] ?? []).map(m => m.userId === member.userId ? { ...m, role: newRole } : m),
      }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo cambiar el rol.');
    }
  }

  async function handleRevokeInvite(wsId: string, invite: WorkspaceInvite) {
    if (!confirm(`¿Revocar la invitación para ${invite.email}?`)) return;
    try {
      await workspaceService.revokeInvite(wsId, invite.id);
      setInvitesCache(prev => ({ ...prev, [wsId]: (prev[wsId] ?? []).filter(i => i.id !== invite.id) }));
      await refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo revocar la invitación.');
    }
  }

  async function handleTransferOwnership(wsId: string, member: WorkspaceMember) {
    if (!confirm(`¿Transferir la propiedad del espacio a ${member.name || member.email}? Tú pasarás a ser editor.`)) return;
    try {
      await workspaceService.transferOwnership(wsId, member.userId);
      setMembersCache(prev => ({
        ...prev,
        [wsId]: (prev[wsId] ?? []).map(m => {
          if (m.userId === member.userId) return { ...m, role: 'owner' };
          if (m.role === 'owner') return { ...m, role: 'editor' };
          return m;
        }),
      }));
      await refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo transferir la propiedad.');
    }
  }

  async function handleLeaveOrDelete(ws: { id: string; name: string; role: WorkspaceRole }) {
    const isOwner = ws.role === 'owner';
    const msg = isOwner
      ? `¿Eliminar el espacio "${ws.name}"? Se eliminarán todos los datos e invitaciones.`
      : `¿Salir del espacio "${ws.name}"?`;
    if (!confirm(msg)) return;
    try {
      if (isOwner) {
        await workspaceService.deleteWorkspace(ws.id);
      } else {
        await workspaceService.leaveWorkspace(ws.id);
      }
      // Si el espacio eliminado/abandonado era el activo, seleccionar otro antes de recargar
      if (ws.id === activeId) {
        const remaining = list.filter(w => w.id !== ws.id);
        if (remaining.length > 0) switchTo(remaining[0].id);
      }
      await refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    }
  }

  function openInviteRow(wsId: string) {
    setInviteRowId(prev => prev === wsId ? null : wsId);
    setEmail(''); setVisibility('mutual'); setInvMsg(''); setInvStatus('idle');
  }

  async function handleInvite(ev: React.FormEvent) {
    ev.preventDefault();
    if (!inviteRowId || !emailValid) return;
    setInvStatus('loading'); setInvMsg('');
    try {
      await workspaceService.invite(inviteRowId, email.trim(), 'editor', visibility);
      setInvMsg('Invitación enviada.');
      setEmail(''); setVisibility('mutual'); setInvStatus('ok');
      // Invalidar cache de invitaciones para que se recargue al reabrir el panel
      setInvitesCache(prev => { const next = { ...prev }; delete next[inviteRowId]; return next; });
      await refresh();
    } catch (err: unknown) {
      setInvMsg(err instanceof Error ? err.message : 'No se pudo crear la invitación.');
      setInvStatus('error');
    }
  }

  const COL = 'minmax(0,1fr) 120px 76px 164px';
  const ACT_BG  = 'rgba(17,24,39,0.03)';
  const ACT_BRD = `1px solid ${C.border}`;

  const content = (
    <>
      <style>{`
        @keyframes ws-chevron-hint {
          0%,65%,100% { transform:translateX(0); opacity:0.35; }
          32%          { transform:translateX(3px); opacity:0.75; }
        }
        .ws-name-cell:hover { background:rgba(99,102,241,0.06); border-radius:8px; }
        .ws-name-cell:hover .ws-chevron { color:var(--color-primary,#6366f1) !important; }
      `}</style>
      <CardHeader
        title="Miembros del espacio"
        subtitle={active ? active.name : 'Espacio activo'}
        right={
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 999,
            background: activeRole === 'owner' ? C.infoSoft : activeRole === 'editor' ? C.successSoft : C.soft,
            color:      activeRole === 'owner' ? C.info     : activeRole === 'editor' ? C.success     : C.textDim,
            fontSize: 11, fontWeight: 800,
          }}>
            {activeRole ? ROLE_LABEL[activeRole] : 'Cargando'}
          </span>
        }
      />

      <div style={{ display: 'grid', gap: 14 }}>

        {/* ── 1. Crear nuevo espacio ────────────────────────────────────── */}
        <div style={{
          borderRadius: 14,
          border: `1.5px solid ${newWsOpen ? C.primary + '60' : C.border}`,
          overflow: 'hidden',
          boxShadow: newWsOpen ? `0 0 0 3px ${C.primary}10` : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          {/* Cabecera toggle */}
          <button
            type="button"
            onClick={toggleNewWorkspaceForm}
            style={{
              width: '100%', padding: '13px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              background: newWsOpen ? `${C.primary}08` : 'transparent',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-ui), system-ui, sans-serif',
              transition: 'background 0.15s',
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              background: newWsOpen ? C.primary : C.border,
              color: newWsOpen ? '#fff' : C.textMute,
              fontSize: 18, lineHeight: 1, fontWeight: 900,
              transition: 'all 0.15s',
            }}>
              {newWsOpen ? '−' : '+'}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 800,
              color: newWsOpen ? C.primary : C.text,
              transition: 'color 0.15s',
            }}>
              Crear nuevo espacio de trabajo
            </span>
          </button>

          {/* Formulario de creación */}
          {newWsOpen && (
            <form onSubmit={handleCreateWorkspace}>
              <div style={{
                padding: '4px 16px 20px',
                display: 'grid', gap: 20,
                background: `${C.primary}04`,
              }}>

                {/* ① Nombre */}
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StepBadge n={1} active={newWsName.trim().length > 0} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: C.textMute, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      Nombre del espacio <Required />
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Selector de emoji */}
                    <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setEmojiOpen(o => !o)}
                        disabled={newWsStatus === 'loading'}
                        title="Cambiar emoji"
                        style={{
                          width: 38, height: 38, borderRadius: 10,
                          border: `1.5px solid ${emojiOpen ? C.primary + '60' : C.border}`,
                          background: emojiOpen ? `${C.primary}08` : '#fff',
                          cursor: 'pointer', fontSize: 18, lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        {newWsEmoji}
                      </button>
                      {emojiOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                          padding: 8, borderRadius: 12,
                          background: '#fff', border: `1px solid ${C.border}`,
                          boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2,
                          width: 200,
                        }}>
                          {EMOJI_OPTIONS.map(e => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => { setNewWsEmoji(e); setEmojiOpen(false); }}
                              style={{
                                width: 30, height: 30, borderRadius: 7, border: 'none',
                                background: e === newWsEmoji ? `${C.primary}18` : 'transparent',
                                cursor: 'pointer', fontSize: 17, lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.1s',
                              }}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input de nombre */}
                    <input
                      type="text"
                      value={newWsName}
                      onChange={ev => setNewWsName(ev.target.value)}
                      placeholder="Pareja, Empresa, Finanzas compartidas…"
                      disabled={newWsStatus === 'loading'}
                      autoFocus
                      style={{
                        ...inputStyle,
                        flex: 1,
                        borderColor: newWsName.trim() ? C.primary + '60' : C.border,
                        boxShadow: newWsName.trim() ? `0 0 0 2px ${C.primary}12` : 'none',
                      }}
                    />
                  </div>
                </div>

                {/* ② Personas */}
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StepBadge n={2} active={hasValidInvitee} />
                      <span style={{ fontSize: 11, fontWeight: 900, color: C.textMute, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        Personas a invitar <Required />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addInvitee}
                      disabled={newWsStatus === 'loading'}
                      style={{
                        padding: '5px 11px', borderRadius: 8,
                        border: `1px solid ${C.border}`, background: '#fff',
                        color: C.textDim, cursor: 'pointer',
                        fontFamily: 'var(--font-ui), system-ui, sans-serif',
                        fontSize: 11, fontWeight: 700,
                      }}
                    >
                      + Añadir otra
                    </button>
                  </div>

                  {invitees.map((row, idx) => {
                    const rowValid = EMAIL_RE.test(row.email.trim());
                    return (
                      <div
                        key={row.id}
                        style={{
                          borderRadius: 12,
                          border: `1.5px solid ${rowValid ? C.primary + '40' : C.border}`,
                          background: rowValid ? `${C.primary}05` : '#fff',
                          padding: '12px 12px 10px',
                          display: 'grid', gap: 10,
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        {/* Email del invitado */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: rowValid ? C.primary : C.border,
                            color: rowValid ? '#fff' : C.textMute,
                            fontSize: 10, fontWeight: 900, transition: 'all 0.15s',
                          }}>
                            {idx + 1}
                          </span>
                          <input
                            type="email"
                            value={row.email}
                            onChange={ev => updateInvitee(row.id, 'email', ev.target.value)}
                            placeholder="email@invitado.com"
                            disabled={newWsStatus === 'loading'}
                            style={{
                              ...inputStyle,
                              height: 34, flex: 1,
                              borderColor: rowValid ? C.primary + '50' : C.border,
                            }}
                          />
                          {invitees.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInvitee(row.id)}
                              title="Quitar"
                              style={{
                                flexShrink: 0, width: 28, height: 28,
                                borderRadius: 8, border: 'none',
                                background: 'transparent', color: C.textMute,
                                cursor: 'pointer', fontSize: 18, lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Selector de visibilidad — aparece cuando email es válido */}
                        {rowValid && (
                          <div style={{ display: 'grid', gap: 6, paddingLeft: 28 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                              Visibilidad
                            </span>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {VISIBILITY_MODES.map(mode => {
                                const sel = row.visibility === mode;
                                return (
                                  <button
                                    key={mode}
                                    type="button"
                                    onClick={() => updateInvitee(row.id, 'visibility', mode)}
                                    style={{
                                      flex: '1 1 0',
                                      padding: '8px 8px',
                                      borderRadius: 9,
                                      border: `1.5px solid ${sel ? C.primary : C.border}`,
                                      background: sel ? C.primary : '#fff',
                                      color: sel ? '#fff' : C.textDim,
                                      fontFamily: 'var(--font-ui), system-ui, sans-serif',
                                      fontSize: 10.5, fontWeight: 800,
                                      cursor: 'pointer', textAlign: 'left',
                                      transition: 'all 0.12s',
                                    }}
                                  >
                                    <div>{VISIBILITY_SHORT[mode]}</div>
                                    <div style={{
                                      fontSize: 9, fontWeight: 500, marginTop: 2,
                                      opacity: sel ? 0.85 : 0.65, lineHeight: 1.3,
                                    }}>
                                      {VISIBILITY_LABELS[mode]}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Banner de validación pendiente */}
                {!canCreate && newWsStatus !== 'loading' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 13px', borderRadius: 10,
                    background: 'rgba(156,163,175,0.10)',
                    border: '1px solid rgba(156,163,175,0.28)',
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(156,163,175,0.22)',
                      color: '#9CA3AF', fontSize: 11, fontWeight: 900,
                    }}>
                      !
                    </span>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, lineHeight: 1.4 }}>
                      {!newWsName.trim()
                        ? 'Ponle un nombre al espacio para continuar'
                        : 'Añade al menos un invitado con email válido'}
                    </span>
                  </div>
                )}

                {/* Botón crear */}
                <button
                  type="submit"
                  disabled={!canCreate}
                  style={{
                    ...primaryBtn(!canCreate),
                    width: '100%', height: 42,
                    fontSize: 13, fontWeight: 900,
                    borderRadius: 11,
                    opacity: canCreate ? 1 : 0.42,
                  }}
                >
                  {newWsStatus === 'loading' ? 'Creando espacio…' : 'Crear espacio →'}
                </button>
              </div>
            </form>
          )}

          {/* Mensaje resultado */}
          {newWsMsg && (
            <div style={{
              margin: 14,
              padding: '10px 12px', borderRadius: 9,
              border:     `1px solid ${newWsStatus === 'error' ? 'rgba(207,156,156,0.38)' : 'rgba(143,168,143,0.35)'}`,
              background: newWsStatus === 'error' ? 'rgba(207,156,156,0.10)' : 'rgba(143,168,143,0.12)',
              color:      newWsStatus === 'error' ? C.neg : C.pos,
              fontSize: 12, fontWeight: 700,
            }}>
              {newWsMsg}
            </div>
          )}
        </div>

        {/* ── 2. Tabla: mis espacios de trabajo ────────────────────────── */}
        {list.length > 0 && (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {/* Cabecera */}
            <div style={{
              display: 'grid', gridTemplateColumns: COL,
              background: C.cardHi, color: C.textMute,
              fontSize: 11, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: 0.7,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ padding: '11px 16px' }}>Espacio</span>
              <span style={{ padding: '11px 8px', textAlign: 'center' }}>Miembros</span>
              <span style={{ padding: '11px 8px', textAlign: 'center' }}>Tu rol</span>
              <span style={{
                padding: '11px 16px', textAlign: 'center',
                background: ACT_BG, borderLeft: ACT_BRD,
                color: C.textMute,
              }}>Acciones</span>
            </div>

            {loading ? (
              <div style={{ padding: 18, color: C.textMute, fontSize: 13 }}>Cargando…</div>
            ) : list.map(ws => {
              const isActive   = ws.id === activeId;
              const cnt        = ws.memberCount ?? 1;
              const pending    = ws.pendingInvites ?? 0;
              const confirmed  = cnt;
              const canInvite  = ws.role === 'owner' || ws.role === 'editor';
              const rowOpen    = inviteRowId === ws.id;
              const memberLabel = confirmed === 1 ? 'Solo tú' : `${confirmed} personas`;

              return (
                <React.Fragment key={ws.id}>
                  {/* Fila principal */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: COL,
                    alignItems: 'stretch',
                    borderTop: `1px solid ${C.border}`,
                    background: isActive ? `${C.primary}05` : 'transparent',
                    opacity: pending > 0 && confirmed <= 1 ? 0.62 : 1,
                    transition: 'opacity 0.2s, background 0.15s',
                  }}>
                    {/* Nombre (clic para ver miembros) */}
                    <div
                      role="button"
                      tabIndex={0}
                      className="ws-name-cell"
                      onClick={() => toggleMembersRow(ws.id, ws.role)}
                      onKeyDown={e => e.key === 'Enter' && toggleMembersRow(ws.id, ws.role)}
                      style={{
                        minWidth: 0, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '13px 16px', transition: 'background 0.15s',
                      }}
                    >
                      <span
                        className="ws-chevron"
                        style={{
                          flexShrink: 0, fontSize: 10, lineHeight: 1,
                          display: 'inline-block', color: C.textMute,
                          transform: membersRowId === ws.id ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s, color 0.15s',
                          animation: membersRowId !== ws.id ? 'ws-chevron-hint 2.6s ease infinite' : 'none',
                        }}
                      >▶</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 700, color: C.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {ws.name}
                        </div>
                      </div>
                    </div>

                    {/* Miembros + pendientes */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '13px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: confirmed > 1 ? C.primary : C.textMute }}>
                        {memberLabel}
                      </div>
                      {pending > 0 && (
                        <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginTop: 3 }}>
                          ⏳ {pending} pendiente{pending > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Rol */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '13px 8px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 999,
                        background: ws.role === 'owner' ? C.infoSoft : ws.role === 'editor' ? C.successSoft : C.soft,
                        color:      ws.role === 'owner' ? C.info     : ws.role === 'editor' ? C.success     : C.textDim,
                        fontSize: 11, fontWeight: 900,
                      }}>
                        {ROLE_LABEL[ws.role]}
                      </span>
                    </div>

                    {/* Acciones — celda con fondo diferenciado */}
                    <div style={{
                      display: 'flex', gap: 7, justifyContent: 'center', alignItems: 'center',
                      padding: '13px 16px',
                      background: ACT_BG, borderLeft: ACT_BRD,
                    }}>
                      {isActive ? (
                        <span style={{
                          padding: '4px 11px', borderRadius: 999,
                          background: `${C.primary}15`, color: C.primary,
                          fontSize: 12, fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}>
                          En uso
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchTo(ws.id)}
                          style={{
                            padding: '4px 11px', borderRadius: 999,
                            border: `1px solid ${C.border}`, background: 'transparent',
                            color: C.textDim, cursor: 'pointer',
                            fontFamily: 'var(--font-ui), system-ui, sans-serif',
                            fontSize: 12, fontWeight: 700,
                          }}
                        >
                          Usar
                        </button>
                      )}
                      {canInvite && (
                        <button
                          type="button"
                          onClick={() => openInviteRow(ws.id)}
                          title={rowOpen ? 'Cerrar' : 'Invitar a este espacio'}
                          style={{
                            width: 24, height: 24, borderRadius: 7,
                            border: `1px solid ${rowOpen ? C.primary + '60' : C.border}`,
                            background: rowOpen ? `${C.primary}12` : 'transparent',
                            color: rowOpen ? C.primary : C.textDim,
                            cursor: 'pointer', fontSize: 16, fontWeight: 400,
                            display: 'grid', placeItems: 'center', lineHeight: 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          {rowOpen ? '×' : '+'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleLeaveOrDelete(ws)}
                        title={ws.role === 'owner' ? 'Eliminar espacio' : 'Salir del espacio'}
                        style={{
                          width: 24, height: 24, borderRadius: 7,
                          border: `1px solid rgba(220,38,38,0.25)`,
                          background: 'transparent',
                          color: 'rgba(220,38,38,0.55)',
                          cursor: 'pointer', fontSize: 16, fontWeight: 400,
                          display: 'grid', placeItems: 'center', lineHeight: 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,38,38,0.5)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(220,38,38,0.55)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,38,38,0.25)';
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Panel de miembros expandible */}
                  {membersRowId === ws.id && (
                    <div style={{ borderTop: `1px solid ${C.border}`, background: `${C.primary}025` }}>
                      {membersLoading[ws.id] ? (
                        <div style={{ padding: '12px 20px', color: C.textMute, fontSize: 12 }}>Cargando miembros…</div>
                      ) : (membersCache[ws.id] ?? []).length === 0 ? (
                        <div style={{ padding: '12px 20px', color: C.textMute, fontSize: 12 }}>Sin miembros confirmados aún.</div>
                      ) : (membersCache[ws.id] ?? []).map(member => {
                        const vm = (member.visibilityMode ?? 'mutual') as VisibilityMode;
                        return (
                          <div
                            key={member.userId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1fr) 80px 100px 36px',
                              gap: 8, alignItems: 'center',
                              padding: '10px 16px 10px 34px',
                              borderTop: `1px solid ${C.border}30`,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {member.name || member.email}
                              </div>
                              <div style={{ fontSize: 11, color: C.textMute, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {member.email}
                              </div>
                            </div>
                            {/* Rol: select para owner sobre no-owner, badge para el resto */}
                            {ws.role === 'owner' && member.role !== 'owner' ? (
                              <select
                                value={member.role}
                                onChange={e => handleChangeRole(ws.id, member, e.target.value as WorkspaceRole)}
                                style={{
                                  justifySelf: 'center', height: 26, padding: '0 6px',
                                  borderRadius: 999, fontSize: 11, fontWeight: 900,
                                  border: `1px solid ${C.border}`, background: member.role === 'editor' ? C.successSoft : C.soft,
                                  color: member.role === 'editor' ? C.success : C.textDim,
                                  cursor: 'pointer', outline: 'none',
                                  fontFamily: 'var(--font-ui), system-ui, sans-serif',
                                }}
                              >
                                <option value="editor">Editor</option>
                                <option value="viewer">Lectura</option>
                              </select>
                            ) : (
                              <span style={{
                                padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 900,
                                justifySelf: 'center',
                                background: member.role === 'owner' ? C.infoSoft : member.role === 'editor' ? C.successSoft : C.soft,
                                color:      member.role === 'owner' ? C.info     : member.role === 'editor' ? C.success     : C.textDim,
                              }}>
                                {ROLE_LABEL[member.role]}
                              </span>
                            )}
                            <span style={{
                              padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                              justifySelf: 'center',
                              background: vm === 'mutual' ? C.successSoft : vm === 'owner_reads' ? C.infoSoft : 'rgba(240,180,60,0.12)',
                              color:      vm === 'mutual' ? C.success     : vm === 'owner_reads' ? C.info     : '#b45309',
                            }}>
                              {VISIBILITY_SHORT[vm]}
                            </span>
                            {ws.role === 'owner' && member.role !== 'owner' ? (
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleTransferOwnership(ws.id, member)}
                                  title="Transferir propiedad"
                                  style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    border: `1px solid ${C.border}`, background: 'transparent',
                                    color: C.textMute, cursor: 'pointer',
                                    fontSize: 12, fontWeight: 700,
                                    display: 'grid', placeItems: 'center', lineHeight: 1,
                                  }}
                                >
                                  ⇑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeMemberFromWs(ws.id, member)}
                                  title="Quitar miembro"
                                  style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    border: `1px solid rgba(220,38,38,0.25)`, background: 'transparent',
                                    color: 'rgba(220,38,38,0.55)', cursor: 'pointer',
                                    fontSize: 16, fontWeight: 400,
                                    display: 'grid', placeItems: 'center', lineHeight: 1,
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ) : <span />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Invitaciones pendientes (owner/editor) */}
                  {membersRowId === ws.id && (ws.role === 'owner' || ws.role === 'editor') && (() => {
                    const pending = invitesCache[ws.id] ?? [];
                    if (invitesLoading[ws.id]) {
                      return (
                        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, color: C.textMute, fontSize: 12 }}>
                          Cargando invitaciones…
                        </div>
                      );
                    }
                    if (pending.length === 0) return null;
                    return (
                      <div style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(217,119,6,0.03)' }}>
                        <div style={{
                          padding: '7px 16px 5px 34px',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const,
                          color: '#d97706',
                        }}>
                          Invitaciones pendientes ({pending.length})
                        </div>
                        {pending.map(inv => (
                          <div
                            key={inv.id}
                            style={{
                              display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 60px auto',
                              gap: 8, alignItems: 'center',
                              padding: '7px 16px 7px 34px',
                              borderTop: `1px solid ${C.border}20`,
                            }}
                          >
                            <span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                              {inv.email}
                            </span>
                            <span style={{
                              padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 800,
                              justifySelf: 'center' as const,
                              background: inv.role === 'editor' ? C.successSoft : C.soft,
                              color: inv.role === 'editor' ? C.success : C.textDim,
                            }}>
                              {ROLE_LABEL[inv.role]}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevokeInvite(ws.id, inv)}
                              title="Revocar invitación"
                              style={{
                                width: 22, height: 22, borderRadius: 6,
                                border: `1px solid rgba(220,38,38,0.25)`, background: 'transparent',
                                color: 'rgba(220,38,38,0.55)', cursor: 'pointer',
                                fontSize: 14, fontWeight: 400,
                                display: 'grid', placeItems: 'center', lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Mini-formulario de invitación inline */}
                  {rowOpen && (
                    <form
                      onSubmit={handleInvite}
                      style={{
                        padding: '12px 14px 14px',
                        borderTop: `1px solid ${C.border}`,
                        background: `${C.primary}04`,
                        display: 'grid', gap: 10,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 8, alignItems: 'center' }}>
                        <input
                          type="email"
                          value={email}
                          onChange={ev => { setEmail(ev.target.value); setInvMsg(''); }}
                          placeholder="email@persona.com"
                          disabled={invStatus === 'loading'}
                          autoFocus
                          style={{ ...inputStyle, height: 34 }}
                        />
                        <button
                          type="submit"
                          disabled={!emailValid || invStatus === 'loading'}
                          style={{ ...primaryBtn(!emailValid || invStatus === 'loading'), height: 34, fontSize: 11 }}
                        >
                          {invStatus === 'loading' ? '…' : 'Invitar'}
                        </button>
                      </div>

                      {emailValid && (
                        <div style={{ display: 'flex', gap: 5 }}>
                          {VISIBILITY_MODES.map(mode => {
                            const sel = visibility === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setVisibility(mode)}
                                style={{
                                  flex: '1 1 0', padding: '7px 8px', borderRadius: 8,
                                  border: `1.5px solid ${sel ? C.primary : C.border}`,
                                  background: sel ? C.primary : '#fff',
                                  color: sel ? '#fff' : C.textDim,
                                  fontFamily: 'var(--font-ui), system-ui, sans-serif',
                                  fontSize: 10, fontWeight: 800, cursor: 'pointer',
                                  textAlign: 'left', transition: 'all 0.12s',
                                }}
                              >
                                <div>{VISIBILITY_SHORT[mode]}</div>
                                <div style={{ fontSize: 9, fontWeight: 500, marginTop: 2, opacity: sel ? 0.85 : 0.6, lineHeight: 1.3 }}>
                                  {VISIBILITY_LABELS[mode]}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {invMsg && (
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: invStatus === 'error' ? C.neg : C.pos,
                        }}>
                          {invMsg}
                        </div>
                      )}
                    </form>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (embedded) return content;
  return <Card>{content}</Card>;
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: active ? C.primary : C.border,
      color: active ? '#fff' : C.textMute,
      fontSize: 10, fontWeight: 900,
      transition: 'all 0.2s',
    }}>
      {active ? '✓' : n}
    </span>
  );
}

function Required() {
  return <span style={{ color: C.neg, fontWeight: 900 }}>*</span>;
}

// ── Estilos compartidos ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, boxSizing: 'border-box',
  borderRadius: 10, border: `1px solid ${C.border}`,
  background: '#fff', color: C.text,
  outline: 'none', padding: '0 11px',
  fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12.5,
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 38, padding: '0 16px', borderRadius: 10, border: 'none',
    background: disabled ? C.border : C.primary,
    color:      disabled ? C.textMute : '#fff',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-ui), system-ui, sans-serif',
    fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
  };
}
