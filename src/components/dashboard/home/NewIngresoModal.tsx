'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { FORM_CANCEL_BUTTON_STYLE, FORM_INPUT_STYLE, FORM_LABEL_STYLE, FORM_SUBMIT_BUTTON_STYLE, ModalShell } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useCreateIngreso } from '@/shared/hooks/use-create-ingreso';
import { useCreateOptions } from '@/shared/hooks/use-create-options';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import type { IngresoRow } from '@/shared/types/finance.types';

export function NewIngresoModal({ onClose, onSuccess, initialData }: Readonly<{ onClose: () => void; onSuccess: () => void; initialData?: IngresoRow }>) {
  const isEdit = Boolean(initialData);
  const opts = useCreateOptions();
  const { status, errorMessage, createIngreso } = useCreateIngreso();
  const [nombre, setNombre]       = React.useState(initialData?.nombre ?? '');
  const [ingreso, setIngreso]     = React.useState(initialData?.ingreso != null ? String(initialData.ingreso) : '');
  const [categoria, setCategoria] = React.useState(initialData?.categoriaIngreso ?? '');
  const [cuenta, setCuenta]       = React.useState(initialData?.cuentaBancaria ?? '');
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
        await notionPaymentsService.updateIngreso(initialData.id, {
          nombre: nombre.trim(),
          ingreso: ingreso ? parseFloat(ingreso) : undefined,
          categoriaIngreso: categoria || undefined,
          cuentaBancaria: cuenta || undefined,
          fecha: fecha || undefined,
        });
        setEditStatus('ok');
        dispatchDataSynced();
        onSuccess();
        setTimeout(onClose, 900);
      } catch { setEditStatus('error'); setErrMsg('Error al actualizar el ingreso.'); }
      return;
    }
    const created = await createIngreso({
      nombre: nombre.trim(),
      ingreso: ingreso ? parseFloat(ingreso) : undefined,
      categoriaIngreso: categoria || undefined,
      cuentaBancaria: cuenta || undefined,
      fecha: fecha || undefined,
    });
    if (created) {
      onSuccess();
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
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.pos}18`, color: C.pos, display: 'grid', placeItems: 'center' }}><Icon.arrowUp size={17} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>{isEdit ? 'Editar Ingreso' : 'Nuevo Ingreso'}</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>{isEdit ? 'Los cambios se guardarán en Notion' : 'Se guardará directamente en Notion'}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar nuevo ingreso" style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>x</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Descripción del ingreso" value={nombre} onChange={e => setNombre(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Ingreso (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={ingreso} onChange={e => setIngreso(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Categoría', node: <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option value="">- Sin categoría -</option>{opts.categoriasIngreso.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Cuenta bancaria', node: <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option value="">- Sin cuenta -</option>{opts.cuentasBancarias.map(c => <option key={c} value={c}>{c}</option>)}</select> },
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

// ── New Gasto Modal ───────────────────────────────────────────────────────
