import type { CuentaBancariaRow } from '@/shared/types/finance.types';
import { formatCurrency, formatRelativeDate } from '@/lib/format';
import { BANK_META } from './constants';

export function getBankMeta(banco: string) {
  const b = (banco ?? '').toLowerCase();
  for (const [key, meta] of Object.entries(BANK_META)) {
    if (b.includes(key)) return meta;
  }
  return { color: '#fff', bg: '#8FA88F' };
}

export function fmt(v: number) {
  return formatCurrency(v);
}

export function fmtDate(fecha: string | null) {
  return formatRelativeDate(fecha);
}

export function isCreditAccount(cuenta: CuentaBancariaRow): boolean {
  const tipo = (cuenta.tipo ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return tipo.includes('credit');
}
