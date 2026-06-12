import { apiClient, downloadBlob, getOr } from './api-client';
import type {
  BalanceSummary,
  CategoriaRow,
  CreateOptions,
  CuentaBancariaRow,
  DataSource,
  DeudaRow,
  DbProperty,
  GastoDeudaRow,
  GastoUnicoRow,
  GoalRow,
  IngresoRow,
  MonthlyChartData,
  MonthlyDebtData,
  NotionConfig,
  PrestamoRow,
  PresupuestoLimiteRow,
  SyncRun,
  TransferenciaRow,
} from '@/shared/types/finance.types';

export const EMPTY_CREATE_OPTIONS: CreateOptions = {
  categoriasIngreso: [],
  cuentasBancarias: [],
  categoriasGasto: [],
  deudas: [],
};

const base = '/notion-payments';

export const NOTION_SYNC_ENDPOINTS = [
  `${base}/sync-ingresos`,
  `${base}/sync-gastos-unicos`,
  `${base}/sync-gastos-deudas`,
  `${base}/sync-deudas`,
  `${base}/sync-cuentas-bancarias`,
  `${base}/sync-transferencias`,
  `${base}/sync-categorias-gastos`,
  `${base}/sync-categorias-ingreso`,
  `${base}/sync-prestamos`,
] as const;

