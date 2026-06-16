'use client';

import { useState, type ReactElement } from 'react';
import { SectionHeading } from './SectionHeading';
import { cardShadow, financeSeries, landingColors, landingRadius, sectionPadding } from './theme';

const tabs = ['Balance', 'Gastos', 'Deudas'] as const;
type Tab = (typeof tabs)[number];

const bullets: Record<Tab, string[]> = {
  Balance: [
    'Ingresos, gastos y deudas superpuestos en una sola lectura',
    'Tooltip multi-serie para comparar mes a mes',
    'Balance neto y tendencia del periodo',
    'Vista lista para reportes y decisiones rápidas',
  ],
  Gastos: [
    'Categorías con montos y evolución mensual',
    'Gastos únicos y gastos por deuda separados',
    'Alertas visuales cuando una categoría sube demasiado',
    'Lectura clara para ajustar presupuesto',
  ],
  Deudas: [
    'Línea naranja para deudas, préstamos y cuotas',
    'Estado vacío con leyenda propia',
    'Monto pendiente, pagado y faltante visibles',
    'Ideal para priorizar pagos del mes',
  ],
};

function MiniSeriesChart() {
  return (
    <svg viewBox="0 0 420 170" style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={landingColors.income} stopOpacity="0.34" />
          <stop offset="100%" stopColor={landingColors.income} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={landingColors.expense} stopOpacity="0.24" />
          <stop offset="100%" stopColor={landingColors.expense} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="debtArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={landingColors.debt} stopOpacity="0.28" />
          <stop offset="100%" stopColor={landingColors.debt} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[32, 68, 104, 140].map(y => (
        <line key={y} x1="20" y1={y} x2="400" y2={y} stroke="rgba(23,25,28,0.08)" />
      ))}
      {['ene', 'feb', 'mar', 'abr', 'may', 'jun'].map((m, i) => (
        <text key={m} x={40 + i * 68} y="164" fontSize="10" fill={landingColors.graphite} textAnchor="middle">
          {m}
        </text>
      ))}

      <path d="M40,118 C92,112 118,82 176,78 C232,74 250,94 312,62 C350,42 372,34 380,28 L380,146 L40,146 Z" fill="url(#incomeArea)" />
      <path d="M40,128 C92,124 124,122 176,116 C226,110 268,118 312,100 C348,84 368,74 380,70 L380,146 L40,146 Z" fill="url(#expenseArea)" />
      <path d="M40,134 C92,132 126,130 176,126 C226,118 266,104 312,98 C346,92 368,86 380,82 L380,146 L40,146 Z" fill="url(#debtArea)" />

      <path d="M40,118 C92,112 118,82 176,78 C232,74 250,94 312,62 C350,42 372,34 380,28" fill="none" stroke={landingColors.income} strokeWidth="3" strokeLinecap="round" />
      <path d="M40,128 C92,124 124,122 176,116 C226,110 268,118 312,100 C348,84 368,74 380,70" fill="none" stroke={landingColors.expense} strokeWidth="3" strokeLinecap="round" />
      <path d="M40,134 C92,132 126,130 176,126 C226,118 266,104 312,98 C346,92 368,86 380,82" fill="none" stroke={landingColors.debt} strokeWidth="3" strokeLinecap="round" />

      {[40, 176, 312, 380].map((x, i) => {
        const income = [118, 78, 62, 28][i];
        const expense = [128, 116, 100, 70][i];
        const debt = [134, 126, 98, 82][i];
        return (
          <g key={x}>
            <circle cx={x} cy={income} r="4" fill={landingColors.white} stroke={landingColors.income} strokeWidth="2" />
            <circle cx={x} cy={expense} r="4" fill={landingColors.white} stroke={landingColors.expense} strokeWidth="2" />
            <circle cx={x} cy={debt} r="4" fill={landingColors.white} stroke={landingColors.debt} strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

const previewContent: Record<Tab, ReactElement> = {
  Balance: (
    <div style={{ padding: 22, fontFamily: 'var(--font-ui)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div>
          <p style={{ color: landingColors.softText, fontSize: 12, marginBottom: 4 }}>Balance neto del mes</p>
          <p style={{ color: landingColors.ink, fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
            S/ 45,016
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {financeSeries.map(item => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, color: landingColors.muted, fontSize: 12 }}>
              <span style={{ width: 18, height: 3, borderRadius: 999, background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <MiniSeriesChart />
    </div>
  ),
  Gastos: (
    <div style={{ padding: 22, fontFamily: 'var(--font-ui)' }}>
      <p style={{ color: landingColors.softText, fontSize: 12, marginBottom: 14 }}>Gastos este mes</p>
      {[
        { cat: 'Alimentación', pct: 38, amount: 'S/ 642' },
        { cat: 'Vivienda', pct: 28, amount: 'S/ 472' },
        { cat: 'Transporte', pct: 14, amount: 'S/ 236' },
        { cat: 'Suscripciones', pct: 10, amount: 'S/ 168' },
      ].map((g) => (
        <div key={g.cat} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: landingColors.ink, fontSize: 13 }}>{g.cat}</span>
            <span style={{ color: landingColors.expense, fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{g.amount}</span>
          </div>
          <div style={{ background: 'rgba(23,25,28,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${g.pct}%`, height: '100%', background: landingColors.expense, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  ),
  Deudas: (
    <div style={{ padding: 22, fontFamily: 'var(--font-ui)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ color: landingColors.softText, fontSize: 12, marginBottom: 4 }}>Deuda pendiente</p>
          <p style={{ color: landingColors.debt, fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}>S/ 13,732</p>
        </div>
        <span style={{ height: 30, padding: '6px 11px', borderRadius: 999, background: 'rgba(217,168,108,0.14)', color: landingColors.debt, fontSize: 12, fontWeight: 800 }}>
          10 deudas
        </span>
      </div>
      {[
        { name: 'Tarjeta BBVA', value: 'S/ 1,600', pct: 68 },
        { name: 'Préstamo 365', value: 'S/ 3,200', pct: 84 },
        { name: 'Adelanto de sueldo', value: 'S/ 1,320', pct: 42 },
      ].map(item => (
        <div key={item.name} style={{ padding: '12px 0', borderTop: '1px solid rgba(23,25,28,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: landingColors.ink, fontSize: 13, marginBottom: 7 }}>
            <span>{item.name}</span>
            <strong>{item.value}</strong>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(23,25,28,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.pct}%`, borderRadius: 999, background: landingColors.debt }} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export function DashboardPreview() {
  const [active, setActive] = useState<Tab>('Balance');

  return (
    <section
      id="dashboard"
      style={{ background: landingColors.fog, paddingBlock: sectionPadding, scrollMarginTop: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              eyebrow="El producto"
              title="Un dashboard que también explica lo que está pasando."
              lead="La vista de análisis compara ingresos, gastos y deudas con una misma lógica visual. Azul para lo que entra, rust para lo que sale y naranja para lo que todavía debes resolver."
              align="left"
            />
            <ul className="mt-8 space-y-3 list-none p-0 m-0">
              {bullets[active].map((b) => (
                <li key={b} className="flex items-center gap-3 text-[15px]" style={{ color: landingColors.muted }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                    style={{ background: landingColors.white, color: active === 'Gastos' ? landingColors.expense : active === 'Deudas' ? landingColors.debt : landingColors.income }}
                  >
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="overflow-hidden"
            style={{
              background: landingColors.white,
              border: '1px solid rgba(23,25,28,0.07)',
              borderRadius: landingRadius.card,
              boxShadow: cardShadow,
            }}
          >
            <div
              className="flex"
              style={{ background: landingColors.fog, borderBottom: '1px solid rgba(23,25,28,0.07)' }}
            >
              {tabs.map((t) => {
                const activeColor = t === 'Gastos' ? landingColors.expense : t === 'Deudas' ? landingColors.debt : landingColors.income;
                return (
                  <button
                    key={t}
                    onClick={() => setActive(t)}
                    className="flex-1 py-3 text-[13px] font-semibold transition-all duration-150"
                    style={{
                      color: active === t ? activeColor : landingColors.softText,
                      borderBottom: active === t ? `2px solid ${activeColor}` : '2px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div style={{ minHeight: 300 }}>
              {previewContent[active]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
