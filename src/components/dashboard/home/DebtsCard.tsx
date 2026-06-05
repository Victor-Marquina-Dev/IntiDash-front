'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { ProgressBar } from '@/components/charts';
import type { BP } from '@/lib/breakpoints';
import { useDashboardDebts, widgetPct } from '@/shared/hooks/use-dashboard-debts';
import { DeudasModal, NewDeudaModal } from './KpiRail';
import { NewPrestamoModal, PrestamosModal } from './PrestamosModals';
import { CardHeaderSection } from './CardHeaderSection';

const DARK = {
  cardBg:     'linear-gradient(145deg,#1A1D21,#16181C)',
  cardBrd:    'rgba(255,255,255,0.08)',
  boxShadow:  '0 4px 24px rgba(0,0,0,.5)',
  loadC:      'rgba(255,255,255,0.35)',
  metricInt:  'rgba(255,255,255,0.88)',
  metricSym:  'rgba(255,255,255,0.50)',
  metricDec:  'rgba(255,255,255,0.22)',
  metricSub:  'rgba(255,255,255,0.35)',
  debtBrd:    'rgba(255,255,255,.06)',
  debtBarBg:  'rgba(255,255,255,.05)',
  debtNumC:   'rgba(255,255,255,0.88)',
  subItemBg:  'rgba(255,255,255,.04)',
  subItemBrd: 'rgba(255,255,255,.08)',
  subNameC:   'rgba(255,255,255,0.82)',
  subSubC:    'rgba(255,255,255,0.35)',
  subAmtC:    'rgba(255,255,255,0.82)',
  fActBg:     'rgba(255,255,255,0.90)',
  fActC:      '#111',
  fInBg:      'rgba(255,255,255,.03)',
  fInC:       'rgba(255,255,255,0.38)',
  fInBrd:     'rgba(255,255,255,.08)',
  gradFade:   'rgba(13,15,18,0.96)',
};

const LIGHT = {
  cardBg:     '#FFFFFF',
  cardBrd:    'rgba(17,24,39,0.08)',
  boxShadow:  '0 1px 2px rgba(17,24,39,.04)',
  loadC:      '#9CA3AF',
  metricInt:  '#111827',
  metricSym:  '#6B7280',
  metricDec:  'rgba(17,24,39,0.30)',
  metricSub:  '#9CA3AF',
  debtBrd:    'rgba(17,24,39,0.08)',
  debtBarBg:  'rgba(17,24,39,0.06)',
  debtNumC:   '#111827',
  subItemBg:  '#FAFAFA',
  subItemBrd: 'rgba(17,24,39,0.06)',
  subNameC:   '#111827',
  subSubC:    '#9CA3AF',
  subAmtC:    '#111827',
  fActBg:     '#111827',
  fActC:      '#fff',
  fInBg:      'transparent',
  fInC:       '#6B7280',
  fInBrd:     'rgba(17,24,39,0.10)',
  gradFade:   'rgba(255,255,255,0.96)',
};

