'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { FORM_CANCEL_BUTTON_STYLE, FORM_INPUT_STYLE, FORM_LABEL_STYLE, ModalShell } from '@/components/ui';
import { Icon } from '@/components/icons';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';

export function NewDeudaModal({ onClose, onSuccess }: Readonly<{ onClose: () => void; onSuccess: () => void }>) {
  const [nombre, setNombre] = React.useState('');
  const [cantidad, setCantidad] = React.useState('');
  const [fechaInicio, setFechaInicio] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [ciclo, setCiclo] = React.useState('Un pago');
  const [tipoPago, setTipoPago] = React.useState('Deuda');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg] = React.useState('');

  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      await notionPaymentsService.createDeudaSuscripcion({
        nombre: nombre.trim(),
        cantidad: cantidad ? parseFloat(cantidad) : undefined,
        fechaInicio: fechaInicio || undefined,
        ciclo: ciclo || undefined,
        tipoPago: tipoPago || undefined,
      });
      setStatus('ok'); dispatchDataSynced(); onSuccess(); setTimeout(onClose, 900);
    } catch (err: unknown) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Error al crear la deuda/suscripcion');
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 480, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center' }}><Icon.cards size={17} strokeWidth={2} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nueva Deuda / Suscripción</div>
            <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>Se crea en Notion y en tabla_deudas_suscripciones</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}><span style={FORM_LABEL_STYLE}>Nombre</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Tarjeta BBVA" style={FORM_INPUT_STYLE} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span style={FORM_LABEL_STYLE}>Cantidad (S/)</span><input type="number" step="0.01" min="0" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0.00" style={FORM_INPUT_STYLE} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span style={FORM_LABEL_STYLE}>Fecha Inicio</span><input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={FORM_INPUT_STYLE} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span style={FORM_LABEL_STYLE}>Ciclo</span><select value={ciclo} onChange={e => setCiclo(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option>Un pago</option><option>Mensual</option></select></label>
          <label style={{ display: 'grid', gap: 6 }}><span style={FORM_LABEL_STYLE}>Tipo de Pago</span><select value={tipoPago} onChange={e => setTipoPago(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option>Deuda</option><option>Suscripción</option></select></label>
          {errMsg && <div style={{ fontSize: 12, color: C.neg }}>{errMsg}</div>}
          {status === 'ok' && <div style={{ fontSize: 12, color: C.pos }}>Creado correctamente.</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={FORM_CANCEL_BUTTON_STYLE}>Cancelar</button>
            <button type="submit" disabled={status === 'loading'} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: C.neg, color: '#fff', cursor: status === 'loading' ? 'wait' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700 }}>{status === 'loading' ? 'Creando...' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
