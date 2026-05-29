'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, CardHeader, Button, Eyebrow, Delta } from '@/components/ui';
import { ProgressBar } from '@/components/charts';
import type { Transaction } from '@/lib/mock-data';
import type { IconComponent } from '@/components/icons';

const API     = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const PRUEBA  = process.env.NEXT_PUBLIC_DATA_MODE === 'prueba';
const TX_URL  = PRUEBA ? `${API}/prueba/transactions` : `${API}/notion-payments/transactions`;

interface DbTransaction {
  id: string;
  descripcion: string;
  monto: number | null;
  tipo: string;
  categoria: string;
  cuenta: string;
  fecha: string | null;
  notas: string | null;
  syncedAt: string;
}

function catIcon(cat: string, tipo: string): { I: IconComponent; c: string } {
  if (tipo === 'ingreso') return { I: Icon.arrowDown, c: C.pos };
  const map: Record<string, { I: IconComponent; c: string }> = {
    'Comida':          { I: Icon.utensils, c: C.neg },
    'Transporte':      { I: Icon.car,      c: C.warn },
    'Compras':         { I: Icon.bag,      c: C.primary },
    'Suscripciones':   { I: Icon.music,    c: '#8B5CF6' },
    'Deudas':          { I: Icon.cards,    c: '#EC4899' },
    'Entretenimiento': { I: Icon.film,     c: C.primary },
    'Hogar':           { I: Icon.house,    c: C.warn },
    'Salud':           { I: Icon.heart,    c: C.pos },
    'Educación':       { I: Icon.book,     c: '#06B6D4' },
  };
  return map[cat] ?? { I: Icon.trendUp, c: C.primary };
}

function fmtTxDate(fecha: string | null): { date: string; d: string } {
  if (!fecha) return { date: '—', d: '1970-01-01' };
  const dt = new Date(fecha);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const day = dt.getDate();
  const mon = meses[dt.getMonth()];
  const h = String(dt.getHours()).padStart(2, '0');
  const m = String(dt.getMinutes()).padStart(2, '0');
  const d = dt.toISOString().slice(0, 10);
  const dateStr = (h === '00' && m === '00') ? `${day} ${mon}` : `${day} ${mon} · ${h}:${m}`;
  return { date: dateStr, d };
}

function dbToUiTx(t: DbTransaction): Transaction {
  const { I, c } = catIcon(t.categoria, t.tipo);
  const { date, d } = fmtTxDate(t.fecha);
  const amt = t.monto != null
    ? Math.abs(t.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '0.00';
  return {
    I, c,
    desc: t.descripcion || '(sin descripción)',
    cat:  t.categoria   || 'Otros',
    date,
    d,
    sign: t.tipo === 'ingreso' ? '+' : '−',
    amt,
    acc:  t.cuenta || 'Sin cuenta',
  };
}

function AccountChip({ acc }: { acc: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px 3px 6px', borderRadius: 6,
      background: 'rgba(63,86,28,0.05)', border: `1px solid ${C.border}`,
      fontSize: 11, color: C.textDim, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 14, height: 10, borderRadius: 2, background: acc.startsWith('Visa') ? '#1A3A6E' : C.primary, display: 'inline-block' }} />
      {acc}
    </span>
  );
}

function groupByDate(rows: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const r of rows) {
    if (!map.has(r.d)) map.set(r.d, []);
    map.get(r.d)!.push(r);
  }
  return [...map.entries()].map(([d, items]) => ({ d, items })).sort((a, b) => b.d.localeCompare(a.d));
}

function formatDay(iso: string) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().slice(0, 10);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  if (iso === todayStr) return `Hoy · ${dias[now.getDay()]}`;
  if (iso === yestStr)  return `Ayer · ${dias[yest.getDay()]}`;
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  return `${dias[dt.getDay()]} ${d} ${meses[mo - 1]}`;
}

