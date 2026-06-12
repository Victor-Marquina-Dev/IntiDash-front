'use client';

import { C } from '@/lib/colors';
import type { GastoUnicoRow, GastoDeudaRow } from '@/shared/types/finance.types';
import { COLOR_OPTS } from './constants';

export const fmt = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface Transaccion { id: string; nombre: string; fecha: string | null; monto: number; }

export const fmtDate = (fecha: string | null): string => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', timeZone: 'UTC' });
};

export function barColor(pct: number): string {
  if (pct >= 100) return C.neg;
  if (pct >= 75)  return C.warn;
  return C.pos;
}

export function gastoDelMes(
  gastosU: GastoUnicoRow[],
  gastosD: GastoDeudaRow[],
  year: number,
  month: number,
): Map<string, number> {
  const map = new Map<string, number>();
  const add = (cat: string, amt: number) => map.set(cat, (map.get(cat) ?? 0) + amt);
  for (const r of gastosU) {
    if (!r.fecha || !r.monto) continue;
    const d = new Date(r.fecha);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month)
      add(r.categoriaGasto || 'Sin categoría', r.monto);
  }
  for (const r of gastosD) {
    if (!r.fecha || !r.montoGastado) continue;
    const d = new Date(r.fecha);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month)
      add(r.categoriaGasto || 'Sin categoría', r.montoGastado);
  }
  return map;
}

export function getSugerencias(
  gastosU: GastoUnicoRow[],
  gastosD: GastoDeudaRow[],
  budgetedCats: Set<string>,
): Array<{ categoria: string; promedioMensual: number; mesesConGasto: number; sugerido: number }> {
  const monthly = new Map<string, Map<string, number>>();
  const addEntry = (cat: string, fecha: string | null, amt: number) => {
    if (!fecha || !amt || budgetedCats.has(cat)) return;
    const d = new Date(fecha);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!monthly.has(cat)) monthly.set(cat, new Map());
    const m = monthly.get(cat)!;
    m.set(key, (m.get(key) ?? 0) + amt);
  };
  for (const r of gastosU) addEntry(r.categoriaGasto || 'Sin categoría', r.fecha, r.monto ?? 0);
  for (const r of gastosD) addEntry(r.categoriaGasto || 'Sin categoría', r.fecha, r.montoGastado ?? 0);
  return [...monthly.entries()]
    .map(([categoria, byMonth]) => {
      const mesesConGasto = byMonth.size;
      const total = [...byMonth.values()].reduce((s, v) => s + v, 0);
      const promedioMensual = total / mesesConGasto;
      const sugerido = Math.ceil(promedioMensual / 50) * 50;
      return { categoria, promedioMensual, mesesConGasto, sugerido };
    })
    .sort((a, b) => b.promedioMensual - a.promedioMensual)
    .slice(0, 5);
}


export function catColor(cat: string): string {
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
  return COLOR_OPTS[h % COLOR_OPTS.length];
}

