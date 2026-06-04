import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui';
import { NotionDataTabs } from './NotionDataTabs';
import { EmptyRow, HeaderCell, cellStyle, money, rowStyle, tableShell } from './NotionTable';
import type {
  CategoriaRow,
  CuentaBancariaRow,
  DeudaRow,
  GastoDeudaRow,
  GastoUnicoRow,
  IngresoRow,
  PrestamoRow,
  TransferenciaRow,
} from '@/shared/types/finance.types';
import type { NotionDataTab } from './types';

interface SyncedData {
  ingresos: IngresoRow[];
  gastosUnicos: GastoUnicoRow[];
  gastosDeudas: GastoDeudaRow[];
  deudas: DeudaRow[];
  cuentasBancarias: CuentaBancariaRow[];
  transferencias: TransferenciaRow[];
  categoriasGastos: CategoriaRow[];
  categoriasIngreso: CategoriaRow[];
  prestamos: PrestamoRow[];
}

interface NotionSyncedDataCardProps {
  data: SyncedData;
  dataLoading: boolean;
  dataTab: NotionDataTab;
  onTabChange: (tab: NotionDataTab) => void;
  onRefresh: () => void;
}

const fmtFecha = formatNotionDate;

export function NotionSyncedDataCard({ data, dataLoading, dataTab, onTabChange, onRefresh }: NotionSyncedDataCardProps) {
  const {
    ingresos,
    gastosUnicos,
    gastosDeudas,
    deudas,
    cuentasBancarias,
    transferencias,
    categoriasGastos,
    categoriasIngreso,
    prestamos,
  } = data;

  const total = ingresos.length + gastosUnicos.length + gastosDeudas.length + deudas.length + cuentasBancarias.length + transferencias.length + categoriasGastos.length + categoriasIngreso.length + prestamos.length;
  if (total === 0 && !dataLoading) return null;

  const tabs = [
    { id: 'ingresos', label: 'Ingresos', count: ingresos.length },
    { id: 'gastos_unicos', label: 'Gastos Unicos', count: gastosUnicos.length },
    { id: 'gastos_deudas', label: 'Gastos por Deudas', count: gastosDeudas.length },
    { id: 'deudas_suscripciones', label: 'Deudas/Suscr.', count: deudas.length },
    { id: 'cuentas_bancarias', label: 'Cuentas Banc.', count: cuentasBancarias.length },
    { id: 'transferencias', label: 'Transferencias', count: transferencias.length },
    { id: 'categorias_gastos', label: 'Cat. Gastos', count: categoriasGastos.length },
    { id: 'categorias_ingreso', label: 'Cat. Ingreso', count: categoriasIngreso.length },
    { id: 'prestamos', label: 'Prestamos', count: prestamos.length },
  ] as const satisfies ReadonlyArray<{ id: NotionDataTab; label: string; count: number }>;

  return (
    <Card>
      <CardHeader
        title="Datos sincronizados"
        subtitle={`${total} registros totales`}
        right={
          <button onClick={onRefresh} disabled={dataLoading}
            style={{ background: 'none', border: 'none', cursor: dataLoading ? 'default' : 'pointer', color: C.textMute, fontSize: 12, fontFamily: 'var(--font-ui)', padding: 0 }}>
            {dataLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        }
      />

      <NotionDataTabs tabs={tabs} activeTab={dataTab} onTabChange={onTabChange} />

      {dataLoading && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>
      )}

      {!dataLoading && dataTab === 'ingresos' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Ingreso', 'Categoria', 'Cuenta Bancaria', 'Fecha'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {ingresos.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, ingresos.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, ingresos.length, { color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{money(row.ingreso)}</td>
                <td style={cellStyle(i, ingresos.length, { color: C.textDim })}>{row.categoriaIngreso || '-'}</td>
                <td style={cellStyle(i, ingresos.length, { color: C.textDim })}>{row.cuentaBancaria || '-'}</td>
                <td style={cellStyle(i, ingresos.length, { color: C.textMute, whiteSpace: 'nowrap' })}>{row.fecha ? fmtFecha(row.fecha) : '-'}</td>
              </tr>
            ))}
            {ingresos.length === 0 && <EmptyRow colSpan={5} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'gastos_unicos' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Categoria', 'Cuenta Bancaria', 'Monto', 'Fecha'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {gastosUnicos.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, gastosUnicos.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, gastosUnicos.length, { color: C.textDim })}>{row.categoriaGasto || '-'}</td>
                <td style={cellStyle(i, gastosUnicos.length, { color: C.textDim })}>{row.cuentaBancaria || '-'}</td>
                <td style={cellStyle(i, gastosUnicos.length, { color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{money(row.monto)}</td>
                <td style={cellStyle(i, gastosUnicos.length, { color: C.textMute, whiteSpace: 'nowrap' })}>{row.fecha ? fmtFecha(row.fecha) : '-'}</td>
              </tr>
            ))}
            {gastosUnicos.length === 0 && <EmptyRow colSpan={5} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'deudas_suscripciones' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Estado', 'Fecha Inicio', 'Cantidad', 'Ciclo', 'Tipo Pago', 'Hay cuotas?', 'Monto Pagado', 'Cuotas Pend.'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {deudas.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, deudas.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, deudas.length, { color: C.textDim, maxWidth: 220 })}><span title={row.estado} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.estado || '-'}</span></td>
                <td style={cellStyle(i, deudas.length, { color: C.textMute, whiteSpace: 'nowrap', fontSize: 12 })}>{row.fechaInicio ? fmtFecha(row.fechaInicio) : '-'}</td>
                <td style={cellStyle(i, deudas.length, { color: C.neg, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.cantidad)}</td>
                <td style={cellStyle(i, deudas.length, { color: C.textDim })}>{row.ciclo || '-'}</td>
                <td style={cellStyle(i, deudas.length, { color: C.textDim })}>{row.tipoPago || '-'}</td>
                <td style={cellStyle(i, deudas.length, { color: C.textDim, textAlign: 'center' })}>{row.hayCuotas != null ? row.hayCuotas : '-'}</td>
                <td style={cellStyle(i, deudas.length, { color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.montoPagado)}</td>
                <td style={cellStyle(i, deudas.length, { color: (row.cuotasPendientes ?? 0) > 0 ? C.warn : C.pos, textAlign: 'center', fontWeight: 700 })}>{row.cuotasPendientes != null ? row.cuotasPendientes : '-'}</td>
              </tr>
            ))}
            {deudas.length === 0 && <EmptyRow colSpan={9} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'gastos_deudas' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Categoria', 'Cuenta Bancaria', 'Monto Gastado', 'Cual deuda?', 'Fecha'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {gastosDeudas.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, gastosDeudas.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, gastosDeudas.length, { color: C.textDim })}>{row.categoriaGasto || '-'}</td>
                <td style={cellStyle(i, gastosDeudas.length, { color: C.textDim })}>{row.cuentaBancaria || '-'}</td>
                <td style={cellStyle(i, gastosDeudas.length, { color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{money(row.montoGastado)}</td>
                <td style={cellStyle(i, gastosDeudas.length, { color: C.textDim })}>{row.cualDeuda || '-'}</td>
                <td style={cellStyle(i, gastosDeudas.length, { color: C.textMute, whiteSpace: 'nowrap' })}>{row.fecha ? fmtFecha(row.fecha) : '-'}</td>
              </tr>
            ))}
            {gastosDeudas.length === 0 && <EmptyRow colSpan={6} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'cuentas_bancarias' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Tipo', 'Banco', 'Moneda', 'Saldo', 'Estado'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {cuentasBancarias.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, cuentasBancarias.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, cuentasBancarias.length, { color: C.textDim })}>{row.tipo || '-'}</td>
                <td style={cellStyle(i, cuentasBancarias.length, { color: C.textDim })}>{row.banco || '-'}</td>
                <td style={cellStyle(i, cuentasBancarias.length, { color: C.textDim })}>{row.moneda || '-'}</td>
                <td style={cellStyle(i, cuentasBancarias.length, { color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.saldo)}</td>
                <td style={cellStyle(i, cuentasBancarias.length, { color: C.textDim })}>{row.estado || '-'}</td>
              </tr>
            ))}
            {cuentasBancarias.length === 0 && <EmptyRow colSpan={6} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'transferencias' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Monto', 'Cuenta Origen', 'Cuenta Destino', 'Fecha', 'Notas'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {transferencias.map((row, i) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, transferencias.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, transferencias.length, { color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.monto)}</td>
                <td style={cellStyle(i, transferencias.length, { color: C.textDim })}>{row.cuentaOrigen || '-'}</td>
                <td style={cellStyle(i, transferencias.length, { color: C.textDim })}>{row.cuentaDestino || '-'}</td>
                <td style={cellStyle(i, transferencias.length, { color: C.textMute, whiteSpace: 'nowrap' })}>{row.fecha ? fmtFecha(row.fecha) : '-'}</td>
                <td style={cellStyle(i, transferencias.length, { color: C.textDim, maxWidth: 220 })}>{row.notas || '-'}</td>
              </tr>
            ))}
            {transferencias.length === 0 && <EmptyRow colSpan={6} />}
          </tbody>
        </>
      )}

      {!dataLoading && dataTab === 'prestamos' && tableShell(
        <>
          <thead><tr>{['Nombre', 'Monto Prestado', 'Cuenta', 'Fecha', 'Monto Pagado', 'Faltante'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {prestamos.map((row, i) => {
              const faltante = row.cantidadFaltante ?? ((row.montoPrestamo ?? 0) - (row.montoPagado ?? 0));
              return (
                <tr key={row.id} style={rowStyle(i)}>
                  <td style={cellStyle(i, prestamos.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                  <td style={cellStyle(i, prestamos.length, { color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.montoPrestamo)}</td>
                  <td style={cellStyle(i, prestamos.length, { color: C.textDim })}>{row.cuentaBancaria || '-'}</td>
                  <td style={cellStyle(i, prestamos.length, { color: C.textMute, whiteSpace: 'nowrap' })}>{row.fecha ? fmtFecha(row.fecha) : '-'}</td>
                  <td style={cellStyle(i, prestamos.length, { color: C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>{money(row.montoPagado)}</td>
                  <td style={cellStyle(i, prestamos.length, { color: faltante > 0 ? C.neg : C.pos, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })}>S/ {faltante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
            {prestamos.length === 0 && <EmptyRow colSpan={6} />}
          </tbody>
        </>
      )}

      {!dataLoading && (dataTab === 'categorias_gastos' || dataTab === 'categorias_ingreso') && tableShell(
        <>
          <thead><tr>{['Nombre', 'Tipo'].map(h => <HeaderCell key={h}>{h}</HeaderCell>)}</tr></thead>
          <tbody>
            {(dataTab === 'categorias_gastos' ? categoriasGastos : categoriasIngreso).map((row, i, arr) => (
              <tr key={row.id} style={rowStyle(i)}>
                <td style={cellStyle(i, arr.length, { fontWeight: 600, color: C.text })}>{row.nombre || '-'}</td>
                <td style={cellStyle(i, arr.length, { color: C.textDim })}>{row.tipo || '-'}</td>
              </tr>
            ))}
            {(dataTab === 'categorias_gastos' ? categoriasGastos : categoriasIngreso).length === 0 && <EmptyRow colSpan={2} />}
          </tbody>
        </>
      )}
    </Card>
  );
}
