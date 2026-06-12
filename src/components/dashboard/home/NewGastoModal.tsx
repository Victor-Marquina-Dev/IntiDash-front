'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { FORM_CANCEL_BUTTON_STYLE, FORM_INPUT_STYLE, FORM_LABEL_STYLE, FORM_SUBMIT_BUTTON_STYLE, ModalShell } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useCreateGasto, type CreateGastoTipo } from '@/shared/hooks/use-create-gasto';
import { useCreateOptions } from '@/shared/hooks/use-create-options';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSyncedSoon } from '@/shared/hooks/use-data-synced-refresh';
import type { AccountExpenseRow } from '@/components/screens/accounts/types';

export function NewGastoModal({ onClose, onSuccess, initialData }: Readonly<{ onClose: () => void; onSuccess: () => void; initialData?: AccountExpenseRow }>) {
  const isEdit = Boolean(initialData);
  const opts = useCreateOptions();
  const { status, errorMessage, reset, createGasto } = useCreateGasto();
  const [tipo, setTipo]           = React.useState<CreateGastoTipo>(initialData?.origen === 'deuda' ? 'deuda' : 'unico');
  const [nombre, setNombre]       = React.useState(initialData?.nombre ?? '');
  const [monto, setMonto]         = React.useState(initialData?.monto != null ? String(initialData.monto) : '');
  const [categoria, setCategoria] = React.useState(initialData?.categoriaGasto ?? '');
  const [cuenta, setCuenta]       = React.useState(initialData?.cuentaBancaria ?? '');
  const [cualDeuda, setCualDeuda] = React.useState(initialData?.cualDeuda ?? '');
  const [fecha, setFecha]         = React.useState(initialData?.fecha ?? new Date().toISOString().split('T')[0]);
  const [editStatus, setEditStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg]       = React.useState('');

  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setErrMsg('');
    if (isEdit && initialData) {
      setEditStatus('loading');
      try {
        if (tipo === 'deuda') {
          await notionPaymentsService.updateGastoDeuda(initialData.id, {
            nombre: nombre.trim(), montoGastado: monto ? parseFloat(monto) : undefined,
            categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined,
            cualDeuda: cualDeuda || undefined, fecha: fecha || undefined,
          });
        } else {
          await notionPaymentsService.updateGastoUnico(initialData.id, {
            nombre: nombre.trim(), monto: monto ? parseFloat(monto) : undefined,
            categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined,
            fecha: fecha || undefined,
          });
        }
        setEditStatus('ok');
        dispatchDataSyncedSoon();
        await onSuccess();
        setTimeout(onClose, 900);
      } catch { setEditStatus('error'); setErrMsg('Error al actualizar el gasto.'); }
      return;
    }
    const body = tipo === 'unico'
      ? { nombre: nombre.trim(), monto: monto ? parseFloat(monto) : undefined, categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined, fecha: fecha || undefined }
      : { nombre: nombre.trim(), montoGastado: monto ? parseFloat(monto) : undefined, categoriaGasto: categoria || undefined, cuentaBancaria: cuenta || undefined, cualDeuda: cualDeuda || undefined, fecha: fecha || undefined };
    const created = await createGasto(tipo, body);
    if (created) {
      await onSuccess();
      setTimeout(onClose, 900);
    }
  }

  const busy = status === 'loading' || status === 'ok' || editStatus === 'loading' || editStatus === 'ok';
  const submitLabel = isEdit
    ? (editStatus === 'loading' ? 'Guardando…' : editStatus === 'ok' ? '✓ Actualizado' : 'Guardar cambios')
    : (status === 'loading' ? 'Guardando...' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion');

  return (
    <ModalShell onClose={onClose}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 480, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center' }}><Icon.arrowDown size={17} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>{isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>{isEdit ? 'Los cambios se guardarán en Notion' : 'Se guardará directamente en Notion'}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar nuevo gasto" style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>x</button>
        </div>
        {/* Tipo — bloqueado en modo edición */}
        <div style={{ display: 'flex', padding: '12px 24px 0', gap: 8 }}>
          {([{ id: 'unico' as const, label: 'Gasto Único' }, { id: 'deuda' as const, label: 'Por Deuda' }]).map(t => (
            <button key={t.id} type="button"
              onClick={() => { if (!isEdit) { setTipo(t.id); reset(); setErrMsg(''); } }}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${tipo === t.id ? C.neg : C.border}`, background: tipo === t.id ? `${C.neg}14` : 'transparent', color: tipo === t.id ? C.neg : C.textMute, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: tipo === t.id ? 600 : 400, cursor: isEdit ? 'default' : 'pointer', opacity: isEdit && tipo !== t.id ? 0.4 : 1, transition: 'all 0.12s' }}>{t.label}</button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Descripción del gasto" value={nombre} onChange={e => setNombre(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Monto (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Categoría', node: <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option value="">- Sin categoría -</option>{opts.categoriasGasto.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Cuenta bancaria', node: <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option value="">- Sin cuenta -</option>{opts.cuentasBancarias.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            ...(tipo === 'deuda' ? [{ label: '¿Cuál deuda?', node: <select value={cualDeuda} onChange={e => setCualDeuda(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option value="">- Sin deuda -</option>{opts.deudas.map(d => <option key={d} value={d}>{d}</option>)}</select> }] : []),
            { label: 'Fecha', node: <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={FORM_INPUT_STYLE} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={FORM_LABEL_STYLE}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {(errMsg || errorMessage) && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg || errorMessage}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={busy} style={{ ...FORM_SUBMIT_BUTTON_STYLE, cursor: busy ? 'default' : 'pointer', background: (editStatus === 'ok' || status === 'ok') ? C.pos : C.olive, opacity: (editStatus === 'loading' || status === 'loading') ? 0.7 : 1 }}>
              {submitLabel}
            </button>
            <button type="button" onClick={onClose} style={FORM_CANCEL_BUTTON_STYLE}>Cancelar</button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

// ── Ingresos KPI card (mejorada) ──────────────────────────────────────────
