'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { FORM_CANCEL_BUTTON_STYLE, FORM_INPUT_STYLE, FORM_LABEL_STYLE, FORM_SUBMIT_BUTTON_STYLE, ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';

export function NewSuscripcionModal({ onClose, onSuccess }: Readonly<{ onClose: () => void; onSuccess: () => void }>) {
  const [nombre, setNombre]       = React.useState('');
  const [cantidad, setCantidad]   = React.useState('');
  const [fechaInicio, setFechaInicio] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [ciclo, setCiclo]         = React.useState('Mensual');
  const [status, setStatus]       = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg]       = React.useState('');

  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      await notionPaymentsService.createDeudaSuscripcion({ nombre: nombre.trim(), cantidad: cantidad ? parseFloat(cantidad) : undefined, fechaInicio: fechaInicio || undefined, ciclo, tipoPago: 'Suscripción' });
      setStatus('ok'); dispatchDataSynced(); onSuccess(); setTimeout(onClose, 900);
    } catch (err: unknown) { setStatus('error'); setErrMsg((err instanceof Error ? err.message : null) ?? 'Error'); }
  }

  return (
    <ModalShell onClose={onClose}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 460, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.neg}18`, color: C.neg, display: 'grid', placeItems: 'center', fontSize: 18 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nueva Suscripción</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>Se guardará directamente en Notion</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar nueva suscripcion" style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>x</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Ej. Netflix, Spotify..." value={nombre} onChange={e => setNombre(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Cantidad (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={cantidad} onChange={e => setCantidad(e.target.value)} style={FORM_INPUT_STYLE} /> },
            { label: 'Ciclo', node: <select value={ciclo} onChange={e => setCiclo(e.target.value)} style={{ ...FORM_INPUT_STYLE, cursor: 'pointer' }}><option>Mensual</option><option>Anual</option><option>Un pago</option></select> },
            { label: 'Fecha Inicio', node: <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={FORM_INPUT_STYLE} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={FORM_LABEL_STYLE}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {errMsg && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={status === 'loading' || status === 'ok'} style={{ ...FORM_SUBMIT_BUTTON_STYLE, cursor: status === 'loading' || status === 'ok' ? 'default' : 'pointer', background: status === 'ok' ? C.pos : C.olive, opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? 'Guardando...' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion'}
            </button>
            <button type="button" onClick={onClose} style={FORM_CANCEL_BUTTON_STYLE}>Cancelar</button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

// ── KPI rail ─────────────────────────────────────────────────────────────
