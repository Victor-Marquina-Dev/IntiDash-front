'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { PresupuestoLimiteRow, GastoUnicoRow, GastoDeudaRow } from '@/shared/types/finance.types';
import { BudgetRow, KpiCard, Pill, SuggestionRow, UnbudgetedRow } from './BudgetRows';
import { LimiteForm } from './LimiteForm';
import { COLOR_OPTS, DarkCtx, FONT, MONTHS, MONTHS_FULL } from './constants';
import { catColor, fmt, gastoDelMes, getSugerencias, type Transaccion } from './budgetUtils';

interface DeudaScreenProps { accent: string; canWrite?: boolean; darkMode?: boolean }

export function DeudaScreen({ accent: _accent, darkMode = false }: Readonly<DeudaScreenProps>) {
  const now         = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  const [year,  setYear]  = React.useState(currentYear);
  const [month, setMonth] = React.useState(currentMonth);

  const [limites,  setLimites]  = React.useState<PresupuestoLimiteRow[]>([]);
  const [gastosU,  setGastosU]  = React.useState<GastoUnicoRow[]>([]);
  const [gastosD,  setGastosD]  = React.useState<GastoDeudaRow[]>([]);
  const [catNames, setCatNames] = React.useState<string[]>([]);
  const [loading,  setLoading]  = React.useState(true);

  const [creating,    setCreating]    = React.useState(false);
  const [editing,     setEditing]     = React.useState<PresupuestoLimiteRow | null>(null);
  const [quickPreset, setQuickPreset] = React.useState<{ categoria: string; limite: number; color: string } | null>(null);
  const [hovAdd,      setHovAdd]      = React.useState(false);
  const [compact,        setCompact]        = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const pillsRef    = React.useRef<HTMLDivElement>(null);
  const yearBtnRef  = React.useRef<HTMLDivElement>(null);
  const yearListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!yearPickerOpen || !yearListRef.current) return;
    const el = yearListRef.current;
    const active = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ block: 'center' });
  }, [yearPickerOpen]);

  React.useEffect(() => {
    if (!yearPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (yearBtnRef.current && !yearBtnRef.current.contains(e.target as Node))
        setYearPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [yearPickerOpen]);

  React.useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 540));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isToday = year === currentYear && month === currentMonth;
  const goToday = () => { setYear(currentYear); setMonth(currentMonth); };
  const goPrev  = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goNext  = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  React.useEffect(() => {
    Promise.all([
      notionPaymentsService.getPresupuestoLimites(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getCategoriasGastos(),
    ]).then(([lims, gu, gd, cats]) => {
      setLimites(lims);
      setGastosU(gu);
      setGastosD(gd);
      setCatNames([...new Set((cats as { nombre: string }[]).map(c => c.nombre).filter(Boolean))].sort());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const _availableYears = React.useMemo(() => {
    const ys = new Set<number>([currentYear]);
    for (const r of gastosU) { const y = r.fecha ? new Date(r.fecha).getUTCFullYear() : null; if (y) ys.add(y); }
    for (const r of gastosD) { const y = r.fecha ? new Date(r.fecha).getUTCFullYear() : null; if (y) ys.add(y); }
    const maxYear = Math.max(...Array.from(ys));
    ys.add(maxYear + 1);
    return Array.from(ys).sort((a, b) => b - a);
  }, [gastosU, gastosD, currentYear]);

  const monthsWithData = React.useMemo(() => {
    const s = new Set<number>();
    for (const r of gastosU) { if (r.fecha && new Date(r.fecha).getUTCFullYear() === year) s.add(new Date(r.fecha).getUTCMonth()); }
    for (const r of gastosD) { if (r.fecha && new Date(r.fecha).getUTCFullYear() === year) s.add(new Date(r.fecha).getUTCMonth()); }
    return s;
  }, [gastosU, gastosD, year]);

  const gastoMes = gastoDelMes(gastosU, gastosD, year, month);

  // Categorías con límite definido
  const budgeted = limites.map(l => {
    const gastado = gastoMes.get(l.categoria) ?? 0;
    const transacciones: Transaccion[] = [
      ...gastosU
        .filter(r => r.fecha && r.monto != null
          && new Date(r.fecha).getUTCFullYear() === year
          && new Date(r.fecha).getUTCMonth() === month
          && (r.categoriaGasto || 'Sin categoría') === l.categoria)
        .map(r => ({ id: r.id, nombre: r.nombre, fecha: r.fecha, monto: r.monto! })),
      ...gastosD
        .filter(r => r.fecha && r.montoGastado != null
          && new Date(r.fecha).getUTCFullYear() === year
          && new Date(r.fecha).getUTCMonth() === month
          && (r.categoriaGasto || 'Sin categoría') === l.categoria)
        .map(r => ({ id: r.id, nombre: r.nombre, fecha: r.fecha, monto: r.montoGastado! })),
    ].sort((a, b) => (b.fecha ?? '') > (a.fecha ?? '') ? 1 : -1);
    return { limite: l, gastado, transacciones };
  }).sort((a, b) => b.gastado - a.gastado);

  // Categorías con gasto pero sin límite
  const budgetedCats = new Set(limites.map(l => l.categoria));
  const unbudgeted = [...gastoMes.entries()]
    .filter(([cat]) => !budgetedCats.has(cat))
    .sort((a, b) => b[1] - a[1]);
  const unbudgetedTotal = unbudgeted.reduce((s, [, v]) => s + v, 0);

  const totalLimite  = limites.reduce((s, l) => s + l.limite, 0);
  const totalGastado = budgeted.reduce((s, b) => s + b.gastado, 0) + unbudgetedTotal;
  const disponible   = totalLimite - totalGastado;

  // Categorías disponibles para el selector (excluye las ya con límite si no es edición)
  const catsForForm = editing
    ? catNames
    : catNames.filter(c => !budgetedCats.has(c));

  const sugerencias = React.useMemo(
    () => getSugerencias(gastosU, gastosD, new Set(limites.map(l => l.categoria))),
    [gastosU, gastosD, limites],
  );

  const D = darkMode;

  return (
    <DarkCtx.Provider value={D}>
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
      <style>{`
        .budget-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
        }
        .budget-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.85fr);
          gap: 16px;
          align-items: start;
        }
        .budget-panel {
          border: 1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border};
          background: ${D ? 'rgba(255,255,255,0.025)' : '#fff'};
          border-radius: 18px;
          padding: 14px;
          box-shadow: ${D ? 'none' : '0 1px 2px rgba(17,24,39,0.035)'};
        }
        .budget-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .budget-panel-title {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }
        .budget-panel-rail {
          width: 3px;
          height: 17px;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .budget-panel-title-text {
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .8px;
          color: ${D ? 'rgba(255,255,255,0.58)' : C.textDim};
          font-family: ${FONT};
        }
        .budget-panel-subtitle {
          font-size: 12px;
          color: ${D ? 'rgba(255,255,255,0.38)' : C.textMute};
          font-family: ${FONT};
          margin-top: -5px;
          margin-bottom: 12px;
        }
        .budget-chip {
          flex-shrink: 0;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 800;
          font-family: ${FONT};
        }
        .budget-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (max-width: 1180px) {
          .budget-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .budget-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .budget-kpi-grid { grid-template-columns: 1fr; }
          .budget-panel { padding: 12px; border-radius: 16px; }
        }
      `}</style>

      {/* Header con filtros */}
      <div style={{
        padding: '20px 32px 16px', borderBottom: `1px solid ${D ? 'rgba(255,255,255,0.08)' : C.border}`,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Título */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: D ? 'rgba(255,255,255,0.90)' : C.text, letterSpacing: -0.4 }}>Presupuesto</div>
          <div style={{ fontSize: 12, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, marginTop: 2 }}>{year} · {MONTHS_FULL[month]}</div>
        </div>

        {/* Botón "Hoy" */}
        {!isToday && (
          <button
            onClick={goToday}
            style={{
              height: 26, padding: '0 10px', borderRadius: 20,
              border: `1px solid rgba(17,24,39,0.12)`, background: 'rgba(17,24,39,0.04)',
              color: C.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              fontFamily: FONT, transition: 'all .15s', flexShrink: 0,
            }}
          >
            Hoy
          </button>
        )}

        {/* Selector de fechas (responsive) */}
        <div ref={pillsRef} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {compact ? (
            /* Modo compacto: mes y año */
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={goPrev}
                style={{
                  width: 26, height: 26, borderRadius: 20, border: `1px solid rgba(17,24,39,0.1)`,
                  background: 'rgba(17,24,39,0.04)', color: C.textDim, cursor: 'pointer',
                  display: 'grid', placeItems: 'center', transition: 'all .15s',
                }}
              >
                <div style={{ transform: 'rotate(90deg)', display: 'grid', placeItems: 'center' }}>
                  <Icon.chevron size={12} strokeWidth={2.2} />
                </div>
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: FONT, minWidth: 110, textAlign: 'center' }}>
                {MONTHS_FULL[month]} {year}
              </span>
              <button
                onClick={goNext}
                style={{
                  width: 26, height: 26, borderRadius: 20, border: `1px solid rgba(17,24,39,0.1)`,
                  background: 'rgba(17,24,39,0.04)', color: C.textDim, cursor: 'pointer',
                  display: 'grid', placeItems: 'center', transition: 'all .15s',
                }}
              >
                <div style={{ transform: 'rotate(-90deg)', display: 'grid', placeItems: 'center' }}>
                  <Icon.chevron size={12} strokeWidth={2.2} />
                </div>
              </button>
            </div>
          ) : (
            /* Modo completo: pills de año y mes */
            <>
              {/* Year picker */}
              <div ref={yearBtnRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setYearPickerOpen(o => !o)}
                  style={{
                    height: 26, padding: '0 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700, fontFamily: FONT,
                    border: `1px solid ${C.primary}`, background: C.primary, color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all .15s',
                  }}
                >
                  {year}
                  <div style={{ transform: yearPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'grid', placeItems: 'center', transition: 'transform .2s' }}>
                    <Icon.chevron size={10} strokeWidth={2.5} />
                  </div>
                </button>

                {yearPickerOpen && (
                  <div ref={yearListRef} style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 300, background: '#fff', borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                    padding: 4, width: 88,
                    maxHeight: 220, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 1,
                  }}>
                    {Array.from({ length: 21 }, (_, i) => year - 10 + i).map(y => (
                      <button
                        key={y}
                        data-active={y === year ? 'true' : undefined}
                        onClick={() => { setYear(y); setYearPickerOpen(false); }}
                        style={{
                          height: 32, borderRadius: 8, border: 'none', width: '100%',
                          background: y === year ? C.primary : y === currentYear ? `${C.primary}18` : 'transparent',
                          color: y === year ? '#fff' : y === currentYear ? C.primary : C.textDim,
                          cursor: 'pointer', fontSize: 12,
                          fontWeight: y === year || y === currentYear ? 700 : 500,
                          fontFamily: FONT, transition: 'background .1s',
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {MONTHS.map((m, i) => (
                  <Pill
                    key={i}
                    active={month === i}
                    current={year === currentYear && i === currentMonth}
                    dot={monthsWithData.has(i)}
                    dimmed={!monthsWithData.has(i) && month !== i}
                    onClick={() => setMonth(i)}
                  >
                    {m}
                  </Pill>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Botón agregar */}
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          onMouseEnter={() => setHovAdd(true)}
          onMouseLeave={() => setHovAdd(false)}
          style={{
            height: 30, padding: '0 14px', borderRadius: 10,
            border: `1px solid ${hovAdd ? `${C.pos}cc` : `${C.pos}50`}`,
            background: hovAdd ? C.pos : `${C.pos}14`,
            color: hovAdd ? '#fff' : C.pos,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT,
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: hovAdd ? `0 4px 12px ${C.pos}40` : 'none',
            transition: 'all .18s',
          }}
        >
          <Icon.plus size={13} strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      <div style={{ padding: '20px 32px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPIs */}
      {!loading && (
        <div className="budget-kpi-grid">
          <KpiCard
            label="Total presupuestado"
            value={totalLimite}
            color={D ? 'rgba(255,255,255,0.60)' : C.textDim}
            icon={<Icon.target size={14} strokeWidth={2} />}
          />
          <KpiCard
            label="Gastado este mes"
            value={totalGastado}
            color={totalGastado > totalLimite ? C.neg : C.warn}
            sub={totalLimite > 0 ? `${Math.round((totalGastado / totalLimite) * 100)}% del presupuesto` : undefined}
            icon={<Icon.trendUp size={14} strokeWidth={2} />}
          />
          <KpiCard
            label={disponible >= 0 ? 'Disponible' : 'Excedido'}
            value={disponible}
            color={disponible >= 0 ? C.pos : C.neg}
            icon={<Icon.chart size={14} strokeWidth={2} />}
          />
          <KpiCard
            label="Sin límite"
            value={unbudgetedTotal}
            color={unbudgetedTotal > 0 ? C.warn : C.pos}
            sub={unbudgeted.length > 0 ? `${unbudgeted.length} categoría${unbudgeted.length === 1 ? '' : 's'} pendiente${unbudgeted.length === 1 ? '' : 's'}` : 'Todo asignado'}
            icon={<Icon.target size={14} strokeWidth={2} />}
          />
        </div>
      )}

      {/* Formulario crear / editar */}
      {(creating || editing) && (
        <LimiteForm
          initial={editing ?? undefined}
          quickPreset={quickPreset ?? undefined}
          categoriasDisponibles={catsForForm}
          onSaved={(row) => {
            if (editing) {
              setLimites(ls => ls.map(l => l.id === row.id ? row : l));
            } else {
              setLimites(ls => [...ls, row]);
            }
            setCreating(false);
            setEditing(null);
            setQuickPreset(null);
          }}
          onCancel={() => { setCreating(false); setEditing(null); setQuickPreset(null); }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
          Cargando...
        </div>
      )}

      {!loading && (
        <div className="budget-main-grid">
      {/* Lista con limites */}
      {budgeted.length > 0 && (
        <div className="budget-panel">
          <div className="budget-panel-header">
            <div className="budget-panel-title">
              <span className="budget-panel-rail" style={{ background: C.pos }} />
              <span className="budget-panel-title-text">Límites activos</span>
            </div>
            <span className="budget-chip" style={{ background: `${C.pos}12`, color: C.pos }}>
              {budgeted.length} categoría{budgeted.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="budget-stack">
          {budgeted.map(({ limite, gastado, transacciones }) => (
            <BudgetRow
              key={limite.id}
              limite={limite}
              gastado={gastado}
              transacciones={transacciones}
              onEdit={(l) => { setEditing(l); setCreating(false); }}
              onDelete={(id) => setLimites(ls => ls.filter(l => l.id !== id))}
            />
          ))}
          </div>
        </div>
      )}

      {/* Sin categorias configuradas */}
      {budgeted.length === 0 && !creating && (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: 18,
          border: `1.5px dashed ${D ? 'rgba(255,255,255,0.10)' : C.border}`,
          background: D ? 'rgba(255,255,255,0.02)' : 'rgba(143,168,143,0.03)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.pos}14`, color: C.pos, display: 'grid', placeItems: 'center', border: `1.5px solid ${C.pos}28` }}>
            <Icon.chart size={24} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: D ? 'rgba(255,255,255,0.80)' : C.text, marginBottom: 5, fontFamily: FONT }}>
              Sin categorías de presupuesto
            </div>
            <div style={{ fontSize: 13, color: D ? 'rgba(255,255,255,0.38)' : C.textMute, fontFamily: FONT }}>
              Agrega una categoría para empezar a controlar tus gastos.
            </div>
          </div>
        </div>
      )}

      {/* Gastos sin presupuesto */}
      {unbudgeted.length > 0 && (
        <div className="budget-panel">
          <div className="budget-panel-header">
            <div className="budget-panel-title">
              <span className="budget-panel-rail" style={{ background: C.warn }} />
              <span className="budget-panel-title-text">Gastos sin límite</span>
            </div>
            <span className="budget-chip" style={{ background: `${C.warn}14`, color: C.warn }}>
              {fmt(unbudgetedTotal)}
            </span>
          </div>
          <div className="budget-stack">
            {unbudgeted.map(([cat, gasto]) => (
              <UnbudgetedRow
                key={cat}
                categoria={cat}
                gastado={gasto}
                onAssign={() => {
                  const col = catColor(cat);
                  setQuickPreset({ categoria: cat, limite: Math.ceil(gasto / 50) * 50, color: col });
                  setCreating(true);
                  setEditing(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sugerencias basadas en historial */}
      {sugerencias.length > 0 && !creating && !editing && (
        <div className="budget-panel">
          <div className="budget-panel-header">
            <div className="budget-panel-title">
              <span className="budget-panel-rail" style={{ background: C.primary }} />
              <span className="budget-panel-title-text">Sugerencias</span>
            </div>
            <span className="budget-chip" style={{ background: `${C.primary}12`, color: C.primary }}>
              {sugerencias.length}
            </span>
          </div>
          <div className="budget-panel-subtitle">
            Categorías con gasto recurrente aún sin límite asignado.
          </div>
          <div className="budget-stack">
            {sugerencias.map((s, i) => (
              <SuggestionRow
                key={s.categoria}
                {...s}
                colorIdx={i}
                onAdd={() => {
                  setQuickPreset({ categoria: s.categoria, limite: s.sugerido, color: COLOR_OPTS[i % COLOR_OPTS.length] });
                  setCreating(true);
                  setEditing(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}
        </div>
      )}
      </div>
    </div>
    </DarkCtx.Provider>
  );
}
