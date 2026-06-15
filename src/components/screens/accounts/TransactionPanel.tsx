'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewIngresoModal } from '@/components/dashboard/home/NewIngresoModal';
import { NewGastoModal } from '@/components/dashboard/home/NewGastoModal';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { IngresoRow, TransferenciaRow } from '@/shared/types/finance.types';
import { DataTable, type Col } from './DataTable';
import type { AccountExpenseRow } from './types';
import { fmt, fmtDate } from './utils';

type TxTab = 'todas' | 'ingresos' | 'gastos' | 'transferencias';

function TransactionPanel({ cuentaNombre, ingresos, gastos, transferencias, showCuenta = false, canWrite = true, darkMode = false, onRefresh }: Readonly<{
  cuentaNombre: string | null;
  ingresos: IngresoRow[];
  gastos: AccountExpenseRow[];
  transferencias: TransferenciaRow[];
  showCuenta?: boolean;
  canWrite?: boolean;
  darkMode?: boolean;
  onRefresh?: () => void;
}>) {
  const D = darkMode;
  const brd = D ? 'rgba(255,255,255,0.08)' : C.border;
  const [tab,     setTab]     = React.useState<TxTab>('todas');
  const [search,  setSearch]  = React.useState('');
  const [showNewIngModal, setShowNewIngModal] = React.useState(false);
  const [showNewGasModal, setShowNewGasModal] = React.useState(false);
  const [editIngRow, setEditIngRow] = React.useState<IngresoRow | null>(null);
  const [editGasRow, setEditGasRow] = React.useState<import('./types').AccountExpenseRow | null>(null);
  const [hovIngBtn, setHovIngBtn] = React.useState(false);
  const [hovGasBtn, setHovGasBtn] = React.useState(false);
  const [deleting,  setDeleting]  = React.useState(false);

  // Resetear búsqueda al cambiar tab
  const changeTab = React.useCallback((nextTab: TxTab) => {
    setTab(nextTab);
    setSearch('');
  }, []);

  // Hoy y pasado primero (más reciente arriba); fechas futuras al final.
  // Mismo día → lo último registrado arriba.
  function byFechaDesc<T extends { fecha?: string | null; syncedAt?: string | null }>(data: T[]): T[] {
    const now = new Date();
    const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return [...data].sort((a, b) => {
      const af = (a.fecha ?? '').split('T')[0];
      const bf = (b.fecha ?? '').split('T')[0];
      const aFuturo = af > hoy;
      const bFuturo = bf > hoy;
      if (aFuturo !== bFuturo) return aFuturo ? 1 : -1;
      const cmp = bf.localeCompare(af);
      if (cmp !== 0) return aFuturo ? -cmp : cmp;
      return (b.syncedAt ?? '').localeCompare(a.syncedAt ?? '');
    });
  }

  const q = search.toLowerCase().trim();

  const totalIngresos       = ingresos.reduce((s, r) => s + (r.ingreso ?? 0), 0);
  const totalGastos         = gastos.reduce((s, r) => s + (r.monto ?? 0), 0);
  const totalTransferencias = transferencias.reduce((s, r) => s + (r.monto ?? 0), 0);
  const neto                = totalIngresos - totalGastos;

  const visibleIng   = byFechaDesc(q ? ingresos.filter(r => r.nombre?.toLowerCase().includes(q))       : ingresos);
  const visibleGas   = byFechaDesc(q ? gastos.filter(r => r.nombre?.toLowerCase().includes(q))         : gastos);
  const visibleTrans = byFechaDesc(q ? transferencias.filter(r => r.nombre?.toLowerCase().includes(q)) : transferencias);

  // Todas: combinadas y ordenadas por fecha desc
  type UnifiedTx = { _tipo: 'ingreso' | 'gasto' | 'transferencia'; nombre: string | null; fecha: string | null; monto: number; categoria: string | null; cuenta: string | null; id: string; syncedAt?: string | null };
  const allTxRaw: UnifiedTx[] = [
    ...ingresos.map(r => ({ _tipo: 'ingreso' as const, nombre: r.nombre ?? null, fecha: r.fecha ?? null, monto: r.ingreso ?? 0, categoria: r.categoriaIngreso ?? null, cuenta: r.cuentaBancaria ?? null, id: r.id, syncedAt: r.syncedAt })),
    ...gastos.map(r => ({ _tipo: 'gasto' as const, nombre: r.nombre ?? null, fecha: r.fecha ?? null, monto: r.monto ?? 0, categoria: r.categoriaGasto ?? null, cuenta: r.cuentaBancaria ?? null, id: r.id, syncedAt: r.syncedAt })),
    ...transferencias.map(r => ({ _tipo: 'transferencia' as const, nombre: r.nombre ?? null, fecha: r.fecha ?? null, monto: r.monto ?? 0, categoria: null, cuenta: r.cuentaOrigen ?? null, id: r.id, syncedAt: r.syncedAt })),
  ];
  const visibleAll = byFechaDesc(
    q ? allTxRaw.filter(r => r.nombre?.toLowerCase().includes(q)) : allTxRaw,
  );

  function handleEditIngreso(i: number) { setEditIngRow(visibleIng[i] ?? null); }
  function handleEditGasto(i: number)   { setEditGasRow(visibleGas[i] ?? null); }

  async function handleDeleteIngreso(i: number) {
    const row = visibleIng[i];
    if (!row || deleting) return;
    if (!confirm(`¿Eliminar el ingreso "${row.nombre || 'sin nombre'}"? También se archivará en Notion.`)) return;
    setDeleting(true);
    try {
      await notionPaymentsService.deleteIngreso(row.id);
      dispatchDataSynced();
      onRefresh?.();
    } catch { /* el refresh mostrará el estado real */ }
    finally { setDeleting(false); }
  }

  async function handleDeleteGasto(i: number) {
    const row = visibleGas[i];
    if (!row || deleting) return;
    if (!confirm(`¿Eliminar el gasto "${row.nombre || 'sin nombre'}"? También se archivará en Notion.`)) return;
    setDeleting(true);
    try {
      if (row.origen === 'deuda') await notionPaymentsService.deleteGastoDeuda(row.id);
      else await notionPaymentsService.deleteGastoUnico(row.id);
      dispatchDataSynced();
      onRefresh?.();
    } catch { /* el refresh mostrará el estado real */ }
    finally { setDeleting(false); }
  }

  const TABS: { id: TxTab; label: string; count: number; total: number; color: string }[] = [
    { id: 'todas',          label: 'Transacciones',  count: visibleAll.length,   total: totalIngresos - totalGastos, color: C.primary },
    { id: 'ingresos',       label: 'Ingresos',       count: visibleIng.length,   total: totalIngresos,               color: C.pos  },
    { id: 'gastos',         label: 'Gastos',         count: visibleGas.length,   total: totalGastos,                 color: C.neg  },
    { id: 'transferencias', label: 'Transferencias', count: visibleTrans.length, total: totalTransferencias,         color: C.goal },
  ];

  const tipoColors: Record<string, string> = { ingreso: C.pos, gasto: C.neg, transferencia: C.goal };
  const tipoLabels: Record<string, string> = { ingreso: 'Ingreso', gasto: 'Gasto', transferencia: 'Transferencia' };

  const chip = (text: string, color: string): React.ReactNode => text === '—' ? <span style={{ color: C.textMute }}>—</span> : (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}10`, color, border: `1px solid ${color}22`, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );

  const colsTodas: Col[] = [
    { key: 'tipo',      label: 'Tipo',        width: 130,                          sortField: '_tipo'     },
    { key: 'nombre',    label: 'Descripción', width: 220, separator: true,         sortField: 'nombre'    },
    { key: 'categoria', label: 'Categoría',   width: 160,                          sortField: 'categoria' },
    { key: 'fecha',     label: 'Fecha',       width: 80,  align: 'right' as const, sortField: 'fecha'     },
    { key: 'monto',     label: 'Monto',       width: 120, align: 'right' as const, sortField: 'monto'     },
  ];
  const rowsTodas = visibleAll.map(r => {
    const color = tipoColors[r._tipo] ?? C.primary;
    const signo = r._tipo === 'ingreso' ? '+' : r._tipo === 'gasto' ? '−' : '';
    return {
      tipo:      chip(tipoLabels[r._tipo] ?? r._tipo, color),
      nombre:    <span style={{ fontSize: 13, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>{r.nombre || '—'}</span>,
      categoria: chip(r.categoria || '—', color),
      fecha:     <span style={{ color: D ? 'rgba(255,255,255,0.50)' : C.textDim, fontSize: 12 }}>{fmtDate(r.fecha)}</span>,
      monto:     <span style={{ color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{signo}{fmt(r.monto)}</span>,
    };
  });

  const colsIng: Col[] = [
    { key: 'nombre',    label: 'Descripción', separator: !showCuenta, sortField: 'nombre',           width: 220 },
    ...(showCuenta ? [{ key: 'cuenta', label: 'Cuenta', separator: true, sortField: 'cuentaBancaria', width: 150 } as Col] : []),
    { key: 'categoria', label: 'Categoría',                    sortField: 'categoriaIngreso',        width: 160 },
    { key: 'fecha',     label: 'Fecha',  align: 'right' as const, width: 80,  sortField: 'fecha' },
    { key: 'monto',     label: 'Monto',  align: 'right' as const, width: 110, sortField: 'ingreso' },
  ];
  const rowsIng = visibleIng.map(r => ({
    nombre:    <span style={{ fontSize: 13, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>{r.nombre || '—'}</span>,
    cuenta:    chip(r.cuentaBancaria || '—', C.info),
    categoria: chip(r.categoriaIngreso || '—', C.pos),
    fecha:     <span style={{ color: D ? 'rgba(255,255,255,0.50)' : C.textDim, fontSize: 12 }}>{fmtDate(r.fecha)}</span>,
    monto:     <span style={{ color: C.pos, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>+{fmt(r.ingreso ?? 0)}</span>,
  }));

  const colsGas: Col[] = [
    { key: 'nombre',    label: 'Descripción', separator: !showCuenta, sortField: 'nombre',           width: 220 },
    ...(showCuenta ? [{ key: 'cuenta', label: 'Cuenta', separator: true, sortField: 'cuentaBancaria', width: 150 } as Col] : []),
    { key: 'categoria', label: 'Categoría',                    sortField: 'categoriaGasto',          width: 160 },
    { key: 'fecha',     label: 'Fecha',  align: 'right' as const, width: 80,  sortField: 'fecha' },
    { key: 'monto',     label: 'Monto',  align: 'right' as const, width: 110, sortField: 'monto' },
  ];
  const rowsGas = visibleGas.map(r => ({
    nombre:    <span style={{ fontSize: 13, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>{r.nombre || '—'}</span>,
    cuenta:    chip(r.cuentaBancaria || '—', C.info),
    categoria: (
      <span style={{ display: 'inline-flex', gap: 4 }}>
        {chip(r.categoriaGasto || '—', C.neg)}
        {r.origen === 'deuda' && r.cualDeuda ? chip(r.cualDeuda, C.warn) : null}
      </span>
    ),
    fecha:     <span style={{ color: D ? 'rgba(255,255,255,0.50)' : C.textDim, fontSize: 12 }}>{fmtDate(r.fecha)}</span>,
    monto:     <span style={{ color: C.neg, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>−{fmt(r.monto ?? 0)}</span>,
  }));

  const colsTrans: Col[] = [
    { key: 'nombre', label: 'Descripción', separator: true, sortField: 'nombre', width: 200 },
    { key: 'desde',  label: 'Desde',                        sortField: 'cuentaOrigen',  width: 150 },
    { key: 'hacia',  label: 'Hacia',                        sortField: 'cuentaDestino', width: 150 },
    { key: 'fecha',  label: 'Fecha',  align: 'right', width: 80,  sortField: 'fecha' },
    { key: 'monto',  label: 'Monto',  align: 'right', width: 110, sortField: 'monto' },
  ];
  const rowsTrans = visibleTrans.map(r => ({
    nombre: <span style={{ fontSize: 13, fontWeight: 600, color: D ? 'rgba(255,255,255,0.88)' : C.text }}>{r.nombre || '—'}</span>,
    desde:  chip(r.cuentaOrigen  || '—', C.goal),
    hacia:  chip(r.cuentaDestino || '—', C.info),
    fecha:  <span style={{ color: D ? 'rgba(255,255,255,0.50)' : C.textDim, fontSize: 12 }}>{fmtDate(r.fecha)}</span>,
    monto:  <span style={{ color: C.goal, fontWeight: 700, fontSize: 13 }}>{fmt(r.monto ?? 0)}</span>,
  }));

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="fz-tab-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header con título y stats */}
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${brd}`, flexShrink: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: D ? 'rgba(255,255,255,0.88)' : C.text, letterSpacing: -0.4 }}>
            {cuentaNombre ?? 'Todas las cuentas'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 4 }}>
            Movimientos de {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
            {' · '}{ingresos.length + gastos.length + transferencias.length} en total
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Ingresos', value: '+' + fmt(totalIngresos), color: C.pos },
            { label: 'Gastos',   value: '−' + fmt(totalGastos),   color: C.neg },
            { label: 'Neto',     value: (neto >= 0 ? '+' : '−') + fmt(Math.abs(neto)), color: neto >= 0 ? C.pos : C.neg },
          ].map(s => (
            <div key={s.label} style={{
              padding: '14px 18px', borderRadius: 14,
              background: D ? `${s.color}14` : `${s.color}08`,
              border: `1px solid ${s.color}${D ? '40' : '22'}`,
              boxShadow: `0 1px 3px ${s.color}10`,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + buscador */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 12, flexShrink: 0,
        padding: '12px 32px 0',
        borderBottom: `1px solid ${brd}`,
      }}>
        <div style={{ '--color-primary': D ? '#C6AC8F' : '#8C6F4E' } as React.CSSProperties}>
          <Tabs value={tab} onValueChange={(v) => changeTab(v as TxTab)}>
            <TabsList
              className="h-auto rounded-none bg-transparent p-0 border-none"
            >
              {TABS.map(t => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="relative rounded-none py-2 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary hover:bg-transparent"
                  style={{
                    fontSize: 12, fontWeight: 700,
                    color: tab === t.id
                      ? (D ? '#C6AC8F' : '#8C6F4E')
                      : (D ? 'rgba(255,255,255,0.45)' : C.textDim),
                    fontFamily: 'var(--font-ui), system-ui, sans-serif',
                  }}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {canWrite && (
            <>
              <button
                onClick={() => setShowNewIngModal(true)}
                onMouseEnter={() => setHovIngBtn(true)}
                onMouseLeave={() => setHovIngBtn(false)}
                style={{
                  height: 32, padding: '0 14px',
                  display: 'flex', alignItems: 'center', gap: 5,
                  borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)',
                  border: `1px solid ${C.pos}${hovIngBtn ? 'cc' : '55'}`,
                  background: hovIngBtn ? C.pos : `${C.pos}12`,
                  color: hovIngBtn ? '#fff' : C.pos,
                  boxShadow: hovIngBtn ? `0 4px 12px ${C.pos}40` : 'none',
                  transition: 'all .18s', flexShrink: 0,
                }}
              >
                + Ingreso
              </button>
              <button
                onClick={() => setShowNewGasModal(true)}
                onMouseEnter={() => setHovGasBtn(true)}
                onMouseLeave={() => setHovGasBtn(false)}
                style={{
                  height: 32, padding: '0 14px',
                  display: 'flex', alignItems: 'center', gap: 5,
                  borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)',
                  border: `1px solid ${C.neg}${hovGasBtn ? 'cc' : '55'}`,
                  background: hovGasBtn ? C.neg : `${C.neg}12`,
                  color: hovGasBtn ? '#fff' : C.neg,
                  boxShadow: hovGasBtn ? `0 4px 12px ${C.neg}40` : 'none',
                  transition: 'all .18s', flexShrink: 0,
                }}
              >
                − Egreso
              </button>
            </>
          )}
          {/* Buscador */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Icon.search size={13} strokeWidth={2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: D ? 'rgba(255,255,255,0.38)' : C.textMute, pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              style={{
                height: 32, paddingLeft: 30, paddingRight: 12,
                borderRadius: 20, border: `1px solid ${brd}`,
                background: D ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.03)', fontSize: 12,
                fontFamily: 'var(--font-ui)', color: D ? 'rgba(255,255,255,0.88)' : C.text,
                outline: 'none', width: 160, transition: 'width .2s, border-color .2s',
              }}
              onFocus={e => { e.currentTarget.style.width = '220px'; e.currentTarget.style.borderColor = D ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.3)'; }}
              onBlur={e  => { e.currentTarget.style.width = '160px'; e.currentTarget.style.borderColor = brd; }}
            />
          </div>
        </div>
      </div>

      {/* Tabla scrollable — key dispara fz-tab-content al cambiar tab */}
      <div key={tab} className="fz-tab-content" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 20px' }}>
        {tab === 'todas'          && <DataTable cols={colsTodas} rows={rowsTodas} emptyMsg={q ? `Sin resultados para "${search.trim()}".` : 'Sin transacciones este mes.'}   accent={D ? C.warn : activeTab.color} darkMode={D} />}
        {tab === 'ingresos'       && <DataTable cols={colsIng}   rows={rowsIng}   emptyMsg={q ? `Sin resultados para "${search.trim()}".` : 'Sin ingresos este mes.'}       accent={D ? C.warn : activeTab.color} darkMode={D}
          onEdit={canWrite ? handleEditIngreso : undefined}
          onDelete={canWrite ? handleDeleteIngreso : undefined} />}
        {tab === 'gastos'         && <DataTable cols={colsGas}   rows={rowsGas}   emptyMsg={q ? `Sin resultados para "${search.trim()}".` : 'Sin gastos este mes.'}         accent={D ? C.warn : activeTab.color} darkMode={D}
          onEdit={canWrite ? handleEditGasto : undefined}
          onDelete={canWrite ? handleDeleteGasto : undefined} />}
        {tab === 'transferencias' && <DataTable cols={colsTrans} rows={rowsTrans} emptyMsg={q ? `Sin resultados para "${search.trim()}".` : 'Sin transferencias este mes.'} accent={D ? C.warn : activeTab.color} darkMode={D} />}
      </div>

      {showNewIngModal && (
        <NewIngresoModal
          onClose={() => setShowNewIngModal(false)}
          onSuccess={() => { onRefresh?.(); }}
        />
      )}
      {showNewGasModal && (
        <NewGastoModal
          onClose={() => setShowNewGasModal(false)}
          onSuccess={() => { onRefresh?.(); }}
        />
      )}
      {editIngRow && (
        <NewIngresoModal
          initialData={editIngRow}
          onClose={() => setEditIngRow(null)}
          onSuccess={() => { onRefresh?.(); }}
        />
      )}
      {editGasRow && (
        <NewGastoModal
          initialData={editGasRow}
          onClose={() => setEditGasRow(null)}
          onSuccess={() => { onRefresh?.(); }}
        />
      )}
    </div>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────


export { TransactionPanel };