function netForDay(items: Transaction[]) {
  const n = items.reduce((s, r) => s + (r.sign === '+' ? 1 : -1) * parseFloat(r.amt.replace(/,/g, '')), 0);
  return (n >= 0 ? '+' : '−') + 'S/ ' + Math.abs(n).toLocaleString('es-PE', { minimumFractionDigits: 2 });
}

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

function FilterPills({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 10px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', fontSize: 12.5, color: C.text }}>
      <span style={{ color: C.textMute }}>{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Inter', fontSize: 12.5, color: C.text, cursor: 'pointer' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CategoryBreakdown({ rows }: { rows: Transaction[] }) {
  const bycat: Record<string, number> = {};
  for (const r of rows.filter(r => r.sign === '−')) {
    bycat[r.cat] = (bycat[r.cat] || 0) + parseFloat(r.amt.replace(/,/g, ''));
  }
  const cats = Object.entries(bycat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = cats[0]?.[1] ?? 1;
  return (
    <Card>
      <CardHeader title="Por categoría" subtitle="Este período" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cats.map(([cat, v], i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, color: C.text }}>{cat}</span>
              <span style={{ fontSize: 12.5, color: C.textDim, fontVariantNumeric: 'tabular-nums' }}>S/ {v.toFixed(2)}</span>
            </div>
            <ProgressBar pct={(v / max) * 100} color={C.primary} height={4} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function TxDetail({ tx, onClose, accent: _accent }: { tx: Transaction; onClose: () => void; accent: string }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.c + '1A', color: tx.c, display: 'grid', placeItems: 'center' }}>
          <tx.I size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{tx.desc}</div>
          <div style={{ fontSize: 12, color: C.textMute }}>{tx.cat}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, fontSize: 18 }}>×</button>
      </div>
      <div style={{ fontSize: 36, fontWeight: 600, color: tx.sign === '+' ? C.pos : C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -1.2, marginBottom: 16 }}>
        {tx.sign}S/ {tx.amt}
      </div>
      {[
        ['Fecha',     tx.date],
        ['Cuenta',    tx.acc],
        ['Categoría', tx.cat],
      ].map(([label, value]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11.5, color: C.textMute, width: 100, flexShrink: 0 }}>{label}</div>
          <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{value}</div>
        </div>
      ))}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button style={{ flex: 1 }} icon={<Icon.gear size={12} />}>Editar</Button>
        <Button ghost style={{ flex: 1 }} icon={<Icon.bag size={12} />}>Dividir</Button>
      </div>
    </Card>
  );
}

function EmptyState({ onGoSettings }: { onGoSettings?: () => void }) {
  return (
    <Card pad={40} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>Sin transacciones</div>
      <div style={{ fontSize: 12.5, color: C.textMute, marginBottom: 20, lineHeight: 1.6 }}>
        Configura tu base de datos de transacciones en Ajustes<br />y haz clic en «Sincronizar transacciones».
      </div>
      {onGoSettings && (
        <Button primary icon={<Icon.gear size={13} />} onClick={onGoSettings}>Ir a Ajustes</Button>
      )}
    </Card>
  );
}

interface TransactionsScreenProps {
  accent: string;
  density: string;
  onGoSettings?: () => void;
}

