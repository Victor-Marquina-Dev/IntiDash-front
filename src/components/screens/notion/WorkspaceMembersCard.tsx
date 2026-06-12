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
} from '@/shared/services/workspace.service';
import { CreateWorkspacePanel } from './workspace-members/CreateWorkspacePanel';
import { WorkspaceList } from './workspace-members/WorkspaceList';
import {
  DEFAULT_EMOJI,
  EMAIL_RE,
  ROLE_LABEL,
  createEmptyInvitee,
  type InviteeRow,
} from './workspace-members/workspaceMembers.constants';

interface WorkspaceMembersCardProps {
  accent: string;
  embedded?: boolean;
}

export function WorkspaceMembersCard({ accent: _accent, embedded = false }: Readonly<WorkspaceMembersCardProps>) {
  const { list, activeId, active, activeRole, canWrite: _canWrite, loading, switchTo, refresh } = useWorkspaces(true);

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

        <CreateWorkspacePanel
          isOpen={newWsOpen}
          name={newWsName}
          invitees={invitees}
          status={newWsStatus}
          message={newWsMsg}
          emoji={newWsEmoji}
          emojiOpen={emojiOpen}
          emojiRef={emojiRef}
          hasValidInvitee={hasValidInvitee}
          canCreate={canCreate}
          onToggle={toggleNewWorkspaceForm}
          onSubmit={handleCreateWorkspace}
          onNameChange={setNewWsName}
          onEmojiChange={setNewWsEmoji}
          onEmojiOpenChange={setEmojiOpen}
          onAddInvitee={addInvitee}
          onRemoveInvitee={removeInvitee}
          onUpdateInvitee={updateInvitee}
        />

        <WorkspaceList
          list={list}
          loading={loading}
          activeId={activeId}
          membersRowId={membersRowId}
          membersCache={membersCache}
          membersLoading={membersLoading}
          invitesCache={invitesCache}
          invitesLoading={invitesLoading}
          inviteRowId={inviteRowId}
          email={email}
          emailValid={emailValid}
          visibility={visibility}
          invStatus={invStatus}
          invMsg={invMsg}
          onToggleMembers={toggleMembersRow}
          onSwitchTo={switchTo}
          onOpenInviteRow={openInviteRow}
          onLeaveOrDelete={handleLeaveOrDelete}
          onChangeRole={handleChangeRole}
          onTransferOwnership={handleTransferOwnership}
          onRemoveMember={removeMemberFromWs}
          onRevokeInvite={handleRevokeInvite}
          onInvite={handleInvite}
          onEmailChange={(value) => { setEmail(value); setInvMsg(''); }}
          onVisibilityChange={setVisibility}
        />      </div>
    </>
  );

  if (embedded) return content;
  return <Card>{content}</Card>;
}
