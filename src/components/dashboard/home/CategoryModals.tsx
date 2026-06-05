'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CategoriaRow } from '@/shared/types/finance.types';

export type CatRow = CategoriaRow;

// ── Categorias Modal (Ver tabla) ──────────────────────────────────────────
export function CategoriasModal({ onClose, canWrite = true }: Readonly<{ onClose: () => void; canWrite?: boolean }>) {
  const [gastos,   setGastos]   = React.useState<CatRow[]>([]);
  const [ingresos, setIngresos] = React.useState<CatRow[]>([]);
  const [loading,  setLoading]  = React.useState(true);
  const [tab, setTab] = React.useState<'egreso' | 'ingreso'>('egreso');

  React.useEffect(() => {
    Promise.all([
      notionPaymentsService.getCategoriasGastos(),
      notionPaymentsService.getCategoriasIngreso(),
    ]).then(([g, i]) => { setGastos(g); setIngresos(i); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  const rows     = tab === 'egreso' ? gastos : ingresos;
  const totalEgr = gastos.reduce((s, r) => s + (r.gastosPorDeuda ?? 0) + (r.gastosUnicos ?? 0), 0);
  const totalIng = ingresos.reduce((s, r) => s + (r.ingresosTotales ?? 0), 0);
  const emptyMessage = canWrite ? 'Sin categorias. Sincroniza desde Ajustes.' : 'Sin categorias para mostrar.';

  return (
    <ModalShell onClose={onClose} maxWidth={780} zIndex={300}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 780, maxHeight: '85vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui), system-ui, sans-serif', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.olive}18`, color: C.olive, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon.bag size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Categorías</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>{loading ? 'Cargando...' : `${gastos.length} egreso · ${ingresos.length} ingreso`}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar categorias" style={{ width: 34, height: 34, borderRadius: 8, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 20, fontFamily: 'system-ui', fontWeight: 300, flexShrink: 0 }}>×</button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: 24, flexShrink: 0 }}>
          {([
            { id: 'egreso'  as const, label: 'Categorías Egreso',  count: gastos.length,   total: totalEgr },
            { id: 'ingreso' as const, label: 'Categorías Ingreso', count: ingresos.length, total: totalIng },
          ]).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.text : C.textMute, borderBottom: `2px solid ${active ? C.olive : 'transparent'}`, marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                <span style={{ fontSize: 11, background: active ? `${C.olive}20` : C.border, color: active ? C.olive : C.textMute, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>{t.count}</span>
                {!loading && <span style={{ fontSize: 11, color: active ? C.olive : C.textMute, fontVariantNumeric: 'tabular-nums' }}>S/ {t.total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>}
              </button>
            );
          })}
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
          {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>}
          {!loading && rows.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>{emptyMessage}</div>}
          {!loading && rows.length > 0 && (
            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(63,86,28,0.04)' }}>
                    {['#', 'Nombre', 'Tipo', tab === 'egreso' ? 'Por Deuda' : 'Ingresos', tab === 'egreso' ? 'Gastos Únicos' : '', 'Total'].filter(Boolean).map((h, hi) => (
                      <th key={h} style={{ padding: hi === 0 ? '10px 12px' : '10px 16px', textAlign: hi === 0 ? 'center' : 'left', fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const bb    = i < rows.length - 1 ? `1px solid ${C.border}` : 'none';
                    const total = tab === 'egreso'
                      ? (row.gastosPorDeuda ?? 0) + (row.gastosUnicos ?? 0)
                      : (row.ingresosTotales ?? 0);
                    return (
                      <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(63,86,28,0.012)' }}>
                        <td style={{ padding: '12px', textAlign: 'center', color: C.textMute, fontSize: 11.5, borderBottom: bb }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text, borderBottom: bb }}>{row.nombre || '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.textDim, borderBottom: bb }}>
                          {row.tipo ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: `${C.olive}10`, border: `1px solid ${C.olive}25`, fontSize: 11.5, color: C.olive, fontWeight: 600 }}>{row.tipo}</span> : '—'}
                        </td>
                        {tab === 'egreso' ? <>
                          <td style={{ padding: '12px 16px', color: C.neg, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>{row.gastosPorDeuda != null ? `S/ ${row.gastosPorDeuda.toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : '—'}</td>
                          <td style={{ padding: '12px 16px', color: C.warn, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>{row.gastosUnicos != null ? `S/ ${row.gastosUnicos.toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : '—'}</td>
                        </> : <td style={{ padding: '12px 16px', color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>{row.ingresosTotales != null ? `S/ ${row.ingresosTotales.toLocaleString('es-PE', { minimumFractionDigits: 0 })}` : '—'}</td>}
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', borderBottom: bb, whiteSpace: 'nowrap' }}>S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ── New Categoria Modal ───────────────────────────────────────────────────
export function NewCategoriaModal({ onClose, onSuccess, defaultTab }: Readonly<{ onClose: () => void; onSuccess: () => void; defaultTab?: 'egreso' | 'ingreso' }>) {
  const [nombre,  setNombre]  = React.useState('');
  const [tipo,    setTipo]    = React.useState('');
  const [catTab,  setCatTab]  = React.useState<'egreso' | 'ingreso'>(defaultTab ?? 'egreso');
  const [status,  setStatus]  = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg,  setErrMsg]  = React.useState('');

  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const body = { nombre: nombre.trim(), tipo: tipo.trim() };
      if (catTab === 'egreso') await notionPaymentsService.createCategoriaGasto(body);
      else await notionPaymentsService.createCategoriaIngreso(body);
      setStatus('ok'); onSuccess(); setTimeout(onClose, 900);
    } catch (err: unknown) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Error al crear la categoría');
    }
  }

  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 440, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.olive}18`, color: C.olive, display: 'grid', placeItems: 'center' }}><Icon.bag size={17} strokeWidth={2} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nueva Categoría</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>Se guarda en la base de datos local</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Toggle egreso/ingreso */}
          <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {(['egreso', 'ingreso'] as const).map(t => (
              <button key={t} type="button" onClick={() => setCatTab(t)} style={{ flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: catTab === t ? 700 : 400, background: catTab === t ? C.olive : 'transparent', color: catTab === t ? '#fff' : C.textMute, transition: 'all .15s' }}>
                {t === 'egreso' ? 'Egreso' : 'Ingreso'}
              </button>
            ))}
          </div>
          <label style={{ display: 'grid', gap: 6 }}><span style={{ fontSize: 11.5, color: C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Nombre</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Alimentación" style={inp} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span style={{ fontSize: 11.5, color: C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Tipo <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></span><input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ej. Variable, Fijo..." style={inp} /></label>
          {errMsg && <div style={{ fontSize: 12, color: C.neg }}>{errMsg}</div>}
          {status === 'ok' && <div style={{ fontSize: 12, color: C.pos }}>Categoría creada correctamente.</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.textDim, fontFamily: 'var(--font-ui)', fontSize: 13 }}>Cancelar</button>
            <button type="submit" disabled={status === 'loading'} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: C.olive, color: '#fff', cursor: status === 'loading' ? 'wait' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700 }}>{status === 'loading' ? 'Creando...' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
