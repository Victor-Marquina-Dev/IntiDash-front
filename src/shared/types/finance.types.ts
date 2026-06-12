export interface SyncTableResult {
  table:      string;
  status:     'ok' | 'error' | 'skipped';
  rowsSynced: number;
  error?:     string;
}

export interface SyncRun {
  id:           string;
  workspaceId:  string;
  status:       'running' | 'ok' | 'partial' | 'error';
  tableResults: SyncTableResult[];
  startedAt:    string | null;
  finishedAt:   string | null;
}

export interface IngresoRow {
  id: string;
  nombre: string;
  ingreso: number | null;
  categoriaIngreso: string;
  cuentaBancaria: string;
  fecha: string | null;
  syncedAt?: string;
}

export interface GastoUnicoRow {
  id: string;
  nombre: string;
  categoriaGasto: string;
  cuentaBancaria: string;
  monto: number | null;
  fecha: string | null;
  syncedAt?: string;
}

export interface GastoDeudaRow {
  id: string;
  nombre: string;
  categoriaGasto: string;
  cuentaBancaria: string;
  montoGastado: number | null;
  cualDeuda: string;
  fecha: string | null;
  syncedAt?: string;
}

export interface DeudaRow {
  id: string;
  nombre: string;
  estado: string;
  fechaInicio: string | null;
  cantidad: number | null;
  ciclo: string;
  tipoPago: string;
  hayCuotas: number | null;
  montoPagado: number | null;
  cuotasPendientes: number | null;
}

export interface CuentaBancariaRow {
  id: string;
  nombre: string;
  tipo: string;
  banco: string;
  moneda: string;
  balance?: number | null;
  saldo?: number | null;
  credito?: number | null;
  balanceInicial?: number | null;
  estado: string;
  fechaApertura?: string | null;
}

export interface TransferenciaRow {
  id: string;
  nombre: string;
  monto: number | null;
  cuentaOrigen: string;
  cuentaDestino: string;
  fecha: string | null;
  notas?: string;
}

export interface CategoriaRow {
  id: string;
  nombre: string;
  tipo: string;
  gastosPorDeuda?: number | null;
  gastosUnicos?: number | null;
  ingresosTotales?: number | null;
}

export interface PrestamoRow {
  id: string;
  nombre: string;
  montoPrestamo: number | null;
  cuentaBancaria: string;
  montoPagado: number | null;
  cantidadFaltante: number | null;
  fecha: string | null;
}

export interface GoalRow {
  id: string;
  nombre: string;
  descripcion: string;
  montoMeta: number | null;
  montoActual: number;
  fechaFin: string | null;
  estado: string;
  color: string;
  icono: string;
  notionPageId?: string | null;
  syncedAt?: string | null;
}

export interface DbTransaction {
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

export interface DataSource {
  id: string;
  name: string;
}

export interface DbProperty {
  name: string;
  type: string;
}

export interface MonthlyChartData {
  year: number;
  income: (number | null)[];
  expense: (number | null)[];
}

export interface MonthlyDebtData {
  year: number;
  currentRemaining: number;
  monthlyPayments: number[];
  remaining: (number | null)[];
}

export interface BalanceSummary {
  balanceTotal?: number | null;
  total?: number | null;
  patrimonio?: number | null;
  flujoNeto?: number | null;
}

export interface CreateOptions {
  categoriasIngreso: string[];
  cuentasBancarias: string[];
  categoriasGasto: string[];
  deudas: string[];
}

export interface PresupuestoLimiteRow {
  id: string;
  categoria: string;
  limite: number;
  color: string;
  createdAt?: string | null;
}

export interface NotionConfig {
  isConfigured?: boolean;
  notionTokenMasked?: string | null;
  notionDataSources?: DataSource[];
  ingresosSourceId?: string | null;
  gastosUnicosSourceId?: string | null;
  gastosDeudasSourceId?: string | null;
  deudasSourceId?: string | null;
  cuentasBancariasSourceId?: string | null;
  transferenciasSourceId?: string | null;
  categoriasGastosSourceId?: string | null;
  categoriasIngresoSourceId?: string | null;
  prestamosSourceId?: string | null;
  [key: string]: unknown;
}
