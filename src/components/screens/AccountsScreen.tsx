'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Delta, Button } from '@/components/ui';
import { Sparkline } from '@/components/charts';
import { ALL_TX, ACCOUNTS } from '@/lib/mock-data';

function DetailRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11.5, color: C.textMute, width: 110, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit' }}>{value}</div>
    </div>
  );
}

function AccountCard({ a, active, onClick, accent: _accent }: {
  a: typeof ACCOUNTS[0]; active: boolean; onClick: () => void; accent: string;
}) {
  return (
    <div onClick={onClick} style={{
      cursor: 'pointer',
      background: C.card,
      border: `1px solid ${active ? a.brand : C.border}`,
      boxShadow: active ? `0 0 0 1px ${a.brand}, 0 6px 18px ${a.brand}22` : '0 1px 2px rgba(31,48,8,0.04)',
      borderRadius: 16, padding: 20,
      transition: 'all .2s', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 24, borderRadius: 4, background: a.brand, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
          {a.n.startsWith('Visa') ? 'VISA' : 'BBVA'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{a.n}</div>
          <div style={{ fontSize: 10.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{a.num} · {a.type}</div>
        </div>
        {active && (
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: a.brand, color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Icon.check size={11} strokeWidth={3} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, color: C.text, letterSpacing: -1.1, marginTop: 18, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ opacity: 0.45, fontWeight: 500 }}>S/</span>
        {a.bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Delta value={a.delta} kind={a.kind} />
        <span style={{ fontSize: 11.5, color: C.textMute }}>este mes</span>
      </div>
      <div style={{ marginTop: 12, marginLeft: -4, marginRight: -4 }}>
        <Sparkline data={a.data} color={a.brand} width={280} height={48} strokeWidth={1.8} />
      </div>
    </div>
  );
}

interface AccountsScreenProps {
  accent: string;
}

export function AccountsScreen({ accent }: AccountsScreenProps) {
  const [sel, setSel] = React.useState(0);
  const active = ACCOUNTS[sel];

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {ACCOUNTS.map((a, i) => (
          <AccountCard key={i} a={a} active={i === sel} onClick={() => setSel(i)} accent={accent} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <Card>
          <CardHeader
            title={`${active.n} — evolución`}
            subtitle="Saldo diario · últimos 30 días"
            right={
              <div style={{ display: 'flex', gap: 6 }}>
                <Button ghost size="sm">7d</Button>
                <Button size="sm">30d</Button>
                <Button ghost size="sm">90d</Button>
                <Button ghost size="sm">1a</Button>
              </div>
            }
            action="Detalle"
          />
          <Sparkline data={active.data} color={active.brand} width={760} height={220} strokeWidth={2.5} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.textMute, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            <span>oct 20</span><span>oct 27</span><span>nov 03</span><span>nov 10</span><span>nov 18</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Detalles" subtitle={active.type} />
          <DetailRow label="Titular"           value="Victor Marquina" />
          <DetailRow label="Número"            value={active.num}         mono />
          <DetailRow label="IBAN"              value="ES** **** **** **** 2847" mono />
          <DetailRow label="Movimientos / mes" value={active.txCount} />
          <DetailRow label="Comisión mensual"  value="0,00 S/" />
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Button style={{ flex: 1 }} icon={<Icon.download size={12} />}>Extracto</Button>
            <Button ghost style={{ flex: 1 }} icon={<Icon.gear size={12} />}>Ajustes</Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Últimas transacciones" subtitle={`${active.n} · 30 días`} action="Ver todas" />
        <div>
          {ALL_TX.filter(r => r.acc === active.n).slice(0, 7).map((r, i, arr) => (
            <div key={i} className="fz-row" style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 110px 120px',
              gap: 12, alignItems: 'center', padding: '11px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: r.c + '1A', color: r.c, display: 'grid', placeItems: 'center' }}>
                <r.I size={15} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{r.desc}</div>
                <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>{r.cat}</div>
              </div>
              <div style={{ fontSize: 11.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{r.date}</div>
              <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: r.sign === '+' ? C.pos : C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>
                <span style={{ opacity: 0.6, marginRight: 1 }}>{r.sign}</span>S/<span>{r.amt}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
