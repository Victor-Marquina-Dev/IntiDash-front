'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { VISIBILITY_LABELS, type WorkspaceInvite, type WorkspaceMember, type WorkspaceRole, type VisibilityMode } from '@/shared/services/workspace.service';
import { ROLE_LABEL, VISIBILITY_MODES, VISIBILITY_SHORT } from './workspaceMembers.constants';
import { inputStyle, primaryBtn } from './WorkspaceMembersUi';

const COL = 'minmax(0,1fr) 120px 76px 164px';
const ACT_BG = 'rgba(17,24,39,0.03)';
const ACT_BRD = `1px solid ${C.border}`;

type WorkspaceListItem = {
  id: string;
  name: string;
  role: WorkspaceRole;
  memberCount?: number | null;
  pendingInvites?: number | null;
};

interface WorkspaceListProps {
  list: WorkspaceListItem[];
  loading: boolean;
  activeId: string | null | undefined;
  membersRowId: string | null;
  membersCache: Record<string, WorkspaceMember[]>;
  membersLoading: Record<string, boolean>;
  invitesCache: Record<string, WorkspaceInvite[]>;
  invitesLoading: Record<string, boolean>;
  inviteRowId: string | null;
  email: string;
  emailValid: boolean;
  visibility: VisibilityMode;
  invStatus: 'idle' | 'loading' | 'ok' | 'error';
  invMsg: string;
  onToggleMembers: (wsId: string, wsRole: WorkspaceRole) => void;
  onSwitchTo: (wsId: string) => void;
  onOpenInviteRow: (wsId: string) => void;
  onLeaveOrDelete: (ws: { id: string; name: string; role: WorkspaceRole }) => void;
  onChangeRole: (wsId: string, member: WorkspaceMember, newRole: WorkspaceRole) => void;
  onTransferOwnership: (wsId: string, member: WorkspaceMember) => void;
  onRemoveMember: (wsId: string, member: WorkspaceMember) => void;
  onRevokeInvite: (wsId: string, invite: WorkspaceInvite) => void;
  onInvite: (ev: React.FormEvent) => void;
  onEmailChange: (value: string) => void;
  onVisibilityChange: (value: VisibilityMode) => void;
}

export function WorkspaceList({
  list, loading, activeId, membersRowId, membersCache, membersLoading, invitesCache, invitesLoading,
  inviteRowId, email, emailValid, visibility, invStatus, invMsg,
  onToggleMembers: toggleMembersRow,
  onSwitchTo: switchTo,
  onOpenInviteRow: openInviteRow,
  onLeaveOrDelete: handleLeaveOrDelete,
  onChangeRole: handleChangeRole,
  onTransferOwnership: handleTransferOwnership,
  onRemoveMember: removeMemberFromWs,
  onRevokeInvite: handleRevokeInvite,
  onInvite: handleInvite,
  onEmailChange,
  onVisibilityChange,
}: WorkspaceListProps) {
  return (
    <>
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
                          onChange={ev => onEmailChange(ev.target.value)}
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
                                onClick={() => onVisibilityChange(mode)}
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
    </>
  );
}
