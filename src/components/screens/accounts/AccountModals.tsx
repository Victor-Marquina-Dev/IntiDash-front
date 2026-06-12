'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { ModalShell } from '@/components/ui';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';
import { ACCOUNT_INPUT_STYLE, ACCOUNT_LABEL_STYLE } from './constants';
import { fmt, getBankMeta } from './utils';

function AccountModal({ cuenta, onClose, onSave, canWrite = true }: Readonly<{
  cuenta: CuentaBancariaRow;
  onClose: () => void;
  onSave: (updated: CuentaBancariaRow) => void;
  canWrite?: boolean;
}>) {
  const meta = getBankMeta(cuenta.banco ?? '');
  const [editing, setEditing]   = React.useState(false);
  const [saving,  setSaving]    = React.useState(false);
  const [error,   setError]     = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    nombre:         cuenta.nombre         ?? '',
    banco:          cuenta.banco          ?? '',
    tipo:           cuenta.tipo           ?? '',
    moneda:         cuenta.moneda         ?? 'PEN',
    estado:         cuenta.estado         ?? '',
    balance:        String(cuenta.balance         ?? ''),
    credito:        String(cuenta.credito         ?? ''),
    balanceInicial: String(cuenta.balanceInicial  ?? ''),
  });

  async function handleSave() {
    if (!canWrite) return;
    setSaving(true); setError(null);
    try {
      await notionPaymentsService.updateCuenta(cuenta.id, {
        nombre:          form.nombre         || undefined,
        banco:           form.banco          || undefined,
        tipo:            form.tipo           || undefined,
        moneda:          form.moneda         || undefined,
        estado:          form.estado         || undefined,
        balance:         form.balance        !== '' ? parseFloat(form.balance)        : undefined,
        credito:         form.credito        !== '' ? parseFloat(form.credito)        : undefined,
        balanceInicial:  form.balanceInicial !== '' ? parseFloat(form.balanceInicial) : undefined,
      });
      dispatchDataSynced();
      onSave({ ...cuenta, ...form, balance: form.balance !== '' ? parseFloat(form.balance) : cuenta.balance, credito: form.credito !== '' ? parseFloat(form.credito) : cuenta.credito, balanceInicial: form.balanceInicial !== '' ? parseFloat(form.balanceInicial) : cuenta.balanceInicial });
      setEditing(false);
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally { setSaving(false); }
  }

  const fields: { key: keyof typeof form; label: string; type?: string }[] = [
    { key: 'nombre',         label: 'Nombre' },
    { key: 'banco',          label: 'Banco' },
    { key: 'tipo',           label: 'Tipo' },
    { key: 'moneda',         label: 'Moneda' },
    { key: 'estado',         label: 'Estado' },
    { key: 'balance',        label: 'Balance',           type: 'number' },
    { key: 'credito',        label: 'Límite de crédito', type: 'number' },
    { key: 'balanceInicial', label: 'Balance inicial',   type: 'number' },
  ];

  const isEditing = canWrite && editing;

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>
        <div style={{ background: meta.bg, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.20)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 900, color: '#fff' }}>
            {(cuenta.banco ?? '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cuenta.nombre || '—'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>{cuenta.banco} · {cuenta.tipo}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'grid', placeItems: 'center' }}>×</button>
        </div>

        <div style={{ padding: '22px 24px 24px' }}>
          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                {[
                  { label: 'Nombre',           value: cuenta.nombre          || '—' },
                  { label: 'Banco',            value: cuenta.banco           || '—' },
                  { label: 'Tipo',             value: cuenta.tipo            || '—' },
                  { label: 'Moneda',           value: cuenta.moneda          || '—' },
                  { label: 'Balance',          value: cuenta.balance         != null ? fmt(cuenta.balance)         : '—' },
                  { label: 'Límite crédito',   value: cuenta.credito         != null ? fmt(cuenta.credito)         : '—' },
                  { label: 'Balance inicial',  value: cuenta.balanceInicial  != null ? fmt(cuenta.balanceInicial)  : '—' },
                  { label: 'Estado',           value: cuenta.estado          || '—' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {canWrite && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(17,24,39,0.07)' }}>
                  <button onClick={() => setEditing(true)} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                    Editar cuenta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                {fields.map(f => (
                  <div key={f.key}>
                    <label style={ACCOUNT_LABEL_STYLE}>{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={ACCOUNT_INPUT_STYLE}
                      step={f.type === 'number' ? '0.01' : undefined}
                    />
                  </div>
                ))}
              </div>
              {error && <div style={{ fontSize: 12, color: C.neg }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => { setEditing(false); setError(null); }} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', color: C.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: saving ? C.border : C.primary, color: saving ? C.textMute : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'var(--font-ui)', transition: 'background 0.15s' }}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ── Modal crear cuenta ─────────────────────────────────────────────────────


function CreateAccountModal({ onClose, onCreated }: Readonly<{
  onClose: () => void;
  onCreated: (nueva: CuentaBancariaRow) => void;
}>) {
  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    nombre: '', banco: '', tipo: 'Corriente', moneda: 'PEN',
    estado: 'Activo', balance: '', credito: '', balanceInicial: '',
  });

  const fields: { key: keyof typeof form; label: string; type?: string }[] = [
    { key: 'nombre',         label: 'Nombre' },
    { key: 'banco',          label: 'Banco' },
    { key: 'tipo',           label: 'Tipo' },
    { key: 'moneda',         label: 'Moneda' },
    { key: 'estado',         label: 'Estado' },
    { key: 'balance',        label: 'Balance',           type: 'number' },
    { key: 'credito',        label: 'Límite de crédito', type: 'number' },
    { key: 'balanceInicial', label: 'Balance inicial',   type: 'number' },
  ];

  async function handleCreate() {
    if (!form.nombre.trim() || !form.banco.trim()) {
      setError('Nombre y banco son obligatorios.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const nueva = await notionPaymentsService.createCuenta({
        nombre:         form.nombre,
        banco:          form.banco,
        tipo:           form.tipo,
        moneda:         form.moneda,
        estado:         form.estado,
        balance:        form.balance        !== '' ? parseFloat(form.balance)        : undefined,
        credito:        form.credito        !== '' ? parseFloat(form.credito)        : undefined,
        balanceInicial: form.balanceInicial !== '' ? parseFloat(form.balanceInicial) : undefined,
      });
      dispatchDataSynced();
      onCreated(nueva);
    } catch {
      setError('No se pudo crear la cuenta. Intenta de nuevo.');
    } finally { setSaving(false); }
  }

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>
        <div style={{ background: C.primary, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.20)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#fff' }}>
            +
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Nueva cuenta</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>Completa los datos de la cuenta</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'grid', placeItems: 'center' }}>×</button>
        </div>

        <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={ACCOUNT_LABEL_STYLE}>{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={ACCOUNT_INPUT_STYLE}
                  step={f.type === 'number' ? '0.01' : undefined}
                  placeholder={f.type === 'number' ? '0.00' : undefined}
                />
              </div>
            ))}
          </div>
          {error && <div style={{ fontSize: 12, color: C.neg }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', color: C.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: saving ? C.border : C.primary, color: saving ? C.textMute : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'var(--font-ui)', transition: 'background 0.15s' }}>
              {saving ? 'Creando...' : 'Crear cuenta'}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Item compacto de cuenta (panel izquierdo) ──────────────────────────────


export { AccountModal, CreateAccountModal };
