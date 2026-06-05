'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { NOTION_SYNC_ENDPOINTS, notionPaymentsService } from '@/shared/services/notion-payments.service';
import { NotionDataModal, type NSCat, type NSCta, type NSDeu, type NSGasD, type NSGasU, type NSIng, type NSPre, type NSTrf } from './NotionDataModal';
import { getActiveWorkspace } from '@/shared/services/workspace.service';

const lsKey = () => `notion_last_sync_${getActiveWorkspace() ?? 'default'}`;

export function NotionSync({ darkMode = false, canWrite = true }: Readonly<{ darkMode?: boolean; canWrite?: boolean }>) {
  const [hovered, setHovered] = React.useState(false);
  const [syncing,    setSyncing]    = React.useState(false);
  const [done,       setDone]       = React.useState(0);
  const [failCnt,    setFailCnt]    = React.useState(0);
  const [lastSync,   setLastSync]   = React.useState<string|null>(() => typeof window !== 'undefined' ? localStorage.getItem(lsKey()) : null);
  const [token,      setToken]      = React.useState('');
  const [maskedTok,    setMaskedTok]    = React.useState<string|null>(null);
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [configLoaded, setConfigLoaded] = React.useState(false);
  const [savingTok,  setSavingTok]  = React.useState(false);
  const [tokStatus,  setTokStatus]  = React.useState<'idle'|'ok'|'error'>('idle');
  const [modalOpen,  setModalOpen]  = React.useState(false);
  const [dataLoading,setDataLoading]= React.useState(false);
  const [ingresos,   setIngresos]   = React.useState<NSIng[]>([]);
  const [gastosU,    setGastosU]    = React.useState<NSGasU[]>([]);
  const [gastosD,    setGastosD]    = React.useState<NSGasD[]>([]);
  const [deudas,     setDeudas]     = React.useState<NSDeu[]>([]);
  const [cuentas,    setCuentas]    = React.useState<NSCta[]>([]);
  const [transf,     setTransf]     = React.useState<NSTrf[]>([]);
  const [catGastos,  setCatGastos]  = React.useState<NSCat[]>([]);
  const [catIngreso, setCatIngreso] = React.useState<NSCat[]>([]);
  const [prestamos,  setPrestamos]  = React.useState<NSPre[]>([]);
  const [nowMs,      setNowMs]      = React.useState(0);


  React.useEffect(() => {
    notionPaymentsService.getConfig()
      .then((d: { notionTokenMasked?: string|null; isConfigured?: boolean }|null) => {
        if (d?.notionTokenMasked) setMaskedTok(d.notionTokenMasked);
        setIsConfigured(Boolean(d?.isConfigured));
        setConfigLoaded(true);
      })
      .catch(() => { setConfigLoaded(true); });
  }, []);

  async function loadData() {
    setDataLoading(true);
    try {
      const data = await notionPaymentsService.getSyncedData();
      setIngresos(data.ingresos);
      setGastosU(data.gastosU);
      setGastosD(data.gastosD);
      setDeudas(data.deudas);
      setCuentas(data.cuentas.map(c => ({ ...c, saldo: c.saldo ?? c.balance ?? null })));
      setTransf(data.transf.map(t => ({ ...t, notas: t.notas ?? '' })));
      setCatGastos(data.catGastos);
      setCatIngreso(data.catIngreso);
      setPrestamos(data.prestamos);
    } catch { /* silencioso */ }
    finally { setDataLoading(false); }
  }

  async function handleSaveToken() {
    if (!canWrite || !token.trim()) return;
    setSavingTok(true); setTokStatus('idle');
    try {
      const d = await notionPaymentsService.saveConfig({ notionToken: token });
      if (d.notionTokenMasked) setMaskedTok(d.notionTokenMasked);
      setIsConfigured(Boolean(d.isConfigured));
      setToken(''); setTokStatus('ok');
      setTimeout(() => setTokStatus('idle'), 3000);
    } catch { setTokStatus('error'); setTimeout(() => setTokStatus('idle'), 3000); }
    finally { setSavingTok(false); }
  }

  async function handleSync() {
    if (!canWrite || !isConfigured) return;
    setSyncing(true); setDone(0); setFailCnt(0);
    let ok = 0; let err = 0;
    await Promise.allSettled(
      NOTION_SYNC_ENDPOINTS.map(ep =>
        notionPaymentsService.sync(ep)
          .then(() => { ok++; setDone(ok); })
          .catch(() => { err++; setFailCnt(err); })
      )
    );
    if (ok > 0) {
      const now = new Date().toISOString();
      localStorage.setItem(lsKey(), now);
      setLastSync(now);
      dispatchDataSynced();
    }
    setSyncing(false);
  }

  React.useEffect(() => {
    if (!lastSync || syncing) return;
    const timeoutId = window.setTimeout(() => setNowMs(Date.now()), 0);
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [lastSync, syncing]);

  const subtitle = React.useMemo(() => {
    if (syncing) return `Sincronizando... ${done}/${NOTION_SYNC_ENDPOINTS.length} tablas`;
    if (!canWrite && configLoaded && !maskedTok) return 'Solo lectura. La sincronizacion la gestiona el dueno o editor';
    if (!canWrite && configLoaded && maskedTok && !isConfigured) return 'Solo lectura. Las tablas se configuran desde una cuenta con permisos';
    if (configLoaded && !maskedTok) return 'Configura tu token de Notion para sincronizar';
    if (configLoaded && maskedTok && !isConfigured) return 'Configura las tablas en Ajustes para sincronizar';
    if (!lastSync) return 'Sin sincronizar aún';
    if (!nowMs) return `Última sync registrada — ${NOTION_SYNC_ENDPOINTS.length} tablas`;
    const mins = Math.floor((nowMs - new Date(lastSync).getTime()) / 60000);
    const when = mins < 1 ? 'hace un momento' : mins < 60 ? `hace ${mins} min` : `hace ${Math.floor(mins / 60)} h`;
    return `Última sync ${when} — ${NOTION_SYNC_ENDPOINTS.length} tablas`;
  }, [canWrite, configLoaded, done, isConfigured, lastSync, maskedTok, nowMs, syncing]);

  const totalRec = ingresos.length + gastosU.length + gastosD.length + deudas.length + cuentas.length + transf.length + catGastos.length + catIngreso.length + prestamos.length;

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 22,
          background: darkMode ? 'linear-gradient(145deg,#1A1D21,#16181C)' : '#FFFFFF',
          border: `1px solid ${hovered ? (darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)')}`,
          boxShadow: hovered ? (darkMode ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : (darkMode ? '0 4px 24px rgba(0,0,0,.4)' : '0 1px 2px rgba(17,24,39,.04)'),
          fontFamily: 'var(--font-ui),system-ui,sans-serif',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform .25s, box-shadow .25s, border-color .25s',
        }}>
        {/* Header estilo card */}
        <div style={{ display:'flex', alignItems:'center', height:42, padding:'0 16px', boxSizing:'border-box' }}>
          <span style={{ fontSize:15, lineHeight:1, fontWeight:900, marginRight:8 }}>📋</span>
          <span style={{ fontSize:12, fontWeight:800, color: darkMode ? 'rgba(255,255,255,0.38)' : C.textDim, letterSpacing:1.5, textTransform:'uppercase', fontFamily:'var(--font-ui),system-ui,sans-serif' }}>
            Sincronizar Notion
          </span>
        </div>

        <div style={{ padding:'0 16px 16px' }}>
          <div style={{ fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.32)' : C.textMute, fontWeight: 600 }}>
            {subtitle}
          </div>
          {failCnt > 0 && !syncing && (
            <div style={{ fontSize:10, color:C.neg, marginTop:6, marginBottom:8 }}>
              {failCnt} tabla{failCnt !== 1 ? 's' : ''} no sincronizada{failCnt !== 1 ? 's' : ''}
            </div>
          )}

        {/* Fila 2: acciones */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, flexWrap:'wrap' }}>
          <button
            onClick={() => { setModalOpen(true); if (totalRec===0) loadData(); }}
            style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'7px 12px', borderRadius:9, flexShrink:0,
              background:'transparent', color:C.textDim,
              border:`1px solid ${C.border}`, cursor:'pointer',
              fontSize:12, fontWeight:500,
              fontFamily:'var(--font-ui), system-ui, sans-serif',
            }}
          >
            <Icon.list size={13} />Ver datos
          </button>
          <button
            style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'7px 12px', borderRadius:9, flexShrink:0,
              background:'transparent', color:C.textDim,
              border:`1px solid ${C.border}`, cursor:'pointer',
              fontSize:12, fontWeight:500,
              fontFamily:'var(--font-ui), system-ui, sans-serif',
            }}
          >
            <Icon.download size={13} />Descargar
          </button>
          {canWrite && (
            <button
              onClick={handleSync}
              disabled={syncing || !isConfigured}
              style={{
                marginLeft:'auto',
                padding:'8px 16px', borderRadius:9, flexShrink:0,
                background:(syncing || !isConfigured)?C.border:C.primary,
                color:(syncing || !isConfigured)?C.textMute:'#fff',
                border:'none', cursor:(syncing || !isConfigured)?'default':'pointer',
                fontSize:12, fontWeight:600,
                fontFamily:'var(--font-ui), system-ui, sans-serif',
                transition:'background 0.2s',
              }}
            >
              {syncing ? `${done}/${NOTION_SYNC_ENDPOINTS.length}` : 'Sincronizar'}
            </button>
          )}
        </div>

        {/* Fila 2: token */}
        {canWrite && (
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:12 }}>
            <input
              type="password"
              placeholder={maskedTok ?? 'secret_xxxxxxxxxxxxxxxxxxxxxxxx'}
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') handleSaveToken(); }}
              style={{
                flex:1, padding:'7px 10px', borderRadius:8,
                border:`1px solid ${C.border}`, background:C.cardHi,
                fontFamily:'var(--font-ui)', fontSize:12, color:C.text, outline:'none',
              }}
            />
            <button
              onClick={handleSaveToken}
              disabled={!token.trim() || savingTok}
              style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'7px 12px', borderRadius:8, flexShrink:0, cursor:'pointer',
                fontFamily:'var(--font-ui)', fontSize:12, fontWeight:500,
                background: tokStatus==='ok' ? `${C.pos}12` : tokStatus==='error' ? 'rgba(200,60,60,0.08)' : 'transparent',
                color:       tokStatus==='ok' ? C.pos        : tokStatus==='error' ? C.neg               : C.textDim,
                border:     `1px solid ${tokStatus==='ok' ? `${C.pos}30` : tokStatus==='error' ? 'rgba(200,60,60,0.3)' : C.border}`,
                opacity: !token.trim() || savingTok ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {tokStatus==='ok' ? '✓ Guardado' : tokStatus==='error' ? 'Error' : savingTok ? '...' : 'Guardar token'}
            </button>
          </div>
        )}
        </div>
      </div>

      {modalOpen && (
        <NotionDataModal
          totalRec={totalRec}
          dataLoading={dataLoading}
          onClose={() => setModalOpen(false)}
          onRefresh={loadData}
          ingresos={ingresos}
          gastosU={gastosU}
          gastosD={gastosD}
          deudas={deudas}
          cuentas={cuentas}
          transf={transf}
          catGastos={catGastos}
          catIngreso={catIngreso}
          prestamos={prestamos}
        />
      )}
    </>
  );
}

// ── Tarjetas Card ────────────────────────────────────────────────────────
