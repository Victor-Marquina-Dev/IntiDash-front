'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

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
      setStatus('ok'); onSuccess(); setTimeout(onClose, 900);
    } catch (err: unknown) { setStatus('error'); setErrMsg((err instanceof Error ? err.message : null) ?? 'Error'); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

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
            { label: 'Nombre', required: true, node: <input required placeholder="Ej. Netflix, Spotify..." value={nombre} onChange={e => setNombre(e.target.value)} style={inp} /> },
            { label: 'Cantidad (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={cantidad} onChange={e => setCantidad(e.target.value)} style={inp} /> },
            { label: 'Ciclo', node: <select value={ciclo} onChange={e => setCiclo(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option>Mensual</option><option>Anual</option><option>Un pago</option></select> },
            { label: 'Fecha Inicio', node: <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={inp} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {errMsg && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={status === 'loading' || status === 'ok'} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: status === 'loading' || status === 'ok' ? 'default' : 'pointer', background: status === 'ok' ? C.pos : C.olive, color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.15s' }}>
              {status === 'loading' ? 'Guardando...' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.textDim, fontFamily: 'var(--font-ui)', fontSize: 13 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

// ── KPI rail ─────────────────────────────────────────────────────────────