export function TransactionsScreen({ accent, density, onGoSettings }: TransactionsScreenProps) {
  const [txList, setTxList] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cat, setCat] = React.useState('Todas');
  const [acc, setAcc] = React.useState('Todas');
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    fetch(TX_URL)
      .then(r => r.json())
      .then((rows: DbTransaction[]) => {
        setTxList(rows.map(dbToUiTx));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cats = React.useMemo(() => {
    const s = new Set(txList.map(t => t.cat));
    return ['Todas', ...[...s].sort()];
  }, [txList]);

  const accs = React.useMemo(() => {
    const s = new Set(txList.map(t => t.acc));
    return ['Todas', ...[...s].sort()];
  }, [txList]);

  const filtered = txList.filter(r =>
    (cat === 'Todas' || r.cat === cat) &&
    (acc === 'Todas' || r.acc === acc) &&
    (q === '' || r.desc.toLowerCase().includes(q.toLowerCase()))
  );
  const groups = groupByDate(filtered);

  const income  = filtered.filter(r => r.sign === '+').reduce((s, r) => s + parseFloat(r.amt.replace(/,/g, '')), 0);
  const expense = filtered.filter(r => r.sign === '−').reduce((s, r) => s + parseFloat(r.amt.replace(/,/g, '')), 0);
  const net = income - expense;
  const fmt = (v: number) => 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2 });
  const fmtSigned = (v: number) => (v >= 0 ? '+S/ ' : '−S/ ') + Math.abs(v).toLocaleString('es-PE', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
        Cargando transacciones…
      </div>
    );
  }

  return (
    <div style={{
      padding: density === 'compact' ? '18px 24px 32px' : '24px 32px 40px',
      display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr 280px',
      gap: density === 'compact' ? 14 : 20,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <SummaryStat label="Ingresos" value={fmt(income)}    kind="pos"     I={Icon.arrowUp} />
          <SummaryStat label="Gastos"   value={fmt(expense)}   kind="neg"     I={Icon.arrowDown} />
          <SummaryStat label="Neto"     value={fmtSigned(net)} sub={`${filtered.length} transacciones`} kind="primary" I={Icon.trendUp} />
        </div>

        {txList.length === 0
          ? <EmptyState onGoSettings={onGoSettings} />
          : (
          <>
            <Card pad={14}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="fz-search" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(63,86,28,0.04)', border: `1px solid ${C.border}`,
                  minWidth: 240, flex: 1, color: C.textDim, fontSize: 13,
                }}>
                  <Icon.search size={15} />
                  <input
                    placeholder="Buscar transacciones…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: C.text }}
                  />
                  {q && (
                    <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.textMute, fontSize: 14, padding: 0 }}>×</button>
                  )}
                </div>
                <FilterPills label="Categoría" options={cats} value={cat} onChange={v => { setCat(v); setSelected(null); }} />
                <FilterPills label="Cuenta"    options={accs} value={acc} onChange={v => { setAcc(v); setSelected(null); }} />
              </div>
            </Card>

            <Card pad={0}>
              {groups.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', color: C.textMute, fontSize: 13 }}>
                  No hay transacciones que coincidan con los filtros.
                </div>
              )}
              {groups.map((g, gi) => (
                <div key={g.d}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 10px',
                    borderTop: gi > 0 ? `1px solid ${C.border}` : 'none',
                    background: 'rgba(63,86,28,0.02)',
                  }}>
                    <Eyebrow>{formatDay(g.d)}</Eyebrow>
                    <div style={{ flex: 1, height: 1, background: C.border, marginLeft: 4 }} />
                    <div style={{ fontSize: 11, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
                      {g.items.length} mov · {netForDay(g.items)}
                    </div>
                  </div>
                  {g.items.map((r, ri) => (
                    <div
                      key={ri}
                      onClick={() => setSelected(r)}
                      className="fz-row"
                      style={{
                        display: 'grid', gridTemplateColumns: '36px 1fr 140px 100px 120px',
                        gap: 12, alignItems: 'center', padding: '11px 20px',
                        cursor: 'pointer',
                        background: selected === r ? 'rgba(63,86,28,0.06)' : 'transparent',
                        borderBottom: ri < g.items.length - 1 ? `1px solid ${C.border}` : 'none',
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: r.c + '1A', color: r.c, display: 'grid', placeItems: 'center' }}>
                        <r.I size={15} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{r.desc}</div>
                        <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 2 }}>{r.cat}</div>
                      </div>
                      <AccountChip acc={r.acc} />
                      <div style={{ fontSize: 11.5, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>{r.date.split('·')[1]?.trim()}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: r.sign === '+' ? C.pos : C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>
                        <span style={{ opacity: 0.6, marginRight: 1 }}>{r.sign}</span>S/<span>{r.amt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Card>
          </>
        )}
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        {selected
          ? <TxDetail tx={selected} onClose={() => setSelected(null)} accent={accent} />
          : <CategoryBreakdown rows={filtered} />
        }
      </aside>
    </div>
  );
}
