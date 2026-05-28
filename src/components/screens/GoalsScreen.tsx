'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Tag, Eyebrow, Delta } from '@/components/ui';
import { ProgressBar } from '@/components/charts';
import { GOALS, COMPLETED_GOALS } from '@/lib/mock-data';

function SummaryStat({ label, value, sub, delta, kind, I }: {
  label: string; value: string; sub?: string; delta?: string;
  kind: 'pos' | 'neg' | 'primary'; I: (typeof Icon)[keyof typeof Icon];
}) {
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

function GoalCard({ g }: { g: typeof GOALS[0] }) {
  const pct = Math.round((g.cur / g.tgt) * 100);
  return (
    <Card pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: g.c + '22', color: g.c, display: 'grid', placeItems: 'center' }}>
          <g.I size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: C.text, fontWeight: 600, letterSpacing: -0.2 }}>{g.n}</div>
          <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>Fecha objetivo · {g.dl}</div>
        </div>
        <Tag bg={`${g.c}22`} color={g.c}>{pct}%</Tag>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
          S/ {g.cur.toLocaleString('es-PE')}
        </span>
        <span style={{ fontSize: 14, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
          / S/ {g.tgt.toLocaleString('es-PE')}
        </span>
      </div>
      <ProgressBar pct={pct} color={g.c} height={8} />

      <div style={{ marginTop: 14, display: 'flex', gap: 12, padding: 12, borderRadius: 10, background: 'rgba(63,86,28,0.03)', border: `1px solid ${C.border}` }}>
        {[
          { label: 'Mensual', value: `S/ ${g.monthly}` },
          { label: 'ETA',     value: g.eta },
          { label: 'Falta',   value: `S/ ${(g.tgt - g.cur).toLocaleString('es-PE')}` },
        ].map((item, i, arr) => (
          <React.Fragment key={i}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: C.textMute, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>{item.value}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, background: C.border }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11.5, color: C.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon.sparkles size={12} style={{ color: C.primary }} />
        {g.note}
      </div>
    </Card>
  );
}

interface GoalsScreenProps {
  accent: string;
}

export function GoalsScreen({ accent: _accent }: Readonly<GoalsScreenProps>) {
  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <SummaryStat label="Total ahorrado" value="S/ 8,260" sub="en 4 metas activas"     kind="pos"     I={Icon.target} />
        <SummaryStat label="Meta total"     value="S/ 22,500" sub="objetivo combinado"    kind="primary" I={Icon.trendUp} />
        <SummaryStat label="Aportación nov" value="+S/ 1,150" delta="+12%"                kind="pos"     I={Icon.arrowUp} />
        <SummaryStat label="Completadas"    value="2"         sub="S/ 5,700 este año"     kind="primary" I={Icon.check} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {GOALS.map((g, i) => <GoalCard key={i} g={g} />)}
        <Card style={{ border: `1px dashed ${C.borderHi}`, background: 'rgba(63,86,28,0.02)', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.primary}14`, color: C.primary, display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
              <Icon.plus size={20} />
            </div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Nueva meta</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 4 }}>Define un objetivo y una fecha</div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Metas completadas" subtitle="2 este año · S/ 5,700 ahorrado en total" action="Histórico" />
        <div>
          {COMPLETED_GOALS.map((g, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.pos}22`, color: C.pos, display: 'grid', placeItems: 'center' }}>
                <Icon.check size={15} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{g.n}</div>
                <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>Completada · {g.when}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
                S/ {g.amt.toLocaleString('es-PE')}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