export function Debts({ bp, darkMode, canWrite = true }: Readonly<{ bp: BP; darkMode?: boolean; canWrite?: boolean }>) {
  const isDark = darkMode ?? false;
  const tk = isDark ? DARK : LIGHT;
  const isDesktop = bp === 'desktop';
  const [tab, setTab]         = React.useState<'debts' | 'subs' | 'prestamos'>('subs');
  const [showTable, setShowTable] = React.useState(false);
  const [showNew,   setShowNew]   = React.useState(false);
  const [debtFilter, setDebtFilter] = React.useState<'cuotas' | 'un_pago'>('cuotas');
  const {
    loading,
    fetchDeudas,
    fetchPrestamos,
    prestamosRows,
    debts,
    subs,
    debtsCuotas,
    debtsUnPago,
    visibleDebts,
    totals,
  } = useDashboardDebts(debtFilter);

  const isDebts     = tab === 'debts';
  const isPrestamos = tab === 'prestamos';
  const list        = isDebts ? debts : subs;

  // Métricas pre-calculadas (evita IIFEs en JSX)
  const metricRaw  = isDebts ? totals.debt : totals.prestado;
  const metricInt  = Math.floor(metricRaw).toLocaleString('es-PE');
  const metricDec  = (metricRaw % 1).toFixed(2).slice(1);
  const presPct    = totals.presPct;
  const subsInt    = Math.floor(totals.subs).toLocaleString('es-PE');
  const subsDec    = (totals.subs % 1).toFixed(2).slice(1);
  const emptyMessage = canWrite ? 'Sin datos. Sincroniza desde Ajustes.' : 'Sin datos para mostrar.';

  const [hovered, setHovered] = React.useState(false);
  const WalletIcon = Icon.wallet;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 22, overflow: 'hidden',
        background: tk.cardBg,
        border: `1px solid ${hovered ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)') : tk.cardBrd}`,
        boxShadow: hovered ? (isDark ? '0 12px 32px rgba(0,0,0,.45)' : '0 12px 32px rgba(17,24,39,.10)') : tk.boxShadow,
        fontFamily: 'var(--font-ui),system-ui,sans-serif',
        display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
        ...(isDesktop && { flex: 1 }),
      }}>

      <CardHeaderSection
        icon="🗂️"
        label="Otras Secciones"
        tabs={[
          { id: 'subs',      label: 'Suscripciones', badge: loading ? '…' : subs.length },
          { id: 'debts',     label: 'Deudas',         badge: loading ? '…' : debts.length },
          { id: 'prestamos', label: 'Préstamos',       badge: loading ? '…' : prestamosRows.length },
        ]}
        activeTab={tab}
        onTabChange={id => setTab(id as 'subs' | 'debts' | 'prestamos')}
        onDetail={() => setShowTable(true)}
        onCreate={canWrite ? () => setShowNew(true) : undefined}
        detailTitle="Ver tabla"
        createTitle="Nuevo"
        darkMode={isDark}
      />

      {/* ── Contenido ── */}
      <div key={tab} className="fz-tab-content" style={{ flex: 1, padding: '0 16px 10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 14, background: tk.subItemBg }}>
              <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 13, width: `${55 + i * 12}%`, borderRadius: 6 }} />
                <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 10, width: '35%', borderRadius: 6 }} />
              </div>
              <div className={isDark ? 'fz-skeleton--dark' : 'fz-skeleton'} style={{ height: 13, width: 52, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Métrica principal (solo deudas y préstamos) ── */}
          {(isDebts || isPrestamos) && (
            <div style={{ marginBottom: 10, flexShrink: 0, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: tk.metricSym }}>S/</span>
                <span style={{ fontSize: 36, fontWeight: 900, color: tk.metricInt, letterSpacing: -1.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{metricInt}</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: tk.metricDec }}>{metricDec}</span>
              </div>
              {isDebts && <div style={{ fontSize: 11, color: tk.metricSub, fontWeight: 500, marginTop: 4 }}>{totals.paidAvg}% promedio pagado</div>}
              {isPrestamos && <div style={{ fontSize: 11, color: tk.metricSub, fontWeight: 500, marginTop: 4 }}>{presPct}% cobrado</div>}
            </div>
          )}

          {isPrestamos && prestamosRows.length > 0 && (
            <div style={{ marginBottom: 10, flexShrink: 0 }}>
              <ProgressBar pct={presPct} color={C.pos} height={5} />
            </div>
          )}

          {/* ── Lista préstamos ── */}
          {isPrestamos && (
            prestamosRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: C.textMute }}>{emptyMessage}</div>
            ) : (
              <div style={isDesktop ? { position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' } : {}}>
                <div style={isDesktop
                  ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }
                  : { display: 'flex', flexDirection: 'column', gap: 6 }
                }>
                  {[...prestamosRows].sort((a, b) => (b.montoPrestamo ?? 0) - (a.montoPrestamo ?? 0)).map((p, i) => {
                    const faltante = p.cantidadFaltante ?? ((p.montoPrestamo ?? 0) - (p.montoPagado ?? 0));
                    const pct = p.montoPrestamo && p.montoPrestamo > 0 ? Math.min(100, Math.round((p.montoPagado ?? 0) / p.montoPrestamo * 100)) : 0;
                    const color = i % 2 === 0 ? C.neg : C.warn;
                    return (
                      <div key={p.id} style={{ padding: '10px 12px', borderRadius: 10, background: `${color}06`, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${color}18`, color, display: 'grid', placeItems: 'center' }}>
                            <WalletIcon size={13} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre || '—'}</div>
                            <div style={{ fontSize: 10, color: C.textMute, marginTop: 2 }}>{p.cuentaBancaria || 'Sin cuenta'}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 2 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: faltante > 0 ? color : C.pos, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                              S/ {faltante.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                            </span>
                            <span style={{ fontSize: 9, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>de S/ {(p.montoPrestamo ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}><ProgressBar pct={pct} color={C.pos} height={5} /></div>
                          <span style={{ fontSize: 10, color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{pct}% cobrado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── Lista deudas/suscripciones ── */}
          {!isPrestamos && list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: C.textMute }}>
              {emptyMessage}
            </div>
          ) : !isPrestamos && (
            <div style={isDesktop ? { position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' } : {}}>
              <div style={isDesktop
                ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }
                : { display: 'flex', flexDirection: 'column', gap: 6 }
              }>
                {isDebts && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {(['cuotas', 'un_pago'] as const).map(f => {
                      const active = debtFilter === f;
                      const label  = f === 'cuotas' ? 'A cuotas' : 'Un pago';
                      const count  = f === 'cuotas' ? debtsCuotas.length : debtsUnPago.length;
                      return (
                        <button key={f} onClick={() => setDebtFilter(f)} style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                          border: `1px solid ${active ? tk.fActBg : tk.fInBrd}`,
                          background: active ? tk.fActBg : tk.fInBg,
                          color: active ? tk.fActC : tk.fInC,
                          fontFamily: 'var(--font-ui), system-ui, sans-serif',
                          transition: 'all .18s',
                        }}>
                          {label}
                          <span style={{ fontSize: 9, fontWeight: 900, padding: '1px 4px', borderRadius: 6, background: 'rgba(255,255,255,.2)' }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isDebts && [...visibleDebts].sort((a, b) => (b.cantidad ?? 0) - (a.cantidad ?? 0)).map((d, i, arr) => {
                  const dc       = i % 2 === 0 ? C.olive : C.pos;
                  const pct      = widgetPct(d);
                  const isLast   = i === arr.length - 1;
                  const total    = d.cantidad ?? 0;
                  const intPart  = Math.floor(total).toLocaleString('es-PE');
                  const decPart  = (total % 1).toFixed(2).slice(1);
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: isLast ? 'none' : `1px solid ${tk.debtBrd}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre || '—'}</div>
                        <div style={{ height: 3, background: tk.debtBarBg, borderRadius: 10, overflow: 'hidden', marginTop: 5 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: dc, borderRadius: 10 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: tk.metricSym }}>S/</span>
                          <span style={{ fontSize: 20, fontWeight: 900, color: tk.debtNumC, letterSpacing: -0.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{intPart}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: tk.metricDec }}>{decPart}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tab === 'subs' && (
                  <div style={{ marginBottom: 10, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: tk.metricSym }}>S/</span>
                      <span style={{ fontSize: 36, fontWeight: 900, color: tk.metricInt, letterSpacing: -1.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{subsInt}</span>
                      <span style={{ fontSize: 20, fontWeight: 600, color: tk.metricDec }}>{subsDec}</span>
                    </div>
                    <div style={{ fontSize: 11, color: tk.metricSub, fontWeight: 500, marginTop: 4 }}>total mensual de suscripciones</div>
                  </div>
                )}

                {tab === 'subs' && [...subs].sort((a, b) => (b.cantidad ?? 0) - (a.cantidad ?? 0)).map((s) => {
                  const bc      = isDark ? '#0C5E3F' : '#8FA88F';
                  const initials = ((s.nombre ?? '')[0] ?? '?').toUpperCase();
                  const total   = s.cantidad ?? 0;
                  const intPart = Math.floor(total).toLocaleString('es-PE');
                  const decPart = (total % 1).toFixed(2).slice(1);
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 14, background: tk.subItemBg, border: `1px solid ${tk.subItemBrd}`, marginBottom: 6 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: bc, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: 0.3 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: tk.subNameC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nombre || '—'}</div>
                        <div style={{ fontSize: 10, color: tk.subSubC, fontWeight: 500, marginTop: 1 }}>{s.ciclo || 'mensual'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: tk.subAmtC, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
                          S/ {intPart}<span style={{ fontSize: 10, fontWeight: 600, color: tk.subSubC }}>{decPart}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isDesktop && list.length > 3 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(to bottom, transparent, ${tk.gradFade})`, pointerEvents: 'none' }} />
              )}
            </div>
          )}

        </>
      )}

      {showTable && !isPrestamos && <DeudasModal onClose={() => setShowTable(false)} />}
      {showTable && isPrestamos  && <PrestamosModal onClose={() => setShowTable(false)} canWrite={canWrite} />}
      {canWrite && showNew   && !isPrestamos && <NewDeudaModal onClose={() => setShowNew(false)} onSuccess={() => {
        setShowNew(false);
        fetchDeudas();
      }} />}
      {canWrite && showNew   && isPrestamos  && <NewPrestamoModal onClose={() => setShowNew(false)} onSuccess={() => {
        setShowNew(false);
        fetchPrestamos();
      }} />}

      </div>{/* fin contenido */}
    </div>
  );
}

// ── Notion sync ──────────────────────────────────────────────────────────