export const notionPaymentsService = {
  health: () => apiClient.get<unknown>('/health'),
  getIngresos: () => getOr<IngresoRow[]>(`${base}/ingresos`, []),
  getGastosUnicos: () => getOr<GastoUnicoRow[]>(`${base}/gastos-unicos`, []),
  getGastosDeudas: () => getOr<GastoDeudaRow[]>(`${base}/gastos-deudas`, []),
  getDeudasSuscripciones: () => getOr<DeudaRow[]>(`${base}/deudas-suscripciones`, []),
  getCuentasBancarias: () => getOr<CuentaBancariaRow[]>(`${base}/cuentas-bancarias`, []),
  updateCuenta: (id: string, data: Partial<CuentaBancariaRow>) => apiClient.patch<{ ok: boolean }>(`${base}/cuentas-bancarias/${id}`, data),
  getTransferencias: () => getOr<TransferenciaRow[]>(`${base}/transferencias`, []),
  getCategoriasGastos: () => getOr<CategoriaRow[]>(`${base}/categorias-gastos`, []),
  getCategoriasIngreso: () => getOr<CategoriaRow[]>(`${base}/categorias-ingreso`, []),
  getPrestamos: () => getOr<PrestamoRow[]>(`${base}/prestamos`, []),
  getMonthlyChart: () => getOr<MonthlyChartData | null>(`${base}/monthly-chart`, null),
  getMonthlyDebt: () => getOr<MonthlyDebtData | null>(`${base}/monthly-debt`, null),
  getBalanceSummary: () => getOr<BalanceSummary | null>(`${base}/balance-summary`, null),
  getOptions: () => getOr<CreateOptions>(`${base}/options`, EMPTY_CREATE_OPTIONS),
  getConfig: () => getOr<NotionConfig | null>(`${base}/config`, null),
  getDatabases: () => apiClient.get<DataSource[]>(`${base}/databases`),
  searchDatabases: (notionToken: string) => apiClient.post<DataSource[]>(`${base}/config/search-databases`, { notionToken }),
  getDatabaseProperties: (dbId: string) => apiClient.get<DbProperty[]>(`${base}/databases/${dbId}/properties`),

  getSyncedData: async () => {
    const [ingresos, gastosU, gastosD, deudas, cuentas, transf, catGastos, catIngreso, prestamos] = await Promise.all([
      notionPaymentsService.getIngresos(),
      notionPaymentsService.getGastosUnicos(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getDeudasSuscripciones(),
      notionPaymentsService.getCuentasBancarias(),
      notionPaymentsService.getTransferencias(),
      notionPaymentsService.getCategoriasGastos(),
      notionPaymentsService.getCategoriasIngreso(),
      notionPaymentsService.getPrestamos(),
    ]);
    return { ingresos, gastosU, gastosD, deudas, cuentas, transf, catGastos, catIngreso, prestamos };
  },

  saveConfig: (body: Partial<NotionConfig> & { notionToken?: string }) => apiClient.put<NotionConfig>(`${base}/config`, body),
  patchPrestamo: (id: string, body: Partial<PrestamoRow>) => apiClient.patch<PrestamoRow>(`${base}/prestamos/${id}`, body),
  createPrestamo: (body: Partial<PrestamoRow>) => apiClient.post<PrestamoRow>(`${base}/create-prestamo`, body),
  createIngreso: (body: Partial<IngresoRow>) => apiClient.post<IngresoRow>(`${base}/create-ingreso`, body),
  updateIngreso: (id: string, body: Partial<IngresoRow>) => apiClient.patch<{ updated: boolean }>(`${base}/ingresos/${id}`, body),
  deleteIngreso: (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/ingresos/${id}`),
  createGastoUnico: (body: Partial<GastoUnicoRow>) => apiClient.post<GastoUnicoRow>(`${base}/create-gasto-unico`, body),
  updateGastoUnico: (id: string, body: Partial<GastoUnicoRow>) => apiClient.patch<{ updated: boolean }>(`${base}/gastos-unicos/${id}`, body),
  deleteGastoUnico: (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/gastos-unicos/${id}`),
  createGastoDeuda: (body: Partial<GastoDeudaRow>) => apiClient.post<GastoDeudaRow>(`${base}/create-gasto-deuda`, body),
  updateGastoDeuda: (id: string, body: Partial<GastoDeudaRow>) => apiClient.patch<{ updated: boolean }>(`${base}/gastos-deudas/${id}`, body),
  deleteGastoDeuda: (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/gastos-deudas/${id}`),
  createDeudaSuscripcion: (body: Partial<DeudaRow>) => apiClient.post<DeudaRow>(`${base}/create-deuda-suscripcion`, body),
  updateDeudaSuscripcion: (id: string, body: Partial<DeudaRow>) => apiClient.patch<{ updated: boolean }>(`${base}/deudas-suscripciones/${id}`, body),
  deleteDeudaSuscripcion: (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/deudas-suscripciones/${id}`),
  createCategoriaGasto: (body: Partial<CategoriaRow>) => apiClient.post<CategoriaRow>(`${base}/create-categoria-gasto`, body),
  createCategoriaIngreso: (body: Partial<CategoriaRow>) => apiClient.post<CategoriaRow>(`${base}/create-categoria-ingreso`, body),
  createCuenta: (body: Partial<CuentaBancariaRow>) => apiClient.post<CuentaBancariaRow>(`${base}/create-cuenta`, body),

  getGoals:    () => getOr<GoalRow[]>(`${base}/goals`, []),
  createGoal:  (body: Partial<GoalRow>) => apiClient.post<{ id: string; created: boolean }>(`${base}/goals`, body),
  updateGoal:  (id: string, body: Partial<GoalRow>) => apiClient.patch<{ updated: boolean }>(`${base}/goals/${id}`, body),
  deleteGoal:  (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/goals/${id}`),

  getPresupuestoLimites:    () => getOr<PresupuestoLimiteRow[]>(`${base}/presupuesto-limites`, []),
  createPresupuestoLimite:  (body: { categoria: string; limite: number; color: string }) => apiClient.post<{ id: string; created: boolean }>(`${base}/presupuesto-limites`, body),
  updatePresupuestoLimite:  (id: string, body: Partial<PresupuestoLimiteRow>) => apiClient.patch<{ updated: boolean }>(`${base}/presupuesto-limites/${id}`, body),
  deletePresupuestoLimite:  (id: string) => apiClient.delete<{ deleted: boolean }>(`${base}/presupuesto-limites/${id}`),

  disconnectToken: () => apiClient.delete<{ disconnected: boolean }>(`${base}/config/token`),
  sync: (endpoint: string) => apiClient.post<unknown>(endpoint),
  syncAll: () => apiClient.post<SyncRun>(`${base}/sync-all`),
  getSyncRuns: () => apiClient.get<SyncRun[]>(`${base}/sync-runs`),
  deleteSyncedData: () => apiClient.delete<unknown>(`${base}/data`),
  downloadFinanceExport: () => downloadBlob(`${base}/export/finance.xlsx`),
};
