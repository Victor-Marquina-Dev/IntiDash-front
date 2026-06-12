'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { C } from '@/lib/colors';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DataSource, SyncRun } from '@/shared/types/finance.types';
import { getActiveWorkspace } from '@/shared/services/workspace.service';
import {
  SettingsActionRow,
  SettingsInfoRow,
  type SettingsTheme,
} from '@/components/screens/settings/SettingsLayout';

const RefreshIcon = Icon.refresh;

const lsKey = () => `notion_last_sync_${getActiveWorkspace() ?? 'default'}`;

// ── Auto-mapeo por nombre ───────────────────────────────────────────────────
const SOURCE_MAP: { label: string; key: string; aliases: string[] }[] = [
  { label: 'Ingresos',               key: 'ingresosSourceId',          aliases: ['ingresos', 'ingresos t1', 't1 ingresos', 't1_ingresos'] },
  { label: 'Gastos Únicos',          key: 'gastosUnicosSourceId',       aliases: ['gastos unicos', 'gastos t2', 't2 gastos unicos', 't2_gastos_unicos'] },
  { label: 'Gastos por Deudas',      key: 'gastosDeudasSourceId',       aliases: ['gastos deudas', 'gastos por deudas', 't3 gastos deudas', 't3_gastos_deudas', 'gastos por deudas tarjetas de credito', 'gastos por deudas-tarjetas de credito'] },
  { label: 'Deudas / Suscripciones', key: 'deudasSourceId',             aliases: ['deudas suscripciones', 'deudas y suscripciones', 'deudas / suscripciones', 't4 deudas', 't4_deudas_suscripciones'] },
  { label: 'Cuentas Bancarias',      key: 'cuentasBancariasSourceId',   aliases: ['cuentas bancarias', 't5 cuentas bancarias', 't5_cuentas_bancarias'] },
  { label: 'Transferencias',         key: 'transferenciasSourceId',     aliases: ['transferencias', 't6 transferencias', 't6_transferencias'] },
  { label: 'Categorías Gastos',      key: 'categoriasGastosSourceId',   aliases: ['categorias gastos', 'categorias de gastos', 't7 categorias gastos', 't7_categorias_gastos'] },
  { label: 'Categorías Ingreso',     key: 'categoriasIngresoSourceId',  aliases: ['categorias ingreso', 'categorias de ingreso', 't8 categorias ingreso', 't8_categorias_ingreso'] },
  { label: 'Préstamos',              key: 'prestamosSourceId',          aliases: ['prestamos', 'prestamo', 't9 prestamos', 't9_prestamos'] },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function autoMap(databases: DataSource[]): { mapped: Record<string, string>; missing: string[] } {
  const mapped: Record<string, string> = {};
  const missing: string[] = [];
  for (const { label, key, aliases } of SOURCE_MAP) {
    const match = databases.find(db => {
      const n = normalize(db.name);
      return aliases.some(alias => {
        const a = normalize(alias);
        return n === a || n.startsWith(a + ' ') || n.startsWith(a + '-');
      });
    });
    if (match) mapped[key] = match.id;
    else missing.push(label);
  }
  return { mapped, missing };
}

// ── Helpers de UI ───────────────────────────────────────────────────────────
function formatWhen(mins: number): string {
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)} h`;
}

function getSyncLabel(lastSync: string | null, nowMs: number, loaded: boolean, tok: string | null): string {
  if (loaded && tok === null) return 'Sin token — configura tu token primero';
  if (lastSync === null) return 'Sin sincronizar';
  if (nowMs === 0) return 'Sincronizado';
  const mins = Math.floor((nowMs - new Date(lastSync).getTime()) / 60000);
  return `Sincronizado ${formatWhen(mins)}`;
}

function getErrorLabel(failCnt: number): string {
  const s = failCnt !== 1 ? 's' : '';
  return `${failCnt} tabla${s} no sincronizada${s}`;
}

type TokStatus = 'idle' | 'ok' | 'error';
type TokPhase  = 'idle' | 'saving' | 'detecting' | 'syncing' | 'ok' | 'error';

function readLastSync(): string | null {
  if (typeof globalThis.window === 'undefined') return null;
  return globalThis.window.localStorage.getItem(lsKey());
}

export function NotionSyncSettings({ theme, canWrite = true }: Readonly<{ theme: SettingsTheme; canWrite?: boolean }>) {
  const [syncing,      setSyncing]      = React.useState(false);
  const [failCnt,      setFailCnt]      = React.useState(0);
  const [lastSync,     setLastSync]     = React.useState<string | null>(readLastSync);
  const [token,        setToken]        = React.useState('');
  const [maskedTok,    setMaskedTok]    = React.useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = React.useState(false);
  const [tokStatus,    setTokStatus]    = React.useState<TokStatus>('idle');
  const [tokPhase,     setTokPhase]     = React.useState<TokPhase>('idle');
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [nowMs,        setNowMs]        = React.useState(0);
  const [runs,         setRuns]         = React.useState<SyncRun[]>([]);
  const [runsLoaded,   setRunsLoaded]   = React.useState(false);

  // Estado de tablas
  const [showTables,   setShowTables]   = React.useState(false);
  const [detecting,    setDetecting]    = React.useState(false);
  const [detectMsg,    setDetectMsg]    = React.useState('');
  const [missingTabs,  setMissingTabs]  = React.useState<string[]>([]);
  const [mappedKeys,   setMappedKeys]   = React.useState<Record<string, string>>({});

  // Carga config inicial
  React.useEffect(() => {
    notionPaymentsService.getConfig()
      .then((cfg) => {
        if (cfg?.notionTokenMasked) setMaskedTok(cfg.notionTokenMasked);
        // Reconstruir mappedKeys desde la config
        const loaded: Record<string, string> = {};
        SOURCE_MAP.forEach(({ key }) => {
          const val = (cfg as Record<string, unknown>)?.[key];
          if (typeof val === 'string' && val) loaded[key] = val;
        });
        setMappedKeys(loaded);
        // Calcular tablas faltantes a partir de lo cargado
        const missing = SOURCE_MAP.filter(({ key }) => !loaded[key]).map(({ label }) => label);
        setMissingTabs(missing);
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

  // Detecta tablas de Notion y guarda los IDs; devuelve cuántas se configuraron. Lanza si falla la API.
  async function detectTables(): Promise<number> {
    setDetecting(true); setDetectMsg('');
    try {
      const databases = await notionPaymentsService.getDatabases();
      if (databases.length === 0) {
        setDetectMsg('No se encontraron bases de datos en Notion.');
        return 0;
      }
      const { mapped, missing } = autoMap(databases);

      // Guardar lo que se encontró
      await notionPaymentsService.saveConfig({
        ingresosSourceId:          mapped.ingresosSourceId          ?? null,
        gastosUnicosSourceId:      mapped.gastosUnicosSourceId      ?? null,
        gastosDeudasSourceId:      mapped.gastosDeudasSourceId      ?? null,
        deudasSourceId:            mapped.deudasSourceId            ?? null,
        cuentasBancariasSourceId:  mapped.cuentasBancariasSourceId  ?? null,
        transferenciasSourceId:    mapped.transferenciasSourceId    ?? null,
        categoriasGastosSourceId:  mapped.categoriasGastosSourceId  ?? null,
        categoriasIngresoSourceId: mapped.categoriasIngresoSourceId ?? null,
        prestamosSourceId:         mapped.prestamosSourceId         ?? null,
      });

      setMappedKeys(mapped);
      setMissingTabs(missing);

      const found = SOURCE_MAP.length - missing.length;
      setDetectMsg(
        missing.length === 0
          ? `${found} tablas detectadas y configuradas.`
          : `${found} tablas configuradas. ${missing.length} no encontrada${missing.length !== 1 ? 's' : ''}.`
      );
      return found;
    } finally { setDetecting(false); }
  }

  async function runSyncAll(): Promise<void> {
    setSyncing(true); setFailCnt(0);
    try {
      const run = await notionPaymentsService.syncAll();
      setRuns(prev => [run, ...prev.slice(0, 19)]);
      const okCount  = run.tableResults.filter(r => r.status === 'ok').length;
      const errCount = run.tableResults.filter(r => r.status === 'error').length;
      setFailCnt(errCount);
      if (okCount > 0) {
        const now = new Date().toISOString();
        globalThis.window.localStorage.setItem(lsKey(), now);
        setLastSync(now);
        dispatchDataSynced();
      }
    } catch { setFailCnt(1); }
    finally { setSyncing(false); }
  }

  // Guardar token = conectar: guarda, detecta tablas y sincroniza en un solo flujo
  async function handleSaveToken() {
    const trimmed = token.trim();
    const busy = tokPhase === 'saving' || tokPhase === 'detecting' || tokPhase === 'syncing';
    if (!canWrite || !trimmed || busy) return;
    setTokStatus('idle'); setTokPhase('saving');
    try {
      const cfg = await notionPaymentsService.saveConfig({ notionToken: trimmed });
      if (cfg.notionTokenMasked) setMaskedTok(cfg.notionTokenMasked);
      setToken('');
      setTokPhase('detecting');
      const found = await detectTables();
      if (found > 0) {
        setTokPhase('syncing');
        await runSyncAll();
      }
      setTokPhase('ok'); setTokStatus('ok');
      globalThis.setTimeout(() => { setTokPhase('idle'); setTokStatus('idle'); }, 5000);
    } catch {
      setTokPhase('error'); setTokStatus('error');
      globalThis.setTimeout(() => { setTokPhase('idle'); setTokStatus('idle'); }, 5000);
    }
  }

  async function handleDisconnect() {
    if (!canWrite || disconnecting) return;
    setDisconnecting(true);
    try {
      await notionPaymentsService.disconnectToken();
      setMaskedTok(null);
      setToken('');
      setMappedKeys({});
      setMissingTabs([]);
      setShowTables(false);
      setFailCnt(0);
      setTokPhase('idle'); setTokStatus('idle');
      dispatchDataSynced();
    } catch { /* no-op */ }
    finally { setDisconnecting(false); }
  }

  async function handleDetect() {
    try { await detectTables(); }
    catch { setDetectMsg('Error al cargar bases de datos de Notion.'); }
  }

  async function handleSync() {
    if (!canWrite || !maskedTok) return;
    await runSyncAll();
  }

  const configuredCount = Object.keys(mappedKeys).length;
  const canSync = canWrite && maskedTok !== null;

  const statusLabel = !canWrite && configLoaded && maskedTok === null
    ? 'Solo lectura — sin token configurado'
    : syncing
    ? 'Sincronizando tablas…'
    : getSyncLabel(lastSync, nowMs, configLoaded, maskedTok);

  const syncDetail = maskedTok === null
    ? 'Configura tu token primero'
    : configuredCount === 0
    ? 'Detecta las tablas para importar datos'
    : `${configuredCount} tabla${configuredCount !== 1 ? 's' : ''} configurada${configuredCount !== 1 ? 's' : ''}`;

  const tokBusy = tokPhase === 'saving' || tokPhase === 'detecting' || tokPhase === 'syncing';
  const tokBtnDisabled = !token.trim() || tokBusy;

  const tokBtnLabel = tokPhase === 'saving'
    ? 'Guardando…'
    : tokPhase === 'detecting'
    ? 'Detectando tablas…'
    : tokPhase === 'syncing'
    ? 'Sincronizando…'
    : tokStatus === 'ok'
    ? '✓ Sincronizado'
    : tokStatus === 'error'
    ? 'Error'
    : 'Guardar y sincronizar';

  const tokDetail = tokPhase === 'saving'
    ? 'Paso 1 de 3 — Guardando token…'
    : tokPhase === 'detecting'
    ? 'Paso 2 de 3 — Detectando tablas de Notion…'
    : tokPhase === 'syncing'
    ? 'Paso 3 de 3 — Sincronizando datos…'
    : tokPhase === 'ok'
    ? 'Conectado y sincronizado correctamente'
    : tokPhase === 'error'
    ? 'No se pudo completar — verifica el token'
    : maskedTok ?? 'Pega tu token y se sincronizará todo automáticamente';

  const tokBtnStyle: React.CSSProperties = {
    height: 38, padding: '0 12px', borderRadius: 8,
    border: `1px solid ${tokStatus === 'ok' ? `${C.pos}30` : tokStatus === 'error' ? 'rgba(200,60,60,0.3)' : theme.border}`,
    background: tokStatus === 'ok' ? `${C.pos}12` : tokStatus === 'error' ? 'rgba(200,60,60,0.08)' : theme.surfaceMuted,
    color: tokStatus === 'ok' ? C.pos : tokStatus === 'error' ? C.neg : theme.text,
    cursor: tokBtnDisabled ? 'default' : 'pointer', opacity: tokBtnDisabled ? 0.55 : 1,
    fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12, fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  };

  const syncBtnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 8, border: 'none',
    background: canSync && !syncing ? C.primary : theme.border,
    color: canSync && !syncing ? '#fff' : theme.muted,
    cursor: canSync && !syncing ? 'pointer' : 'default',
    display: 'inline-flex', alignItems: 'center', gap: 7,
    fontFamily: 'var(--font-ui), system-ui, sans-serif', fontSize: 12.5, fontWeight: 800,
  };

  return (
    <>
      <SettingsInfoRow label="Estado" value={statusLabel} theme={theme} />
      {failCnt > 0 && !syncing && (
        <SettingsInfoRow label="Errores" value={getErrorLabel(failCnt)} theme={theme} />
      )}
      {missingTabs.length > 0 && configLoaded && maskedTok !== null && (
        <SettingsInfoRow
          label="Tablas no encontradas"
          value={missingTabs.join(', ')}
          theme={theme}
        />
      )}

      {/* Token */}
      {canWrite ? (
        <SettingsActionRow
          label="Token de Notion"
          detail={tokDetail}
          theme={theme}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <button type="button" onClick={handleSaveToken} disabled={tokBtnDisabled} style={tokBtnStyle}>
                {tokBtnLabel}
              </button>
              {maskedTok !== null && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting || tokBusy}
                  style={{
                    height: 38, padding: '0 12px', borderRadius: 8,
                    border: '1px solid rgba(200,60,60,0.35)',
                    background: 'rgba(200,60,60,0.06)',
                    color: '#c83c3c',
                    cursor: disconnecting || tokBusy ? 'default' : 'pointer',
                    opacity: disconnecting || tokBusy ? 0.6 : 1,
                    fontFamily: 'var(--font-ui), system-ui, sans-serif',
                    fontSize: 12, fontWeight: 700,
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {disconnecting ? 'Desconectando…' : 'Desconectar'}
                </button>
              )}
            </div>
          }
        />
      ) : (
        <SettingsInfoRow label="Token de Notion" value={maskedTok ?? 'Sin token guardado'} theme={theme} />
      )}

      {/* ── Tablas de Notion (expandible) ─────────────────────────────────── */}
      {maskedTok !== null && (
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
          {/* Cabecera expandible */}
          <button
            type="button"
            onClick={() => setShowTables(v => !v)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 0, fontFamily: 'var(--font-ui), system-ui, sans-serif',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.text }}>
                Tablas de Notion
              </div>
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                {configuredCount === 0
                  ? 'Sin tablas detectadas — pulsa para configurar'
                  : `${configuredCount} de ${SOURCE_MAP.length} tablas configuradas`}
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: theme.surfaceMuted,
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              transition: 'transform 0.2s',
              transform: showTables ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              <Icon.arrowDown size={13} strokeWidth={2.5} />
            </div>
          </button>

          {/* Panel expandido */}
          {showTables && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Botón detectar */}
              {canWrite && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleDetect}
                    disabled={detecting}
                    style={{
                      height: 34, padding: '0 14px', borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.surfaceMuted, color: theme.text,
                      cursor: detecting ? 'default' : 'pointer',
                      opacity: detecting ? 0.6 : 1,
                      fontFamily: 'var(--font-ui), system-ui, sans-serif',
                      fontSize: 12, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Icon.refresh size={13} />
                    {detecting ? 'Detectando...' : 'Detectar automáticamente'}
                  </button>
                  {detectMsg && (
                    <span style={{ fontSize: 12, color: theme.muted }}>{detectMsg}</span>
                  )}
                </div>
              )}

              {/* Lista de tablas con estado */}
              <div style={{
                border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden',
              }}>
                {SOURCE_MAP.map(({ label, key }, i) => {
                  const isMapped = Boolean(mappedKeys[key]);
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 14px',
                        borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                        fontFamily: 'var(--font-ui), system-ui, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>
                        {label}
                      </span>
                      {isMapped ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11.5, fontWeight: 600, color: C.pos,
                          background: `${C.pos}12`,
                          border: `1px solid ${C.pos}28`,
                          borderRadius: 20, padding: '2px 9px',
                        }}>
                          <Icon.check size={11} strokeWidth={2.5} />
                          Configurada
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11.5, fontWeight: 600, color: '#d97706',
                          background: 'rgba(217,119,6,0.08)',
                          border: '1px solid rgba(217,119,6,0.25)',
                          borderRadius: 20, padding: '2px 9px',
                        }}>
                          <Icon.sparkles size={11} />
                          No encontrada
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sincronización ─────────────────────────────────────────────────── */}
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
              style={syncBtnStyle}
            >
              <RefreshIcon size={14} />
              {syncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          }
        />
      ) : (
        <SettingsInfoRow label="Sincronizacion" value={syncDetail} theme={theme} />
      )}

      {/* ── Historial ─────────────────────────────────────────────────────── */}
      {runsLoaded && runs.length > 0 && (
        <div style={{ padding: '10px 0 4px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
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
              const dot    = allOk ? C.pos : hasErr ? C.neg : theme.muted;
              const when   = run.startedAt ? new Date(run.startedAt).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              }) : 'Pendiente';
              const summary = allOk
                ? `${okCnt} tablas sincronizadas`
                : `${okCnt} ok · ${errCnt} error${errCnt !== 1 ? 'es' : ''}`;
              return (
                <div key={run.id} style={{
                  display: 'grid', gridTemplateColumns: '8px 1fr auto auto',
                  alignItems: 'center', gap: 10, padding: '7px 12px',
                  borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                  background: i % 2 === 0 ? 'transparent' : `${theme.border}22`,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'block' }} />
                  <span style={{ fontSize: 12, color: theme.text }}>{summary}</span>
                  <span style={{ fontSize: 11, color: theme.muted, whiteSpace: 'nowrap' as const }}>{when}</span>
                  {canWrite && hasErr && (
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      style={{
                        height: 24, padding: '0 8px', borderRadius: 6,
                        border: `1px solid ${theme.border}`,
                        background: 'transparent', color: C.primary,
                        cursor: syncing ? 'default' : 'pointer',
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
