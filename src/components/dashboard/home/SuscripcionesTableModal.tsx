'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate, formatNullableCurrency } from '@/lib/format';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import type { DeudaRow, GastoDeudaRow } from '@/shared/types/finance.types';
import { Icon } from '@/components/icons';

const FONT = 'var(--font-ui),system-ui,sans-serif';
const COLOR = C.pos;
const CICLOS = ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Semanal'];

type SuscripcionRow = DeudaRow;

const fmtAmt = (n: number | null | undefined) =>
  formatNullableCurrency(n, '—');

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

interface EditState { nombre: string; cantidad: string; ciclo: string; fechaInicio: string; }
const emptyEdit = (): EditState => ({ nombre: '', cantidad: '', ciclo: 'Mensual', fechaInicio: '' });
const rowToEdit = (r: SuscripcionRow): EditState => ({
  nombre: r.nombre || '',
  cantidad: r.cantidad != null ? String(r.cantidad) : '',
  ciclo: r.ciclo || 'Mensual',
  fechaInicio: r.fechaInicio ? String(r.fechaInicio).slice(0, 10) : '',
});

const inputStyle: React.CSSProperties = {
  width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
  padding: '0 10px', fontSize: 13, fontFamily: FONT, color: C.text,
  background: '#fff', boxSizing: 'border-box', outline: 'none', marginTop: 4,
};
const labelStyle: React.CSSProperties = {
  fontSize: 10.5, color: C.textMute, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT,
};
const cancelBtnStyle: React.CSSProperties = {
  height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${C.border}`,
  background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 12.5,
  fontFamily: FONT, fontWeight: 500,
};
const saveBtnStyle: React.CSSProperties = {
  height: 32, padding: '0 16px', borderRadius: 8, border: 'none',
  background: COLOR, color: '#fff', cursor: 'pointer', fontSize: 12.5,
  fontFamily: FONT, fontWeight: 600,
};

interface RowCardProps {
  row: SuscripcionRow;
  gastosDeudas: GastoDeudaRow[];
  cuentas: string[];
  onUpdated: (r: SuscripcionRow) => void;
  onDeleted: (id: string) => void;
  onGastoCreado: (g: GastoDeudaRow) => void;
}

function RowCard({ row, gastosDeudas, cuentas, onUpdated, onDeleted, onGastoCreado }: Readonly<RowCardProps>) {
  const [editing, setEditing]       = React.useState(false);
  const [form, setForm]             = React.useState<EditState>(emptyEdit);
  const [saving, setSaving]         = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [deleting, setDeleting]     = React.useState(false);
  const [hov, setHov]               = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showPay,  setShowPay]  = React.useState(false);
  const [payCuenta, setPayCuenta] = React.useState('');
  const [payMonto,  setPayMonto]  = React.useState('');
  const [payFecha,  setPayFecha]  = React.useState('');
  const [paying,    setPaying]    = React.useState(false);
  const [hovPay,    setHovPay]    = React.useState(false);
  const [hovHist,   setHovHist]   = React.useState(false);
  const [hovEdit,   setHovEdit]   = React.useState(false);
  const [hovDel,    setHovDel]    = React.useState(false);

  const history = gastosDeudas
    .filter(g => (g.cualDeuda || '').toLowerCase() === (row.nombre || '').toLowerCase())
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  const startEdit = () => { setForm(rowToEdit(row)); setEditing(true); setConfirmDel(false); setShowPay(false); };

  const openPay = () => {
    setPayCuenta(cuentas[0] ?? '');
    setPayMonto(String(row.cantidad ?? ''));
    setPayFecha(new Date().toISOString().slice(0, 10));
    setShowPay(true);
    setEditing(false);
    setConfirmDel(false);
  };

  const pagar = async () => {
    if (!payCuenta || !payMonto) return;
    setPaying(true);
    try {
      const body: Partial<GastoDeudaRow> = {
        nombre:         row.nombre,
        categoriaGasto: 'Suscripciones',
        cuentaBancaria: payCuenta,
        montoGastado:   parseFloat(payMonto),
        cualDeuda:      row.nombre,
        fecha:          payFecha || new Date().toISOString().slice(0, 10),
      };
      const result = await notionPaymentsService.createGastoDeuda(body) as { id?: string };
      onGastoCreado({
        id:             result?.id ?? String(Date.now()),
        nombre:         body.nombre!,
        categoriaGasto: 'Suscripciones',
        cuentaBancaria: body.cuentaBancaria!,
        montoGastado:   body.montoGastado!,
        cualDeuda:      body.cualDeuda!,
        fecha:          body.fecha ?? null,
      });
      dispatchDataSynced();
      setShowPay(false);
    } catch { /* ignore */ }
    setPaying(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body: Partial<SuscripcionRow> = {
        nombre: form.nombre.trim() || row.nombre,
        cantidad: form.cantidad ? parseFloat(form.cantidad) : null,
        ciclo: form.ciclo || undefined,
        fechaInicio: form.fechaInicio || null,
      };
      await notionPaymentsService.updateDeudaSuscripcion(row.id, body);
      onUpdated({ ...row, ...body });
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const del = async () => {
    setDeleting(true);
    try {
      await notionPaymentsService.deleteDeudaSuscripcion(row.id);
      onDeleted(row.id);
    } catch { /* ignore */ }
    setDeleting(false);
  };

  return (
    <div
      style={{
        borderRadius: 12, marginBottom: 8, overflow: 'hidden',
        border: `1px solid ${editing ? `${COLOR}30` : hov ? `${COLOR}28` : C.border}`,
        background: editing ? `${COLOR}05` : hov ? `${COLOR}06` : '#fff',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Main row — click en el área de info despliega historial */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }}
        onClick={() => setShowHistory(h => !h)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: COLOR, color: '#fff',
          display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700,
          flexShrink: 0, boxShadow: `0 2px 6px ${COLOR}40`, fontFamily: FONT,
        }}>
          {initial(row.nombre)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.nombre || '—'}
            </span>
            {row.ciclo && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: COLOR, flexShrink: 0,
                background: `${COLOR}15`, border: `1px solid ${COLOR}25`,
                borderRadius: 20, padding: '2px 8px', fontFamily: FONT,
                letterSpacing: 0.2,
              }}>
                {row.ciclo}
              </span>
            )}
          </div>
          {(() => {
            const est = row.estado || '';
            const dash = est.indexOf(' - ');
            const statusLabel = (dash > 0 ? est.slice(0, dash) : est).trim();
            const proxMatch = est.match(/Próximo:\s*([\d/]+)/);
            const proxDate  = proxMatch?.[1] ?? null;
            const isAlDia   = /al.?d[ií]a/i.test(statusLabel);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                {statusLabel && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10.5, fontWeight: 600, fontFamily: FONT,
                    color: isAlDia ? C.pos : C.warn,
                    background: isAlDia ? `${C.pos}12` : `${C.warn}14`,
                    border: `1px solid ${isAlDia ? `${C.pos}25` : `${C.warn}30`}`,
                    borderRadius: 20, padding: '2px 7px',
                  }}>
                    {isAlDia ? '✓' : '!'} {statusLabel}
                  </span>
                )}
                {proxDate && (
                  <span style={{ fontSize: 10.5, color: C.textMute, fontFamily: FONT, fontWeight: 500 }}>
                    Próx: <strong style={{ color: C.textDim, fontWeight: 600 }}>{proxDate}</strong>
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 70 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: COLOR, fontVariantNumeric: 'tabular-nums', fontFamily: FONT }}>
            {fmtAmt(row.cantidad)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => (showPay ? setShowPay(false) : openPay())}
            onMouseEnter={() => setHovPay(true)}
            onMouseLeave={() => setHovPay(false)}
            title="Registrar pago"
            style={{
              height: 32, padding: '0 18px', borderRadius: 9,
              border: `1px solid ${showPay ? `${C.neg}40` : hovPay ? `${COLOR}cc` : `${COLOR}55`}`,
              background: showPay ? `${C.neg}15` : hovPay ? COLOR : `${COLOR}14`,
              color: showPay ? C.neg : hovPay ? '#fff' : COLOR,
              cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: FONT,
              boxShadow: hovPay && !showPay ? `0 4px 12px ${COLOR}40` : 'none',
              transition: 'all .18s', whiteSpace: 'nowrap',
            }}
          >
            {showPay ? '✕ Cancelar' : '$ Pagar'}
          </button>
          <button
            onClick={() => setShowHistory(h => !h)}
            onMouseEnter={() => setHovHist(true)}
            onMouseLeave={() => setHovHist(false)}
            title={showHistory ? 'Ocultar historial' : 'Ver pagos'}
            style={{
              width: 32, height: 32, borderRadius: 9,
              border: `1px solid ${showHistory ? `${COLOR}40` : hovHist ? 'rgba(17,24,39,0.18)' : 'rgba(17,24,39,0.08)'}`,
              background: showHistory ? `${COLOR}20` : hovHist ? 'rgba(17,24,39,0.09)' : 'rgba(17,24,39,0.04)',
              color: showHistory ? COLOR : hovHist ? C.textDim : C.textMute,
              cursor: 'pointer', display: 'grid', placeItems: 'center',
              fontSize: 10, transition: 'all .15s',
              boxShadow: hovHist && !showHistory ? '0 2px 8px rgba(17,24,39,0.12)' : 'none',
            }}
          >
            {showHistory ? '▲' : '▼'}
          </button>
          <button
            onClick={() => editing ? setEditing(false) : startEdit()}
            onMouseEnter={() => setHovEdit(true)}
            onMouseLeave={() => setHovEdit(false)}
            title={editing ? 'Cancelar edición' : 'Editar'}
            style={{
              width: 32, height: 32, borderRadius: 9,
              border: `1px solid ${editing ? `${C.neg}40` : hovEdit ? `${COLOR}cc` : `${COLOR}30`}`,
              background: editing ? `${C.neg}15` : hovEdit ? `${COLOR}28` : `${COLOR}10`,
              color: editing ? C.neg : COLOR,
              cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 13,
              boxShadow: hovEdit && !editing ? `0 2px 8px ${COLOR}30` : 'none',
              transition: 'all .15s',
            }}
          >
            {editing ? '✕' : '✎'}
          </button>
          {!confirmDel ? (
            <button
              onClick={() => { setConfirmDel(true); setEditing(false); }}
              onMouseEnter={() => setHovDel(true)}
              onMouseLeave={() => setHovDel(false)}
              title="Eliminar"
              style={{
                width: 32, height: 32, borderRadius: 9,
                border: `1px solid ${hovDel ? `${C.neg}70` : `${C.neg}25`}`,
                background: hovDel ? `${C.neg}20` : `${C.neg}08`,
                color: C.neg, cursor: 'pointer',
                display: 'grid', placeItems: 'center', fontSize: 13,
                boxShadow: hovDel ? `0 2px 8px ${C.neg}25` : 'none',
                transition: 'all .15s',
              }}
            >
              ✕
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={() => setConfirmDel(false)}
                style={{ height: 28, padding: '0 10px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.textDim, cursor: 'pointer', fontSize: 11.5, fontFamily: FONT }}
              >
                No
              </button>
              <button
                onClick={del}
                disabled={deleting}
                style={{ height: 28, padding: '0 10px', borderRadius: 7, border: 'none', background: C.neg, color: '#fff', cursor: 'pointer', fontSize: 11.5, fontFamily: FONT, opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de pago */}
      {showPay && (
        <div style={{ padding: '12px 14px 14px', borderTop: `1px solid ${COLOR}20`, background: `${COLOR}04` }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: FONT }}>
            Registrar pago · {row.nombre}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 150px', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Cuenta</label>
              <select
                value={payCuenta}
                onChange={e => setPayCuenta(e.target.value)}
                style={inputStyle}
              >
                {cuentas.length === 0
                  ? <option value="">Sin cuentas</option>
                  : cuentas.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>
            <div>
              <label style={labelStyle}>Monto (S/)</label>
              <input
                type="number" min="0" step="0.01"
                value={payMonto}
                onChange={e => setPayMonto(e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input
                type="date"
                value={payFecha}
                onChange={e => setPayFecha(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button onClick={() => setShowPay(false)} style={cancelBtnStyle}>Cancelar</button>
            <button
              onClick={pagar}
              disabled={paying || !payCuenta || !payMonto}
              style={{
                ...saveBtnStyle,
                opacity: (paying || !payCuenta || !payMonto) ? 0.55 : 1,
              }}
            >
              {paying ? 'Registrando...' : 'Confirmar pago'}
            </button>
          </div>
        </div>
      )}

      {/* Inline edit form */}
      {editing && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLOR}20` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 150px 150px', gap: 8, marginTop: 12, alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cantidad (S/)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.cantidad}
                onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ciclo</label>
              <select value={form.ciclo} onChange={e => setForm(f => ({ ...f, ciclo: e.target.value }))} style={inputStyle}>
                {CICLOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha inicio</label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button onClick={() => setEditing(false)} style={cancelBtnStyle}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      {showHistory && (
        <div style={{ borderTop: `1px solid ${COLOR}18`, padding: '10px 14px 14px', background: `${COLOR}04` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8, fontFamily: FONT }}>
            Historial de pagos {history.length > 0 && `· ${history.length} registro${history.length !== 1 ? 's' : ''}`}
          </div>
          {history.length === 0 ? (
            <div style={{ fontSize: 12, color: C.textMute, fontFamily: FONT, padding: '4px 0' }}>Sin pagos registrados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map(g => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px', borderRadius: 8,
                  background: '#fff', border: `1px solid ${COLOR}14`,
                }}>
                  <span style={{ fontSize: 11.5, color: C.textMute, fontFamily: FONT, flexShrink: 0, minWidth: 80 }}>
                    {g.fecha ? formatNotionDate(g.fecha) : '—'}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: C.textDim, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.cuentaBancaria || '—'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLOR, fontVariantNumeric: 'tabular-nums', fontFamily: FONT, flexShrink: 0 }}>
                    {fmtAmt(g.montoGastado)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create form ────────────────────────────────────────────────────────────

interface CreateFormProps {
  onCreated: (r: SuscripcionRow) => void;
  onCancel: () => void;
}

function CreateForm({ onCreated, onCancel }: Readonly<CreateFormProps>) {
  const [form, setForm] = React.useState<EditState>(emptyEdit);
  const [saving, setSaving] = React.useState(false);

  const create = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const body: Partial<SuscripcionRow> = {
        nombre: form.nombre.trim(),
        cantidad: form.cantidad ? parseFloat(form.cantidad) : undefined,
        ciclo: form.ciclo || undefined,
        fechaInicio: form.fechaInicio || null,
        tipoPago: 'Suscripción',
      };
      const result = await notionPaymentsService.createDeudaSuscripcion(body) as { id?: string };
      const newRow: SuscripcionRow = {
        id: result?.id ?? String(Date.now()),
        nombre: body.nombre!,
        cantidad: body.cantidad ?? null,
        ciclo: body.ciclo ?? '',
        fechaInicio: body.fechaInicio ?? null,
        tipoPago: 'Suscripción',
        estado: '',
        hayCuotas: null,
        montoPagado: null,
        cuotasPendientes: null,
      };
      onCreated(newRow);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${COLOR}30`, background: `${COLOR}06`,
      padding: 16, marginBottom: 12,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: COLOR, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: FONT }}>
        Nueva suscripción
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 150px 150px', gap: 8, alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') create(); }}
            placeholder="Netflix, Spotify..."
            autoFocus
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Cantidad (S/)</label>
          <input
            type="number" min="0" step="0.01"
            value={form.cantidad}
            onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
            placeholder="0.00"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Ciclo</label>
          <select value={form.ciclo} onChange={e => setForm(f => ({ ...f, ciclo: e.target.value }))} style={inputStyle}>
            {CICLOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Fecha inicio</label>
          <input
            type="date"
            value={form.fechaInicio}
            onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={onCancel} style={cancelBtnStyle}>Cancelar</button>
        <button
          onClick={create}
          disabled={saving || !form.nombre.trim()}
          style={{ ...saveBtnStyle, opacity: (saving || !form.nombre.trim()) ? 0.55 : 1 }}
        >
          {saving ? 'Creando...' : 'Crear suscripción'}
        </button>
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────

export function SuscripcionesModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const [rows, setRows]                 = React.useState<SuscripcionRow[]>([]);
  const [gastosDeudas, setGastosDeudas] = React.useState<GastoDeudaRow[]>([]);
  const [cuentas, setCuentas]           = React.useState<string[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [hasError, setHasError]         = React.useState(false);
  const [creating, setCreating]         = React.useState(false);
  const [hovNueva, setHovNueva]         = React.useState(false);
  const [hovClose, setHovClose]         = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      notionPaymentsService.getDeudasSuscripciones(),
      notionPaymentsService.getGastosDeudas(),
      notionPaymentsService.getCuentasBancarias(),
    ]).then(([data, gastos, ctss]) => {
      setRows((data as SuscripcionRow[]).filter(r => r.tipoPago !== 'Deuda'));
      setGastosDeudas(gastos as GastoDeudaRow[]);
      setCuentas((ctss as import('@/shared/types/finance.types').CuentaBancariaRow[]).map(c => c.nombre).filter(Boolean));
      setLoading(false);
    }).catch(() => { setHasError(true); setLoading(false); });
  }, []);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const total = rows.reduce((s, r) => s + (r.cantidad ?? 0), 0);

  const handleUpdated = (updated: SuscripcionRow) =>
    setRows(rs => rs.map(r => r.id === updated.id ? updated : r));

  const handleDeleted = (id: string) =>
    setRows(rs => rs.filter(r => r.id !== id));

  const handleCreated = (newRow: SuscripcionRow) => {
    setRows(rs => [...rs, newRow]);
    setCreating(false);
  };

  const handleGastoCreado = (g: GastoDeudaRow) =>
    setGastosDeudas(prev => [g, ...prev]);

  return (
    <ModalShell onClose={onClose} maxWidth={780}>
      <div style={{
        background: '#fafbf8', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: 780, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: FONT,
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: `${COLOR}18`, color: COLOR, display: 'grid', placeItems: 'center' }}>
            <Icon.bell size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: C.text, letterSpacing: -0.3, fontFamily: FONT }}>
              Suscripciones
            </div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1, fontFamily: FONT }}>
              {loading ? 'Cargando...' : `${rows.length} suscripción${rows.length !== 1 ? 'es' : ''} registrada${rows.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          {!loading && rows.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 6 }}>
              <div style={{ fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Total mensual</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLOR, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, marginTop: 1 }}>
                {fmtAmt(total)}
              </div>
            </div>
          )}
          <button
            onClick={() => setCreating(c => !c)}
            onMouseEnter={() => setHovNueva(true)}
            onMouseLeave={() => setHovNueva(false)}
            style={{
              height: 32, padding: '0 16px', borderRadius: 9, flexShrink: 0,
              border: `1px solid ${creating ? `${C.neg}40` : hovNueva ? `${COLOR}cc` : `${COLOR}40`}`,
              background: creating ? `${C.neg}15` : hovNueva ? COLOR : `${COLOR}14`,
              color: creating ? C.neg : hovNueva ? '#fff' : COLOR,
              cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: FONT,
              boxShadow: hovNueva && !creating ? `0 4px 12px ${COLOR}35` : 'none',
              transition: 'all .18s',
            }}
          >
            {creating ? '✕ Cancelar' : '+ Nueva'}
          </button>
          <button
            onClick={onClose}
            onMouseEnter={() => setHovClose(true)}
            onMouseLeave={() => setHovClose(false)}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              border: `1px solid ${hovClose ? `${C.neg}50` : 'rgba(17,24,39,0.10)'}`,
              background: hovClose ? `${C.neg}12` : 'rgba(17,24,39,0.05)',
              color: hovClose ? C.neg : C.textDim,
              cursor: 'pointer', display: 'grid', placeItems: 'center',
              fontSize: 16, fontFamily: 'system-ui, sans-serif', fontWeight: 400,
              boxShadow: hovClose ? `0 2px 8px ${C.neg}20` : 'none',
              transition: 'all .15s',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, scrollbarWidth: 'thin', scrollbarColor: `${COLOR}80 transparent` } as React.CSSProperties}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMute, fontSize: 13 }}>Cargando datos...</div>
          )}
          {hasError && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.neg, fontSize: 13 }}>No se pudieron cargar los datos.</div>
          )}

          {creating && (
            <CreateForm onCreated={handleCreated} onCancel={() => setCreating(false)} />
          )}

          {!loading && !hasError && rows.length === 0 && !creating && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMute, fontSize: 13 }}>
              Sin suscripciones. Crea la primera con &ldquo;+ Nueva&rdquo;.
            </div>
          )}

          {!loading && !hasError && rows.map(row => (
            <RowCard key={row.id} row={row} gastosDeudas={gastosDeudas} cuentas={cuentas}
              onUpdated={handleUpdated} onDeleted={handleDeleted} onGastoCreado={handleGastoCreado} />
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

// ── New Ingreso Modal ─────────────────────────────────────────────────────
