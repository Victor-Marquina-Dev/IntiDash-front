'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { Button, ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';

export function NewPrestamoModal({ onClose, onSuccess }: Readonly<{ onClose: () => void; onSuccess: () => void }>) {
  const [nombre, setNombre]             = React.useState('');
  const [montoPrestamo, setMonto]       = React.useState('');
  const [cuentaBancaria, setCuenta]     = React.useState('');
  const [fecha, setFecha]               = React.useState('');
  const [cuentas, setCuentas]           = React.useState<string[]>([]);
  const [saving, setSaving]             = React.useState(false);
  const [error, setError]               = React.useState('');

  React.useEffect(() => {
    notionPaymentsService.getOptions()
      .then((d: { cuentasBancarias?: string[] }) => { if (d.cuentasBancarias) setCuentas(d.cuentasBancarias); })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSave() {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true); setError('');
    try {
      await notionPaymentsService.createPrestamo({ nombre: nombre.trim(), montoPrestamo: montoPrestamo ? Number(montoPrestamo) : undefined, cuentaBancaria: cuentaBancaria || undefined, fecha: fecha || undefined });
      dispatchDataSynced(); onSuccess();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error al guardar.'); setSaving(false); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' };

  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width: '100%', maxWidth: 440, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Nuevo préstamo</div>
          <button onClick={onClose} aria-label="Cerrar nuevo prestamo" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Nombre *</div>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Préstamo hermana" style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Monto prestado</div>
            <input type="number" value={montoPrestamo} onChange={e => setMonto(e.target.value)} placeholder="0.00" style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Cuenta bancaria</div>
            {cuentas.length > 0 ? (
              <select value={cuentaBancaria} onChange={e => setCuenta(e.target.value)} style={{ ...inp }}>
                <option value="">— Sin cuenta —</option>
                {cuentas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={cuentaBancaria} onChange={e => setCuenta(e.target.value)} placeholder="Nombre de cuenta" style={inp} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMute, marginBottom: 5, fontWeight: 600 }}>Fecha</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
          </div>
          {error && <div style={{ fontSize: 12, color: C.neg, padding: '6px 10px', background: `${C.neg}10`, borderRadius: 7 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button ghost onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button primary onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Crear préstamo'}</Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Debts card ───────────────────────────────────────────────────────────
