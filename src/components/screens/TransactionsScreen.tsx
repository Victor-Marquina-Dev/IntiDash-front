'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { Card, Eyebrow } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { IngresoRow, GastoUnicoRow } from '@/shared/types/finance.types';

function fmt(v: number) {
  return 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2 });
}

function fmtDate(fecha: string | null) {
  if (!fecha) return '—';
  const dt = new Date(fecha);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${dt.getDate()} ${meses[dt.getMonth()]}`;
}

// ── Tabla genérica ────────────────────────────────────────────────────────
interface Col { key: string; label: string; align?: 'left' | 'right'; width?: number }

function DataTable({ cols, rows, emptyMsg, accent }: Readonly<{
  cols: Col[];
  rows: Record<string, React.ReactNode>[];
  emptyMsg: string;
  accent: string;
}>) {
  const thStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.textMute,
    textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
    borderBottom: `1px solid ${C.border}`, fontFamily: 'var(--font-ui)',
  };
  const tdStyle = (align: 'left'|'right' = 'left'): React.CSSProperties => ({
    padding: '11px 14px', fontSize: 13, color: C.text, fontFamily: 'var(--font-ui)',
    borderBottom: `1px solid ${C.border}`, textAlign: align,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: `${accent}06` }}>
            {cols.map(c => (
              <th key={c.key} style={{ ...thStyle, textAlign: c.align ?? 'left', width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: '40px 14px', textAlign: 'center', color: C.textMute, fontSize: 13 }}>
                {emptyMsg}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="fz-row" style={{ cursor: 'default' }}>
              {cols.map(c => (
                <td key={c.key} style={tdStyle(c.align)}>{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Stats top ─────────────────────────────────────────────────────────────
function Stat({ label, value, color, I }: Readonly<{
  label: string; value: string; color: string; I: (typeof Icon)[keyof typeof Icon];
}>) {
  return (
    <Card pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: color + '1F', color, display: 'grid', placeItems: 'center' }}>
          <I size={12} />
        </div>
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </Card>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────
interface TransactionsScreenProps {
  accent: string;
  density: string;
  onGoSettings?: () => void;
  canWrite?: boolean;
}

export function TransactionsScreen({ accent: _accent, density, onGoSettings: _onGoSettings }: TransactionsScreenProps) {
  const [ingresos,  setIngresos]  = React.useState<IngresoRow[]>([]);
  const [gastos,    setGastos]    = React.useState<GastoUnicoRow[]>([]);
  const [loading,   setLoading]   = React.useState(true);

  const pad = density === 'compact' ? '18px 24px 32px' : '24px 32px 40px';

  React.useEffect(() => {
    let active = true;

    Promise.all([
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
    ]).then(([ing, gas]) => {
      if (!active) return;
      setIngresos(ing);
      setGastos(gas);
    }).catch(() => {}).finally(() => {
      if (!active) return;
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const totalIngresos = ingresos.reduce((s, r) => s + (r.ingreso ?? 0), 0);
  const totalGastos   = gastos.reduce((s, r) => s + (r.monto ?? 0), 0);
  const neto          = totalIngresos - totalGastos;

  const colsIngresos: Col[] = [
    { key: 'nombre',    label: 'Descripción' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'cuenta',    label: 'Cuenta' },
    { key: 'fecha',     label: 'Fecha',   align: 'right', width: 90 },
    { key: 'monto',     label: 'Monto',   align: 'right', width: 110 },
  ];

  const rowsIngresos = ingresos.map(r => ({
    nombre:    r.nombre || '—',
    categoria: r.categoriaIngreso || '—',
    cuenta:    r.cuentaBancaria   || '—',
    fecha:     fmtDate(r.fecha),
    monto: (
      <span style={{ color: C.pos, fontWeight: 600 }}>
        +{fmt(r.ingreso ?? 0)}
      </span>
    ),
  }));

  const colsGastos: Col[] = [
    { key: 'nombre',    label: 'Descripción' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'cuenta',    label: 'Cuenta' },
    { key: 'fecha',     label: 'Fecha',  align: 'right', width: 90 },
    { key: 'monto',     label: 'Monto',  align: 'right', width: 110 },
  ];

  const rowsGastos = gastos.map(r => ({
    nombre:    r.nombre || '—',
    categoria: r.categoriaGasto || '—',
    cuenta:    r.cuentaBancaria  || '—',
    fecha:     fmtDate(r.fecha),
    monto: (
      <span style={{ color: C.neg, fontWeight: 600 }}>
        −{fmt(r.monto ?? 0)}
      </span>
    ),
  }));

  return (
    <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Stats + Sync ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flex: 1, minWidth: 0 }}>
          <Stat label="Ingresos" value={fmt(totalIngresos)} color={C.pos}  I={Icon.arrowUp}   />
          <Stat label="Gastos"   value={fmt(totalGastos)}   color={C.neg}  I={Icon.arrowDown} />
          <Stat label="Neto"     value={(neto >= 0 ? '+' : '−') + fmt(Math.abs(neto))} color={neto >= 0 ? C.pos : C.neg} I={Icon.trendUp} />
        </div>
      </div>

      {/* ── Tablas en dos columnas ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0,1].map(i => (
            <Card key={i} pad={0}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div className="fz-skeleton" style={{ height: 14, width: 100, borderRadius: 6 }} />
              </div>
              {[1,2,3,4,5].map(j => (
                <div key={j} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                  <div className="fz-skeleton" style={{ height: 13, flex: 1, borderRadius: 6 }} />
                  <div className="fz-skeleton" style={{ height: 13, width: 70, borderRadius: 6 }} />
                </div>
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* Ingresos */}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 12px',
              borderBottom: `1px solid ${C.border}`,
              background: `${C.pos}08`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${C.pos}20`, color: C.pos, display: 'grid', placeItems: 'center' }}>
                  <Icon.arrowUp size={11} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.pos, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                  Ingresos
                </span>
                <span style={{ fontSize: 11, color: C.textMute, fontWeight: 500 }}>
                  {ingresos.length} registros
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.pos, fontVariantNumeric: 'tabular-nums' }}>
                +{fmt(totalIngresos)}
              </span>
            </div>
            <DataTable cols={colsIngresos} rows={rowsIngresos} emptyMsg="Sin ingresos. Sincroniza desde Notion." accent={C.pos} />
          </Card>

          {/* Gastos */}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 12px',
              borderBottom: `1px solid ${C.border}`,
              background: `${C.neg}08`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${C.neg}20`, color: C.neg, display: 'grid', placeItems: 'center' }}>
                  <Icon.arrowDown size={11} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.neg, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                  Gastos
                </span>
                <span style={{ fontSize: 11, color: C.textMute, fontWeight: 500 }}>
                  {gastos.length} registros
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.neg, fontVariantNumeric: 'tabular-nums' }}>
                −{fmt(totalGastos)}
              </span>
            </div>
            <DataTable cols={colsGastos} rows={rowsGastos} emptyMsg="Sin gastos. Sincroniza desde Notion." accent={C.neg} />
          </Card>

        </div>
      )}
    </div>
  );
}
