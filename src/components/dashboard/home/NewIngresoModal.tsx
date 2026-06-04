'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Icon } from '@/components/icons';
import { useCreateIngreso } from '@/shared/hooks/use-create-ingreso';
import { useCreateOptions } from '@/shared/hooks/use-create-options';

export function NewIngresoModal({ onClose, onSuccess }: Readonly<{ onClose: () => void; onSuccess: () => void }>) {
  const opts = useCreateOptions();
  const { status, errorMessage, createIngreso } = useCreateIngreso();
  const [nombre, setNombre]       = React.useState('');
  const [ingreso, setIngreso]     = React.useState('');
  const [categoria, setCategoria] = React.useState('');
  const [cuenta, setCuenta]       = React.useState('');
  const [fecha, setFecha]         = React.useState(() => new Date().toISOString().split('T')[0]);
  const [errMsg, setErrMsg]       = React.useState('');

  React.useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrMsg('El nombre es requerido.'); return; }
    setErrMsg('');
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

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,24,18,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ background: '#fafbf8', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: 480, fontFamily: 'var(--font-ui), system-ui, sans-serif' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${C.pos}18`, color: C.pos, display: 'grid', placeItems: 'center' }}><Icon.arrowUp size={17} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>Nuevo Ingreso</div>
            <div style={{ fontSize: 11.5, color: C.textMute, marginTop: 1 }}>Se guardará directamente en Notion</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar nuevo ingreso" style={{ width: 32, height: 32, borderRadius: 7, background: C.border, border: 'none', cursor: 'pointer', color: C.textDim, display: 'grid', placeItems: 'center', fontSize: 18, fontFamily: 'system-ui', fontWeight: 300 }}>x</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Nombre', required: true, node: <input required placeholder="Descripción del ingreso" value={nombre} onChange={e => setNombre(e.target.value)} style={inp} /> },
            { label: 'Ingreso (S/)', node: <input type="number" step="0.01" min="0" placeholder="0.00" value={ingreso} onChange={e => setIngreso(e.target.value)} style={inp} /> },
            { label: 'Categoría', node: <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">- Sin categoría -</option>{opts.categoriasIngreso.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Cuenta bancaria', node: <select value={cuenta} onChange={e => setCuenta(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">- Sin cuenta -</option>{opts.cuentasBancarias.map(c => <option key={c} value={c}>{c}</option>)}</select> },
            { label: 'Fecha', node: <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} /> },
          ] as { label: string; required?: boolean; node: React.ReactNode }[]).map(({ label, node, required }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, display: 'block', marginBottom: 5 }}>
                {label}{required && <span style={{ color: C.neg, marginLeft: 2 }}>*</span>}
              </label>
              {node}
            </div>
          ))}
          {(errMsg || errorMessage) && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)', fontSize: 12, color: '#c83c3c' }}>{errMsg || errorMessage}</div>}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" disabled={status === 'loading' || status === 'ok'} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: status === 'loading' || status === 'ok' ? 'default' : 'pointer', background: status === 'ok' ? C.pos : C.olive, color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.15s' }}>
              {status === 'loading' ? 'Guardando...' : status === 'ok' ? '✓ Guardado' : 'Guardar en Notion'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', cursor: 'pointer', color: C.textDim, fontFamily: 'var(--font-ui)', fontSize: 13 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New Gasto Modal ───────────────────────────────────────────────────────
