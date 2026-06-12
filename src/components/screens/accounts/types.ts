export type AccountGroup = string;

export interface AccountExpenseRow {
  id: string;
  nombre: string;
  categoriaGasto: string;
  cuentaBancaria: string;
  monto: number | null;
  fecha: string | null;
  origen?: 'unico' | 'deuda';
  cualDeuda?: string;
  syncedAt?: string | null;
}
