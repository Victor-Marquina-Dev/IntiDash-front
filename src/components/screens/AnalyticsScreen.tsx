'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Eyebrow, Delta } from '@/components/ui';
import { Sparkline, PairedBars, ProgressBar } from '@/components/charts';

function SummaryStat({ label, value, sub, delta, kind, I }: Readonly<{
  label: string; value: string; sub?: string; delta?: string;
  kind: 'pos' | 'neg' | 'primary'; I: (typeof Icon)[keyof typeof Icon];
}>) {
  const color = kind === 'pos' ? C.pos : kind === 'neg' ? C.neg : C.primary;
  return (
    <Card pad={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: color + '1F', color, display: 'grid', placeItems: 'center' }}>
          <I size={12} />
        </div>
        <Eyebrow>{label}</Eyebrow>
        <div style={{ flex: 1 }} />
        {delta && <Delta value={delta} kind={kind === 'primary' ? 'auto' : kind} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 10, color: C.text, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

interface AnalyticsScreenProps {
  accent: string;
}

export function AnalyticsScreen({ accent }: Readonly<AnalyticsScreenProps>) {
  const netWorth = [10100,10800,11200,10900,11800,12100,11900,12320,12100,12500,12840,13050];
  const months   = ['dic','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov'];

  const merchants = [
    { n: 'Mercadona',      v: 312.40, n_tx: 4, I: Icon.utensils, c: C.neg },
    { n: 'Spotify Family', v: 14.99,  n_tx: 1, I: Icon.music,    c: C.purple },
    { n: 'Repsol',         v: 108.40, n_tx: 2, I: Icon.car,      c: C.warn },
    { n: 'Amazon',         v: 158.30, n_tx: 4, I: Icon.bag,      c: C.primary },
    { n: 'IKEA',           v: 184.00, n_tx: 1, I: Icon.house,    c: C.warn },
    { n: 'Glovo',          v: 92.80,  n_tx: 3, I: Icon.utensils, c: C.neg },
  ];
  const maxMerchant = Math.max(...merchants.map(m => m.v));

  const heatmap: number[][] = [];
  for (let w = 0; w < 8; w++) {
    const row: number[] = [];
    for (let d = 0; d < 7; d++) {
      const v = ((Math.sin((w * 7 + d) * 1.3) + 1) / 2);
      row.push(v < 0.15 ? 0 : v);
    }
    heatmap.push(row);
  }

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <SummaryStat label="Patrimonio neto"    value="S/ 13,050" delta="+8.2%" kind="pos"     I={Icon.trendUp} />
        <SummaryStat label="Ahorro 12 meses"    value="S/ 5,470"  sub="42% tasa ahorro"        kind="primary" I={Icon.target} />
        <SummaryStat label="Gasto medio"        value="S/ 3,180"  delta="−2.1%" kind="neg"     I={Icon.arrowDown} />
        <SummaryStat label="Categorías activas" value="10"        sub="2 sobre presupuesto"    kind="primary" I={Icon.chart} />
      </div>

      {/* Net worth chart */}
      <Card>
        <CardHeader
          title="Patrimonio neto"
          subtitle="Activos − pasivos · 12 meses"
          right={
            <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: C.textDim }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 0 3px ${accent}22` }} />
                Neto <b style={{ color: C.text, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>S/ 13,050</b>
              </span>
              <span style={{ color: C.pos, fontVariantNumeric: 'tabular-nums' }}>+S/ 2,950 12m</span>
            </div>
          }
          action="Detalle"
        />
        <Sparkline data={netWorth} color={accent} width={1100} height={240} strokeWidth={2.5} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
          {months.map(m => <span key={m}>{m}</span>)}
        </div>
      </Card>

      {/* Heatmap + merchants */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <Card>
          <CardHeader
            title="Hábito de gasto"
            subtitle="Últimas 8 semanas · cuanto más oscuro, más gasto"
            right={<Tag bg={`${accent}1F`} color={accent}>S/ 162 / día medio</Tag>}
          />
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: C.textMute, marginTop: 18 }}>
              {['L','M','X','J','V','S','D'].map(d => <span key={d} style={{ height: 22, display: 'grid', placeItems: 'center' }}>{d}</span>)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMute, marginBottom: 4 }}>
                {Array.from({ length: 8 }).map((_, w) => <span key={w}>S{w + 1}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
                {Array.from({ length: 7 }).map((_, d) =>
                  Array.from({ length: 8 }).map((_, w) => {
                    const v = heatmap[w][d];
                    return (
                      <div key={`${w}-${d}`} style={{
                        height: 22,
                        gridColumn: w + 1, gridRow: d + 1,
                        borderRadius: 4,
                        background: v === 0 ? 'rgba(63,86,28,0.04)' : `rgba(63,86,28,${0.18 + v * 0.55})`,
                        border: `1px solid ${C.border}`,
                      }} />
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: C.textMute }}>
            <span>menos</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0.04,0.2,0.4,0.6,0.75].map((v, i) => (
                <div key={i} style={{ width: 14, height: 12, borderRadius: 3, background: `rgba(63,86,28,${v})`, border: `1px solid ${C.border}` }} />
              ))}
            </div>
            <span>más</span>
            <div style={{ flex: 1 }} />
            <span><b style={{ color: C.text }}>Viernes</b> tu día más caro · S/ 52 media</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Comercios top" subtitle="Por gasto este mes" action="Ver todos" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {merchants.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: m.c + '1F', color: m.c, display: 'grid', placeItems: 'center' }}>
                    <m.I size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{m.n}</div>
                    <div style={{ fontSize: 10.5, color: C.textMute }}>{m.n_tx} transacc.</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>
                    S/ {m.v.toFixed(2)}
                  </div>
                </div>
                <ProgressBar pct={(m.v / maxMerchant) * 100} color={m.c} height={3} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly comparison */}
      <Card>
        <CardHeader
          title="Ingresos vs gastos por mes"
          subtitle="6 meses · barras pareadas"
          right={
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: C.textDim }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: C.pos }} /> Ingresos
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: C.primary }} /> Gastos
              </span>
            </div>
          }
        />
        <PairedBars height={220} />
      </Card>

      {/* AI summary */}
      <Card style={{ borderColor: `${C.primary}33` }}>
        <CardHeader
          title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.sparkles size={14} style={{ color: C.primary }} />Resumen del mes</span>}
          subtitle="Generado por análisis sobre tus 19 transacciones de noviembre"
          right={<Tag bg={`${C.primary}22`} color={C.primary} dot={C.primary}>AI</Tag>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { I: Icon.check,    c: C.pos,     title: 'Vas bien en ahorro',        body: 'S/ 2,020 ahorrados — 4% por encima de tu meta mensual de S/ 1,950.' },
            { I: Icon.alert,    c: C.warn,    title: 'Comida creció +32%',        body: 'Restaurantes y delivery acumulan S/ 890 (vs S/ 675 en oct). Considera un tope semanal.' },
            { I: Icon.sparkles, c: C.primary, title: '2 suscripciones inactivas', body: 'No usas Filmin ni YouTube Premium hace 30+ días. Ahorrarías S/ 20/mes cancelando.' },
          ].map((it, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: it.c + '1F', color: it.c, display: 'grid', placeItems: 'center' }}>
                <it.I size={15} />
              </div>
              <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{it.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
