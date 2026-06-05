'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { C } from '@/lib/colors';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { NOTION_SYNC_ENDPOINTS, notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { SyncRun } from '@/shared/types/finance.types';
import { getActiveWorkspace } from '@/shared/services/workspace.service';
import {
  SettingsActionRow,
  SettingsInfoRow,
  type SettingsTheme,
} from '@/components/screens/settings/SettingsLayout';

const RefreshIcon = Icon.refresh;

const lsKey = () => `notion_last_sync_${getActiveWorkspace() ?? 'default'}`;

function formatWhen(mins: number): string {
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)} h`;
}

function getSyncLabel(
  lastSync: string | null,
  nowMs: number,
  configLoaded: boolean,
  maskedTok: string | null,
): string {
  if (configLoaded && maskedTok === null) return 'Sin token — configura tu token primero';
  if (lastSync === null) return 'Sin sincronizar';
  if (nowMs === 0) return 'Sync registrada';
  const mins = Math.floor((nowMs - new Date(lastSync).getTime()) / 60000);
  return `Última sync ${formatWhen(mins)}`;
}

function getSyncDetail(isConfigured: boolean | null, maskedTok: string | null): string {
  if (isConfigured === null) return '—';
  if (isConfigured) return `${NOTION_SYNC_ENDPOINTS.length} tablas disponibles`;
  if (maskedTok !== null) return 'Configura las tablas en Ajustes';
  return 'Configura tu token primero';
}

function getErrorLabel(failCnt: number): string {
  const s = failCnt !== 1 ? 's' : '';
  return `${failCnt} tabla${s} no sincronizada${s}`;
}

type TokStatus = 'idle' | 'ok' | 'error';

function tokenButtonStyles(status: TokStatus, theme: SettingsTheme, disabled: boolean) {
  const borderColor = status === 'ok'
    ? `${C.pos}30`
    : status === 'error'
      ? 'rgba(200,60,60,0.3)'
      : theme.border;
  const bg = status === 'ok'
    ? `${C.pos}12`
    : status === 'error'
      ? 'rgba(200,60,60,0.08)'
      : theme.surfaceMuted;
  const color = status === 'ok' ? C.pos : status === 'error' ? C.neg : theme.text;
  return {
    height: 38, padding: '0 12px', borderRadius: 8,
    border: `1px solid ${borderColor}`,
    background: bg, color,
    cursor: disabled ? ('default' as const) : ('pointer' as const),
    opacity: disabled ? 0.55 : 1,
    fontFamily: 'var(--font-ui), system-ui, sans-serif',
    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' as const,
  };
}

function tokenButtonLabel(status: TokStatus, saving: boolean): string {
  if (status === 'ok') return 'Guardado';
  if (status === 'error') return 'Error';
  if (saving) return 'Guardando';
  return 'Guardar';
}

function readLastSync(): string | null {
  if (typeof globalThis.window === 'undefined') return null;
  return globalThis.window.localStorage.getItem(lsKey());
}

export function NotionSyncSettings({ theme, canWrite = true }: Readonly<{ theme: SettingsTheme; canWrite?: boolean }>) {
  const [syncing,      setSyncing]      = React.useState(false);
  const [done,         setDone]         = React.useState(0);
  const [failCnt,      setFailCnt]      = React.useState(0);
  const [lastSync,     setLastSync]     = React.useState<string | null>(readLastSync);
  const [token,        setToken]        = React.useState('');
  const [maskedTok,    setMaskedTok]    = React.useState<string | null>(null);
  const [isConfigured, setIsConfigured] = React.useState<boolean | null>(null);
  const [configLoaded, setConfigLoaded] = React.useState(false);
  const [savingTok,    setSavingTok]    = React.useState(false);
  const [tokStatus,    setTokStatus]    = React.useState<TokStatus>('idle');
  const [nowMs,        setNowMs]        = React.useState(0);
  const [runs,         setRuns]         = React.useState<SyncRun[]>([]);
  const [runsLoaded,   setRunsLoaded]   = React.useState(false);

  React.useEffect(() => {
    notionPaymentsService.getConfig()
      .then((cfg: { notionTokenMasked?: string | null; isConfigured?: boolean } | null) => {
        if (cfg?.notionTokenMasked) setMaskedTok(cfg.notionTokenMasked);
        setIsConfigured(Boolean(cfg?.isConfigured));
        setConfigLoaded(true);
      })
      .catch(() => { setConfigLoaded(true); });
  }, []);

  React.useEffect(() => {
    notionPaymentsService.getSyncRuns()
      .then(data => { setRuns(data); setRunsLoaded(true); })
      .catch(() => setRunsLoaded(true));
  }, []);

  React.useEffect(() => {
    if (lastSync === null || syncing) return;
    const tid = globalThis.setTimeout(() => setNowMs(Date.now()), 0);
    const iid = globalThis.setInterval(() => setNowMs(Date.now()), 60000);
    return () => { globalThis.clearTimeout(tid); globalThis.clearInterval(iid); };
  }, [lastSync, syncing]);

  async function handleSaveToken() {
    const trimmed = token.trim();
    if (!canWrite || !trimmed) return;
    setSavingTok(true);
    setTokStatus('idle');
    try {
      const cfg = await notionPaymentsService.saveConfig({ notionToken: trimmed });
      if (cfg.notionTokenMasked) setMaskedTok(cfg.notionTokenMasked);
      setIsConfigured(Boolean(cfg.isConfigured));
      setToken('');
      setTokStatus('ok');
      globalThis.setTimeout(() => setTokStatus('idle'), 3000);
    } catch {
      setTokStatus('error');
      globalThis.setTimeout(() => setTokStatus('idle'), 3000);
    } finally {
      setSavingTok(false);
    }
  }

  async function handleSync() {
    if (!canWrite || isConfigured !== true) return;
    setSyncing(true);
    setDone(0);
    setFailCnt(0);
    try {
      const run = await notionPaymentsService.syncAll();
      setRuns(prev => [run, ...prev.slice(0, 19)]);
      const okCount  = run.tableResults.filter(r => r.status === 'ok').length;
      const errCount = run.tableResults.filter(r => r.status === 'error').length;
      setDone(okCount);
      setFailCnt(errCount);
      if (okCount > 0) {
        const now = new Date().toISOString();
        globalThis.window.localStorage.setItem(lsKey(), now);
        setLastSync(now);
        dispatchDataSynced();
      }
    } catch {
      setFailCnt(1);
    } finally {
      setSyncing(false);
    }
  }

  const statusLabel = !canWrite && configLoaded && maskedTok === null
    ? 'Solo lectura - sin token configurado'
    : syncing
    ? `Sincronizando ${done}/${NOTION_SYNC_ENDPOINTS.length} tablas`
    : getSyncLabel(lastSync, nowMs, configLoaded, maskedTok);

  const canSync = canWrite && isConfigured === true;
  const syncDetail = getSyncDetail(isConfigured, maskedTok);
  const readOnlySyncDetail = isConfigured === true
    ? `Solo lectura - ${NOTION_SYNC_ENDPOINTS.length} tablas disponibles`
    : maskedTok !== null
      ? 'Solo lectura - tablas pendientes de configuracion'
      : 'Solo lectura - sin token configurado';
  const tokBtnDisabled = !token.trim() || savingTok;
  const tokBtnStyles = tokenButtonStyles(tokStatus, theme, tokBtnDisabled);
  const tokBtnLabel = tokenButtonLabel(tokStatus, savingTok);

  const syncBg     = canSync && !syncing ? C.primary : C.border;
  const syncColor  = canSync && !syncing ? '#fff' : C.textMute;
  const syncCursor = canSync && !syncing ? 'pointer' : 'default';

  return (
    <>
      <SettingsInfoRow label="Estado" value={statusLabel} theme={theme} />
      {failCnt > 0 && !syncing && (
        <SettingsInfoRow label="Errores" value={getErrorLabel(failCnt)} theme={theme} />
      )}

      {canWrite ? (
        <SettingsActionRow
          label="Token de Notion"
          detail={maskedTok ?? 'Sin token guardado'}
          theme={theme}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <input
                type="password"
                aria-label="Token de Notion"
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={ev => setToken(ev.target.value)}
                onKeyDown={ev => { if (ev.key === 'Enter') void handleSaveToken(); }}
                style={{
                  width: 260, height: 38, borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: theme.input, color: theme.text,
                  outline: 'none', padding: '0 11px',
                  fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12.5,
                }}
              />
              <button type="button" onClick={handleSaveToken} disabled={tokBtnDisabled} style={tokBtnStyles}>
                {tokBtnLabel}
              </button>
            </div>
          }
        />
      ) : (
        <SettingsInfoRow label="Token de Notion" value={maskedTok ?? 'Sin token guardado'} theme={theme} />
      )}

      {canWrite ? (
      <SettingsActionRow
        label="Sincronización"
        detail={syncDetail}
        theme={theme}
        action={
          <button
            type="button"
            onClick={handleSync}
            disabled={!canSync || syncing}
            style={{
              height: 38, padding: '0 14px', borderRadius: 8, border: 'none',
              background: syncBg, color: syncColor, cursor: syncCursor,
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12.5, fontWeight: 800,
            }}
          >
            <RefreshIcon size={14} />
            {syncing ? `${done}/${NOTION_SYNC_ENDPOINTS.length}` : 'Sincronizar'}
          </button>
        }
      />
      ) : (
        <SettingsInfoRow label="Sincronizacion" value={readOnlySyncDetail} theme={theme} />
      )}

      {runsLoaded && runs.length > 0 && (
        <div style={{ padding: '10px 0 4px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: theme.muted, marginBottom: 6, paddingLeft: 2,
          }}>
            Historial
          </div>
          <div style={{
            border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden',
            fontFamily: 'var(--font-ui), system-ui, sans-serif',
          }}>
            {runs.slice(0, 10).map((run, i) => {
              const allOk  = run.tableResults.every(r => r.status === 'ok');
              const hasErr = run.tableResults.some(r => r.status === 'error');
              const okCnt  = run.tableResults.filter(r => r.status === 'ok').length;
              const errCnt = run.tableResults.filter(r => r.status === 'error').length;
              const dot    = allOk ? C.pos : hasErr ? C.neg : C.textMute;
              const when   = new Date(run.startedAt ?? Date.now()).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              });
              const summary = allOk
                ? `${okCnt} tablas ok`
                : `${okCnt} ok · ${errCnt} error${errCnt !== 1 ? 'es' : ''}`;
              return (
                <div key={run.id} style={{
                  display: 'grid', gridTemplateColumns: '8px 1fr auto auto', alignItems: 'center',
                  gap: 10, padding: '7px 12px',
                  borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                  background: i % 2 === 0 ? 'transparent' : `${theme.border}22`,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: dot, display: 'block',
                  }} />
                  <span style={{ fontSize: 12, color: theme.text }}>{summary}</span>
                  <span style={{ fontSize: 11, color: theme.muted, whiteSpace: 'nowrap' as const }}>
                    {when}
                  </span>
                  {canWrite && hasErr && (
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      title="Reintentar sync"
                      style={{
                        height: 24, padding: '0 8px', borderRadius: 6, border: `1px solid ${theme.border}`,
                        background: 'transparent', color: C.primary, cursor: syncing ? 'default' : 'pointer',
                        fontSize: 11, fontWeight: 700,
                      }}
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
