'use client';

import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Delta, Button, Eyebrow, SubKpi } from '@/components/ui';
import { Sparkline, ResponsiveSparkline, DualAreaChart, Donut, PairedBars, ProgressBar, RadialProgress } from '@/components/charts';
import { ALL_TX } from '@/lib/mock-data';
import { useBreakpoint, type BP } from '@/lib/breakpoints';
import type { Tweaks } from '@/components/tweaks';

// ── Hero balance ─────────────────────────────────────────────────────────
function HeroBalance({ accent, bp }: { accent: string; bp: BP }) {
  const data = [10100,10800,11200,10900,11800,12100,11900,12320,12100,12500,12840];
  const isDesktop = bp === 'desktop';
  const numSize  = bp === 'mobile' ? 44 : 62;
  const prefSize = bp === 'mobile' ? 26 : 36;
  const decSize  = bp === 'mobile' ? 24 : 34;
  return (
    <Card pad={30} style={{ gridColumn: isDesktop ? 'span 8' : 'span 12' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 300px' : '1fr', gap: 36, alignItems: 'stretch' }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Eyebrow */}
          <Eyebrow icon={<Icon.wallet size={12} />}>
            Balance total · todas las cuentas
          </Eyebrow>

          {/* Número principal + badge */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{
              fontSize: numSize, fontWeight: 700, color: C.text,
              letterSpacing: -2.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ color: C.textDim, fontWeight: 500, marginRight: 3, fontSize: prefSize, letterSpacing: -1 }}>S/</span>
              12,840
              <span style={{ color: C.textMute, fontSize: decSize, fontWeight: 400, letterSpacing: -1 }}>.50</span>
            </div>
            <Tag dot={C.pos} color={C.pos} bg={`${C.pos}18`} style={{ fontSize: 12, fontWeight: 500, padding: '4px 11px' }}>
              ↑ 4.2% este mes
            </Tag>
          </div>

          {/* SubKPIs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: bp === 'mobile' ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: 24, marginTop: 'auto', paddingTop: 26,
          }}>
            <SubKpi label="Cambio mensual"  value="+S/ 520.30" pos />
            <SubKpi label="Cuentas activas" value="3" />
            {bp !== 'mobile' && <SubKpi label="Sincronización" value="hace 5 min" muted />}
          </div>
        </div>

        {/* Sparkline — solo desktop */}
        {isDesktop && (
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: C.textMute }}>
              <span style={{ letterSpacing: 0.2 }}>Evolución 6 meses</span>
              <span style={{ color: C.pos, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>+S/ 2,740</span>
            </div>
            <div style={{ width: '100%' }}>
              <ResponsiveSparkline data={data} color={accent} height={92} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
              <span>may</span><span>jun</span><span>jul</span><span>ago</span><span>sep</span><span>oct</span><span>nov</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── KPI rail ─────────────────────────────────────────────────────────────
function KpiRail({ showCharts, bp }: { showCharts: boolean; bp: BP }) {
  const items = [
    { label: 'Ingresos', value: 'S/ 5,200', delta: '+8.2%', kind: 'pos' as const, I: Icon.arrowUp,   data: [3800,4200,4500,4100,4700,4900,4600,5000,4800,5100,5200] },
    { label: 'Gastos',   value: 'S/ 3,180', delta: '−2.1%', kind: 'neg' as const, I: Icon.arrowDown, data: [2800,3000,3200,2900,3400,3300,3100,3500,3200,3250,3180] },
    { label: 'Ahorro',   value: 'S/ 2,020', delta: '38%',   kind: 'pos' as const, I: Icon.trendUp,   data: [800,900,1000,1100,1200,1400,1600,1700,1800,1900,2020] },
    { label: 'Deuda',    value: 'S/ 4,150', delta: '−S/ 300', kind: 'pos' as const, I: Icon.trendDown, data: [5500,5200,5000,4800,4750,4600,4500,4450,4350,4300,4150] },
  ];
  const cols = bp === 'tablet' ? 'repeat(4, 1fr)' : '1fr 1fr';
  const span = bp === 'desktop' ? 'span 4' : 'span 12';
  return (
    <div style={{ gridColumn: span, display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
      {items.map((it, i) => (
        <Card key={i} pad={16} hoverable>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: it.kind === 'pos' ? 'rgba(140,160,90,0.18)' : 'rgba(63,86,28,0.10)',
              color: it.kind === 'pos' ? C.pos : C.neg,
              display: 'grid', placeItems: 'center',
            }}><it.I size={12} /></div>
            <div style={{ fontSize: 10.5, color: C.textMute, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{it.label}</div>
            <div style={{ flex: 1 }} />
            <Delta value={it.delta} kind={it.kind} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.7, marginTop: 12, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
            {it.value}
          </div>
          {showCharts && (
            <div style={{ marginTop: 8, marginLeft: -4, marginRight: -4, marginBottom: -4 }}>
              <Sparkline data={it.data} color={it.kind === 'pos' ? C.pos : C.neg} width={180} height={34} strokeWidth={1.5} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Chart card ───────────────────────────────────────────────────────────
function ChartCard({ chartType, accent, bp }: { chartType: Tweaks['chartType']; accent: string; bp: BP }) {
  const span = bp === 'mobile' ? 'span 12' : 'span 8';
  return (
    <Card style={{ gridColumn: span }}>
      <CardHeader
        title="Ingresos vs gastos"
        subtitle="Comparativa mensual · proyección hasta diciembre"
        right={
          <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: C.textDim, flexWrap: 'wrap' }}>
            <Legend color={C.pos} label="Ingresos" value="S/ 5,200" />
            <Legend color={C.neg} label="Gastos" value="S/ 3,180" />
            <Legend color={accent} label="Neto" value="+S/ 2,020" />
          </div>
        }
      />
      <div style={{ minHeight: 0 }}>
        {chartType === 'bars' ? <PairedBars height={240} /> : <DualAreaChart height={240} />}
      </div>
    </Card>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}22` }} />
      <span style={{ color: C.textDim }}>{label}</span>
      <span style={{ color: C.text, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ── Categories donut ─────────────────────────────────────────────────────
function CategoriesDonut({ bp }: { bp: BP }) {
  const segs = [
    { label: 'Comida',        v: 890, c: C.neg,     I: Icon.utensils },
    { label: 'Transporte',    v: 420, c: C.warn,    I: Icon.car },
    { label: 'Compras',       v: 380, c: C.primary, I: Icon.bag },
    { label: 'Suscripciones', v: 320, c: C.purple,  I: Icon.music },
    { label: 'Deudas',        v: 300, c: C.pink,    I: Icon.cards },
    { label: 'Otros',         v: 870, c: C.cyan,    I: Icon.more },
  ];
  const total = segs.reduce((s, x) => s + x.v, 0);
  const span = bp === 'desktop' ? 'span 4' : bp === 'tablet' ? 'span 4' : 'span 12';
  return (
    <Card style={{ gridColumn: span }}>
      <CardHeader title="Dónde se va el dinero" subtitle="Por categoría · noviembre" action="Ver todo" />
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flex: 1 }}>
        <Donut segments={segs} size={150} thickness={18} centerLabel="GASTO TOTAL" centerValue="S/ 3,180" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          {segs.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.textDim, minWidth: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.c, flexShrink: 0 }} />
              <span style={{ flex: 1, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{Math.round((s.v / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Categories grid ──────────────────────────────────────────────────────
function CategoriesGrid({ bp }: { bp: BP }) {
  const cats = [
    { n: 'Comida',        v: 890, p: 65, I: Icon.utensils, c: C.neg,     vs: '+32% vs oct' },
    { n: 'Transporte',    v: 420, p: 42, I: Icon.car,      c: C.warn,    vs: '+5% vs oct' },
    { n: 'Suscripciones', v: 320, p: 80, I: Icon.music,    c: C.purple,  vs: 'igual' },
    { n: 'Deudas',        v: 300, p: 35, I: Icon.cards,    c: C.pink,    vs: '−12% vs oct' },
    { n: 'Entretenimiento',v:260, p: 50, I: Icon.film,     c: C.primary, vs: '+8%' },
    { n: 'Salud',         v: 180, p: 25, I: Icon.heart,    c: C.pos,     vs: '−3%' },
    { n: 'Educación',     v: 150, p: 20, I: Icon.book,     c: C.cyan,    vs: 'igual' },
    { n: 'Compras',       v: 380, p: 55, I: Icon.bag,      c: C.primary, vs: '+18%' },
    { n: 'Hogar',         v: 240, p: 38, I: Icon.house,    c: C.warn,    vs: '−5%' },
    { n: 'Otros',         v: 90,  p: 12, I: Icon.more,     c: C.textDim, vs: '—' },
  ];
  const cols = bp === 'desktop' ? 'repeat(5, 1fr)' : bp === 'tablet' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
  return (
    <Card>
      <CardHeader title="Categorías de gasto" subtitle="10 categorías · presupuesto restante por categoría" action="Gestionar" />
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {cats.map((cat, i) => (
          <div key={i} className="fz-cat" style={{ padding: 12, borderRadius: 12, background: '#fff', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: cat.c + '22', color: cat.c, display: 'grid', placeItems: 'center' }}>
                <cat.I size={14} />
              </div>
              <div style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{cat.n}</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>S/ {cat.v}</div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={cat.p} color={cat.c} height={5} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5, color: C.textMute }}>
              <span>{cat.p}% usado</span>
              <span style={{ color: cat.vs.startsWith('+') ? C.warn : cat.vs.startsWith('−') ? C.pos : C.textMute }}>{cat.vs}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Recent transactions ──────────────────────────────────────────────────
function RecentTransactions({ bp }: { bp: BP }) {
  const rows = ALL_TX.slice(0, 7);
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';
  const gridCols = isMobile
    ? '36px 1fr 130px'
    : isDesktop
    ? '36px 1fr 140px 120px 130px'
    : '36px 1fr 120px 130px';
  return (
    <Card>
      <CardHeader
        title="Transacciones recientes" subtitle={`${rows.length} de 24 este mes`}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button ghost size="sm" icon={<Icon.filter size={12} />}>Filtrar</Button>
            {isDesktop && <Button ghost size="sm" icon={<Icon.download size={12} />}>Exportar</Button>}
          </div>
        }
        action="Ver todas"
      />
      <div>
        {rows.map((r, i) => (
          <div key={i} className="fz-row" style={{
            display: 'grid', gridTemplateColumns: gridCols,
            gap: 12, alignItems: 'center', padding: '12px 0',
            borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: r.c + '1A', color: r.c, display: 'grid', placeItems: 'center' }}>
              <r.I size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{r.desc}</div>
              <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{r.cat}</div>
            </div>
            {!isMobile && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px 3px 6px', borderRadius: 6,
                background: 'rgba(63,86,28,0.05)', border: `1px solid ${C.border}`,
                fontSize: 11, color: C.textDim, fontVariantNumeric: 'tabular-nums',
              }}>
                <span style={{ width: 14, height: 10, borderRadius: 2, background: r.acc.startsWith('Visa') ? '#1A3A6E' : C.primary, display: 'inline-block' }} />
                {r.acc}
              </span>
            )}
            {isDesktop && (
              <div style={{ fontSize: 11.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{r.date}</div>
            )}
            <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: r.sign === '+' ? C.pos : C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>
              <span style={{ opacity: 0.6, marginRight: 1 }}>{r.sign}</span>S/<span>{r.amt}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Goals side rail ──────────────────────────────────────────────────────
function Goals({ accent }: { accent: string }) {
  const goals = [
    { n: 'Viaje a Japón',    cur: 2160, tgt: 3000,  c: accent, dl: 'mar 2027' },
    { n: 'Fondo emergencia', cur: 4500, tgt: 10000, c: C.pos,  dl: 'dic 2027' },
    { n: 'Laptop nueva',     cur: 1320, tgt: 1500,  c: C.warn, dl: 'ene 2027' },
  ];
  return (
    <Card>
      <CardHeader title="Objetivos" subtitle="3 activas · 2 completadas este año" action="Nueva meta" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {goals.map((g, i) => {
          const pct = Math.round((g.cur / g.tgt) * 100);
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{g.n}</div>
                <div style={{ fontSize: 12, color: C.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: C.text, fontWeight: 500 }}>S/ {g.cur.toLocaleString('es-PE')}</span>
                  <span style={{ color: C.textMute }}> / S/ {g.tgt.toLocaleString('es-PE')}</span>
                </div>
              </div>
              <ProgressBar pct={pct} color={g.c} height={6} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: C.textMute }}>
                <span>{pct}% completado</span>
                <span>{g.dl}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Debts side rail ──────────────────────────────────────────────────────
function Debts() {
  return (
    <Card>
      <CardHeader title="Deudas" subtitle="2 activas · próximo pago en 9 días" action="Detalle" />
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14 }}>
        <RadialProgress pct={62} value="62%" label="pagado" color={C.warn} size={84} thickness={8} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.6 }}>Deuda total</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>S/ 4,150</div>
          <Delta value="−S/ 300 este mes" kind="pos" style={{ marginTop: 2 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { n: 'Préstamo coche',   amt: 'S/ 280', when: '23 nov', days: 5, pct: 70, c: C.pink },
          { n: 'Tarjeta Visa **23',amt: 'S/ 190', when: '28 nov', days: 9, pct: 45, c: C.warn },
        ].map((d, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{d.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{d.amt}</div>
            </div>
            <ProgressBar pct={d.pct} color={d.c} height={4} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: C.textMute }}>
              <span>{d.pct}% pagado</span>
              <span style={{ color: d.days < 7 ? C.primary : C.textMute }}>vence {d.when} · {d.days}d</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Insights ─────────────────────────────────────────────────────────────
function Insights() {
  const items = [
    { I: Icon.alert,    c: C.warn,    title: 'Comida +32% vs octubre',    body: 'S/ 890 gastados — revisa restaurantes y delivery' },
    { I: Icon.bell,     c: C.neg,     title: 'Visa vence en 9 días',      body: 'S/ 190 — saldo suficiente ✓' },
    { I: Icon.sparkles, c: C.primary, title: 'Cancela 2 suscripciones',   body: 'Ahorrarías S/ 24/mes · pagas sin usar 3 servicios' },
    { I: Icon.check,    c: C.pos,     title: '+4% sobre meta de ahorro',  body: 'Vas camino de S/ 2,180 al cierre del mes' },
  ];
  return (
    <Card style={{ borderColor: `${C.primary}33` }}>
      <CardHeader
        title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.sparkles size={14} style={{ color: C.primary }} />Análisis inteligente</span>}
        subtitle="Auto-generado · actualizado hace 5 min"
        right={<Tag bg={`${C.primary}22`} color={C.primary} dot={C.primary}>AI</Tag>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: it.c + '22', color: it.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <it.I size={14} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{it.title}</div>
              <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2, lineHeight: 1.4 }}>{it.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: `${C.primary}10`, border: `1px solid ${C.primary}33`, display: 'flex', gap: 12, fontSize: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textDim }}>Gasto promedio diario</div>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>S/ 106</div>
        </div>
        <div style={{ width: 1, background: C.border }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textDim }}>Proyección fin de mes</div>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>S/ 3,420</div>
        </div>
      </div>
    </Card>
  );
}

// ── DashboardHome ─────────────────────────────────────────────────────────
export function DashboardHome({ tweaks }: { tweaks: Tweaks }) {
  const bp = useBreakpoint();
  const accent = tweaks.accent;
  const isMobile = bp === 'mobile';
  const isDesktop = bp === 'desktop';

  const gap = isMobile ? 12 : tweaks.density === 'compact' ? 14 : 20;
  const pad = isMobile ? '12px 16px 24px' : tweaks.density === 'compact' ? '18px 24px 32px' : '24px 32px 40px';

  const railStyle: React.CSSProperties = isDesktop
    ? { display: 'flex', flexDirection: 'column', gap, minWidth: 0 }
    : { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap };

  return (
    <div style={{ padding: pad, display: 'grid', gridTemplateColumns: isDesktop ? '1fr 360px' : '1fr', gap }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap, minWidth: 0 }}>
        <HeroBalance accent={accent} bp={bp} />
        <KpiRail showCharts={tweaks.microCharts} bp={bp} />
        <ChartCard chartType={tweaks.chartType} accent={accent} bp={bp} />
        <CategoriesDonut bp={bp} />
        <div style={{ gridColumn: 'span 12' }}><CategoriesGrid bp={bp} /></div>
        <div style={{ gridColumn: 'span 12' }}><RecentTransactions bp={bp} /></div>
      </div>
      <div style={railStyle}>
        <Goals accent={accent} />
        <Debts />
        <Insights />
      </div>
    </div>
  );
}
