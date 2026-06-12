'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { VISIBILITY_LABELS } from '@/shared/services/workspace.service';
import { EMAIL_RE, EMOJI_OPTIONS, VISIBILITY_MODES, VISIBILITY_SHORT, type InviteeRow } from './workspaceMembers.constants';
import { inputStyle, primaryBtn, Required, StepBadge } from './WorkspaceMembersUi';

interface CreateWorkspacePanelProps {
  isOpen: boolean;
  name: string;
  invitees: InviteeRow[];
  status: 'idle' | 'loading' | 'ok' | 'error';
  message: string;
  emoji: string;
  emojiOpen: boolean;
  emojiRef: React.RefObject<HTMLDivElement | null>;
  hasValidInvitee: boolean;
  canCreate: boolean;
  onToggle: () => void;
  onSubmit: (ev: React.FormEvent) => void;
  onNameChange: (value: string) => void;
  onEmojiChange: (value: string) => void;
  onEmojiOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onAddInvitee: () => void;
  onRemoveInvitee: (id: string) => void;
  onUpdateInvitee: (id: string, field: 'email' | 'visibility', value: string) => void;
}

export function CreateWorkspacePanel({
  isOpen: newWsOpen,
  name: newWsName,
  invitees,
  status: newWsStatus,
  message: newWsMsg,
  emoji: newWsEmoji,
  emojiOpen,
  emojiRef,
  hasValidInvitee,
  canCreate,
  onToggle: toggleNewWorkspaceForm,
  onSubmit: handleCreateWorkspace,
  onNameChange: setNewWsName,
  onEmojiChange: setNewWsEmoji,
  onEmojiOpenChange: setEmojiOpen,
  onAddInvitee: addInvitee,
  onRemoveInvitee: removeInvitee,
  onUpdateInvitee: updateInvitee,
}: CreateWorkspacePanelProps) {
  return (
    <>
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
    </>
  );
}
