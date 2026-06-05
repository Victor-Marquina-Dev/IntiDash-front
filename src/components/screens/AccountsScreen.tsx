'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { ModalShell } from '@/components/ui';
import type { CuentaBancariaRow } from '@/shared/types/finance.types';

const BANK_META: Record<string, { color: string; bg: string }> = {
  interbank:  { color: '#fff', bg: '#006341' },
  bcp:        { color: '#fff', bg: '#003DA5' },
  bbva:       { color: '#fff', bg: '#004481' },
  scotiabank: { color: '#fff', bg: '#d42b1b' },
  yape:       { color: '#fff', bg: '#7b2d8b' },
  plin:       { color: '#fff', bg: '#00b4d8' },
  falabella:  { color: '#fff', bg: '#009640' },
};

function getBankMeta(banco: string) {
  const b = (banco ?? '').toLowerCase();
  for (const [key, meta] of Object.entries(BANK_META)) {
    if (b.includes(key)) return meta;
  }
  return { color: '#fff', bg: '#8FA88F' };
}

function fmt(v: number) {
  return 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2 });
}

// ── Modal ver/editar cuenta ───────────────────────────────────────────────
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

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${C.border}`, background: '#fafafa',
    fontFamily: 'var(--font-ui)', fontSize: 13, color: C.text,
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.textMute,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5,
    fontFamily: 'var(--font-ui)', display: 'block',
  };

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
    { key: 'balance',        label: 'Balance',         type: 'number' },
    { key: 'credito',        label: 'Límite de crédito', type: 'number' },
    { key: 'balanceInicial', label: 'Balance inicial',  type: 'number' },
  ];

  const isEditing = canWrite && editing;

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>
        {/* Header con color del banco */}
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
          {/* Tabs Ver / Editar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: '4px', background: 'rgba(17,24,39,0.05)', borderRadius: 10, width: 'fit-content' }}>
            {[
              { id: false, label: 'Ver datos' },
              ...(canWrite ? [{ id: true, label: 'Editar' }] : []),
            ].map(t => (
              <button key={String(t.id)} onClick={() => setEditing(t.id)} style={{
                padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: isEditing === t.id ? '#fff' : 'transparent',
                color: isEditing === t.id ? C.text : C.textMute,
                fontSize: 12, fontWeight: isEditing === t.id ? 600 : 500,
                boxShadow: isEditing === t.id ? '0 1px 4px rgba(17,24,39,0.10)' : 'none',
                transition: 'all 0.15s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {!isEditing ? (
            // ── Modo ver ──
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
          ) : (
            // ── Modo editar ──
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                {fields.map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inp}
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

// ── Tarjeta de cuenta estilo card bancaria ────────────────────────────────
function AccountCard({ cuenta, onOpenModal }: Readonly<{ cuenta: CuentaBancariaRow; onOpenModal: () => void }>) {
  const [hovered, setHovered] = React.useState(false);
  const meta    = getBankMeta(cuenta.banco ?? '');
  const saldo   = cuenta.balance ?? cuenta.balanceInicial ?? 0;
  const credito = cuenta.credito ?? 0;
  const isCredito = (cuenta.tipo ?? '').toLowerCase().includes('crédito') || (cuenta.tipo ?? '').toLowerCase().includes('credito');
  const util    = isCredito && credito > 0 ? Math.min(100, Math.round((saldo / credito) * 100)) : 0;

  const initial = (cuenta.banco ?? cuenta.nombre ?? '?')[0].toUpperCase();

  return (
    <div
      onClick={onOpenModal}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        background: '#fff',
        border: `1px solid ${hovered ? 'rgba(17,24,39,0.16)' : 'rgba(17,24,39,0.08)'}`,
        boxShadow: hovered ? '0 12px 32px rgba(17,24,39,.10)' : '0 1px 3px rgba(17,24,39,.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform .25s, box-shadow .25s, border-color .25s',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      {/* Banda superior con color del banco */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${meta.bg}, ${meta.bg}CC)` }} />

      <div style={{ padding: '12px 14px 14px' }}>

        {/* Header: badge + nombre + tipo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: meta.bg, color: meta.color,
            display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 900,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cuenta.nombre || '—'}
            </div>
            <div style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>
              {cuenta.banco || '—'}
            </div>
          </div>
          {cuenta.tipo && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 12,
              background: isCredito ? `${C.neg}12` : `${C.pos}12`,
              color: isCredito ? C.neg : C.pos,
              border: `1px solid ${isCredito ? `${C.neg}25` : `${C.pos}25`}`,
              whiteSpace: 'nowrap', flexShrink: 0,
              textTransform: 'uppercase', letterSpacing: 0.4,
            }}>
              {cuenta.tipo}
            </span>
          )}
        </div>

        {/* Balance principal */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>
            {isCredito ? 'Saldo utilizado' : 'Balance disponible'}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800, letterSpacing: -0.6,
            color: isCredito ? C.neg : C.text,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {isCredito ? '−' : ''}{fmt(Math.abs(saldo))}
          </div>
        </div>

        {/* Barra de utilización (solo crédito) */}
        {isCredito && credito > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.textMute }}>Lím. {fmt(credito)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: util > 80 ? C.neg : C.textDim }}>{util}% usado</span>
            </div>
            <div style={{ height: 3, background: 'rgba(17,24,39,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${util}%`, background: util > 80 ? C.neg : util > 50 ? C.goal : C.pos, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}

        {/* Footer: moneda + estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, borderTop: `1px solid rgba(17,24,39,0.07)` }}>
          {cuenta.moneda && (
            <span style={{ fontSize: 10, fontWeight: 600, color: C.textDim, background: 'rgba(17,24,39,0.06)', padding: '1px 6px', borderRadius: 5 }}>
              {cuenta.moneda}
            </span>
          )}
          {cuenta.estado && (
            <span style={{ fontSize: 10, color: C.textMute }}>{cuenta.estado}</span>
          )}
          <div style={{ flex: 1 }} />
          {cuenta.balanceInicial != null && (
            <span style={{ fontSize: 10, color: C.textMute, fontVariantNumeric: 'tabular-nums' }}>
              Inicial: {fmt(cuenta.balanceInicial)}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────
interface AccountsScreenProps { accent: string; canWrite?: boolean }

type TabId = 'todas' | 'corriente' | 'ahorro' | 'credito';

export function AccountsScreen({ accent: _accent, canWrite = true }: AccountsScreenProps) {
  const [cuentas,    setCuentas]    = React.useState<CuentaBancariaRow[]>([]);
  const [loading,    setLoading]    = React.useState(true);
  const [tab, setTab]               = React.useState<TabId>('todas');
  const [selectedCuenta, setSelectedCuenta] = React.useState<CuentaBancariaRow | null>(null);

  React.useEffect(() => {
    let active = true;

    notionPaymentsService.getCuentasBancarias()
      .then(data => {
        if (!active) return;
        setCuentas(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalSaldo = cuentas.reduce((s, r) => s + Math.abs(r.balance ?? r.balanceInicial ?? 0), 0);

  const corriente = cuentas.filter(c => !(c.tipo ?? '').toLowerCase().includes('crédito') && !(c.tipo ?? '').toLowerCase().includes('credito') && !(c.tipo ?? '').toLowerCase().includes('ahorro'));
  const ahorro    = cuentas.filter(c => (c.tipo ?? '').toLowerCase().includes('ahorro'));
  const credito   = cuentas.filter(c => (c.tipo ?? '').toLowerCase().includes('crédito') || (c.tipo ?? '').toLowerCase().includes('credito'));

  const TABS: { id: TabId; label: string; items: CuentaBancariaRow[] }[] = [
    { id: 'todas',     label: 'Todas',     items: cuentas   },
    { id: 'corriente', label: 'Corriente', items: corriente },
    { id: 'ahorro',    label: 'Ahorro',    items: ahorro    },
    { id: 'credito',   label: 'Crédito',   items: credito   },
  ];
  const visible = TABS.find(t => t.id === tab)?.items ?? cuentas;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header con stats y sync ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '24px 28px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flex: 1 }}>
          {[
            { label: 'Saldo total',     value: fmt(totalSaldo),       color: C.text },
            { label: 'Cuentas activas', value: `${cuentas.length}`,    color: C.text },
            { label: 'Créditos',        value: `${credito.length}`,    color: C.text },
          ].map(m => (
            <div key={m.label} style={{
              padding: '14px 18px', borderRadius: 14,
              background: '#fff', border: `1px solid rgba(17,24,39,0.08)`,
              boxShadow: '0 1px 3px rgba(17,24,39,.04)',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skeleton ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ borderRadius: 20, background: '#fff', border: '1px solid rgba(17,24,39,0.08)', overflow: 'hidden' }}>
              <div style={{ height: 6, background: 'rgba(17,24,39,0.08)' }} />
              <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="fz-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="fz-skeleton" style={{ height: 14, width: '70%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="fz-skeleton" style={{ height: 11, width: '50%', borderRadius: 6 }} />
                  </div>
                </div>
                <div className="fz-skeleton" style={{ height: 28, width: '60%', borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      {!loading && cuentas.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '5px 6px', borderRadius: 28, background: 'rgba(17,24,39,0.05)', border: '1px solid rgba(17,24,39,0.08)', alignSelf: 'flex-start', marginLeft: 28 }}>
          {TABS.filter(t => t.id === 'todas' || t.items.length > 0).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '7px 16px', borderRadius: 22, border: 'none', cursor: 'pointer',
                background: active ? C.primary : 'transparent',
                color: active ? '#fff' : C.textDim,
                fontSize: 13, fontWeight: active ? 650 : 500,
                fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 0.16s, color 0.16s',
              }}>
                {t.label}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                  background: active ? 'rgba(255,255,255,0.20)' : 'rgba(17,24,39,0.08)',
                  color: active ? '#fff' : C.textMute,
                }}>
                  {t.items.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Grid de tarjetas ── */}
      {!loading && cuentas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMute, fontSize: 14 }}>
          Sin cuentas. Presiona <strong>Sincronizar</strong> para cargar desde Notion.
        </div>
      )}

      {!loading && cuentas.length > 0 && (
        <div key={tab} className="fz-tab-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, padding: '0 28px 24px' }}>
          {visible.map(c => <AccountCard key={c.id} cuenta={c} onOpenModal={() => setSelectedCuenta(c)} />)}
        </div>
      )}

      {selectedCuenta && (
        <AccountModal
          cuenta={selectedCuenta}
          onClose={() => setSelectedCuenta(null)}
          canWrite={canWrite}
          onSave={(updated) => {
            setCuentas(prev => prev.map(cuenta => cuenta.id === updated.id ? updated : cuenta));
            setSelectedCuenta(updated);
          }}
        />
      )}

    </div>
  );
}
