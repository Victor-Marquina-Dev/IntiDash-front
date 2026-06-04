import type { NotionConfig } from '@/shared/types/finance.types';

export type Status = 'idle' | 'loading' | 'ok' | 'error';
export type SyncKey = 'ingresos' | 'gastosUnicos' | 'gastosDeudas' | 'deudas' | 'cuentasBancarias' | 'transferencias' | 'categoriasGastos' | 'categoriasIngreso' | 'prestamos';
export type SyncRowState = { status: Status; count: number | null };
export type NotionDataTab = 'ingresos' | 'gastos_unicos' | 'gastos_deudas' | 'deudas_suscripciones' | 'cuentas_bancarias' | 'transferencias' | 'categorias_gastos' | 'categorias_ingreso' | 'prestamos';
export interface NotionSourceField {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const EMPTY_SYNC_STATE: Record<SyncKey, SyncRowState> = {
  ingresos: { status: 'idle', count: null },
  gastosUnicos: { status: 'idle', count: null },
  gastosDeudas: { status: 'idle', count: null },
  deudas: { status: 'idle', count: null },
  cuentasBancarias: { status: 'idle', count: null },
  transferencias: { status: 'idle', count: null },
  categoriasGastos: { status: 'idle', count: null },
  categoriasIngreso: { status: 'idle', count: null },
  prestamos: { status: 'idle', count: null },
};

export const SYNC_TARGETS = [
  { key: 'ingresos', label: 'Ingresos', endpoint: '/notion-payments/sync-ingresos', sourceIdKey: 'ingresosSourceId' },
  { key: 'gastosUnicos', label: 'Gastos Unicos', endpoint: '/notion-payments/sync-gastos-unicos', sourceIdKey: 'gastosUnicosSourceId' },
  { key: 'gastosDeudas', label: 'Gastos por Deudas', endpoint: '/notion-payments/sync-gastos-deudas', sourceIdKey: 'gastosDeudasSourceId' },
  { key: 'deudas', label: 'Deudas/Suscripciones', endpoint: '/notion-payments/sync-deudas', sourceIdKey: 'deudasSourceId' },
  { key: 'cuentasBancarias', label: 'Cuentas Bancarias', endpoint: '/notion-payments/sync-cuentas-bancarias', sourceIdKey: 'cuentasBancariasSourceId' },
  { key: 'transferencias', label: 'Transferencias', endpoint: '/notion-payments/sync-transferencias', sourceIdKey: 'transferenciasSourceId' },
  { key: 'categoriasGastos', label: 'Categorias Gastos', endpoint: '/notion-payments/sync-categorias-gastos', sourceIdKey: 'categoriasGastosSourceId' },
  { key: 'categoriasIngreso', label: 'Categorias Ingreso', endpoint: '/notion-payments/sync-categorias-ingreso', sourceIdKey: 'categoriasIngresoSourceId' },
  { key: 'prestamos', label: 'Prestamos', endpoint: '/notion-payments/sync-prestamos', sourceIdKey: 'prestamosSourceId' },
] as const satisfies ReadonlyArray<{ key: SyncKey; label: string; endpoint: string; sourceIdKey: keyof NotionConfig }>;
