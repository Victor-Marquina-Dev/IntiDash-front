'use client';

import React from 'react';
import { IntiDashWordmark } from '@/components/brand/IntiDashLogo';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';

const SAGE = '#3C7828';
const SAGE_DEEP = '#6B8C6B';
const INK = '#171C1A';
const SUB = '#5A6661';
const MUTE = '#9AA5A0';
const PAPER = '#FAF8F4';
const FONT = 'var(--font-ui), system-ui, sans-serif';

type Step = 'choose' | 'notion' | 'manual' | 'done';

const NOTION_TABLES: { name: string; desc: string }[] = [
  { name: 'Ingresos',           desc: 'Tus entradas de dinero' },
  { name: 'Gastos Únicos',      desc: 'Compras y pagos puntuales' },
  { name: 'Gastos Deudas',      desc: 'Pagos hechos a tus deudas' },
  { name: 'Deudas',             desc: 'Lo que debes y a quién' },
  { name: 'Préstamos',          desc: 'Dinero que prestaste' },
  { name: 'Cuentas Bancarias',  desc: 'Bancos, billeteras y tarjetas' },
  { name: 'Transferencias',     desc: 'Movimientos entre cuentas' },
  { name: 'Categorías Gastos',  desc: 'Cómo clasificas tus gastos' },
  { name: 'Categorías Ingreso', desc: 'Cómo clasificas tus ingresos' },
];

interface AccountDraft {
  nombre: string;
  banco: string;
  tipo: string;
  balance: string;
  credito: string;
}

const emptyAccount = (): AccountDraft => ({ nombre: '', banco: '', tipo: 'Corriente', balance: '', credito: '' });

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, padding: '0 12px', borderRadius: 10,
  border: '1px solid rgba(10,46,34,0.15)', background: '#fff',
  fontSize: 13.5, color: INK, fontFamily: FONT, outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: SUB,
  marginBottom: 5, letterSpacing: 0.2,
};

function StepBadge({ n, label, active, done }: Readonly<{ n: number; label: string; active: boolean; done: boolean }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        fontSize: 11, fontWeight: 700, fontFamily: FONT,
        background: done ? SAGE : active ? INK : 'rgba(10,46,34,0.08)',
        color: done || active ? '#fff' : MUTE,
        flexShrink: 0,
      }}>
        {done ? '✓' : n}
      </span>
      <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? INK : MUTE, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

function ChoiceCard({ title, subtitle, bullets, ctaLabel, onSelect, icon }: Readonly<{
  title: string;
  subtitle: string;
  bullets: string[];
  ctaLabel: string;
  onSelect: () => void;
  icon: React.ReactNode;
}>) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 0', minWidth: 260, textAlign: 'left', cursor: 'pointer',
        background: '#fff', borderRadius: 18,
        border: `1.5px solid ${hover ? SAGE : 'rgba(10,46,34,0.10)'}`,
        boxShadow: hover ? `0 12px 32px rgba(107,140,107,0.18)` : '0 2px 8px rgba(10,46,34,0.04)',
        padding: '24px 24px 22px', fontFamily: FONT,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 14,
        background: 'rgba(143,168,143,0.14)', border: '1px solid rgba(143,168,143,0.25)',
        display: 'grid', placeItems: 'center',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: SUB, lineHeight: 1.5, marginBottom: 14 }}>{subtitle}</div>
      <ul style={{ listStyle: 'none', margin: '0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {bullets.map(b => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: SUB }}>
            <span style={{ color: SAGE_DEEP, fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
            <span style={{ lineHeight: 1.4 }}>{b}</span>
          </li>
        ))}
      </ul>
      <span style={{
        marginTop: 'auto', alignSelf: 'flex-start',
        fontSize: 13, fontWeight: 700,
        color: hover ? '#fff' : SAGE_DEEP,
        background: hover ? SAGE_DEEP : 'rgba(143,168,143,0.14)',
        borderRadius: 10, padding: '9px 16px',
        transition: 'all 0.18s ease',
      }}>
        {ctaLabel} →
      </span>
    </button>
  );
}

export function OnboardingFlow({ userName, onFinish, onGoToNotion }: Readonly<{
  userName?: string | null;
  onFinish: () => void;
  onGoToNotion: () => void;
}>) {
  const [step, setStep] = React.useState<Step>('choose');
  const [accounts, setAccounts] = React.useState<AccountDraft[]>([emptyAccount()]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdCount, setCreatedCount] = React.useState(0);

  const firstName = (userName ?? '').split(/\s+/)[0] || '';

  function setAccount(i: number, patch: Partial<AccountDraft>) {
    setAccounts(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));
  }

  async function handleCreateAccounts() {
    const valid = accounts.filter(a => a.nombre.trim());
    if (valid.length === 0) {
      setError('Ponle nombre al menos a una cuenta para continuar.');
      return;
    }
    setSaving(true); setError(null);
    try {
      for (const a of valid) {
        await notionPaymentsService.createCuenta({
          nombre:  a.nombre.trim(),
          banco:   a.banco.trim() || a.nombre.trim(),
          tipo:    a.tipo,
          moneda:  'PEN',
          estado:  'Activo',
          balance: a.balance !== '' ? parseFloat(a.balance) : undefined,
          credito: a.tipo === 'Crédito' && a.credito !== '' ? parseFloat(a.credito) : undefined,
        });
      }
      dispatchDataSynced();
      setCreatedCount(valid.length);
      setStep('done');
    } catch {
      setError('No se pudieron crear las cuentas. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const stepNum = step === 'choose' ? 1 : step === 'done' ? 3 : 2;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: PAPER, overflowY: 'auto',
      fontFamily: FONT,
    }}>
      {/* Glow superior */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 900px 480px at 50% 0%, rgba(143,168,143,0.22), transparent 70%)',
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', maxWidth: 980, margin: '0 auto',
        padding: '22px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <IntiDashWordmark size={26} />
        <button
          onClick={onFinish}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: MUTE, fontFamily: FONT,
            padding: '8px 10px',
          }}
        >
          Saltar por ahora →
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 980, margin: '0 auto', padding: '36px 28px 64px' }}>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginBottom: 36 }}>
          <StepBadge n={1} label="Elige cómo empezar" active={stepNum === 1} done={stepNum > 1} />
          <span style={{ width: 36, height: 1.5, background: stepNum > 1 ? SAGE : 'rgba(10,46,34,0.12)' }} />
          <StepBadge n={2} label="Configura" active={stepNum === 2} done={stepNum > 2} />
          <span style={{ width: 36, height: 1.5, background: stepNum > 2 ? SAGE : 'rgba(10,46,34,0.12)' }} />
          <StepBadge n={3} label="Listo" active={stepNum === 3} done={false} />
        </div>

        {/* ── Paso 1: elegir ruta ── */}
        {step === 'choose' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: INK, letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.15 }}>
                {firstName ? `¡Hola, ${firstName}! ` : '¡Hola! '}¿Cómo quieres comenzar con IntiDash?
              </h1>
              <p style={{ fontSize: 15, color: SUB, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
                Para empezar a controlar tus gastos, ahorros y deudas necesitamos tus datos.
                Elige el camino que prefieras — puedes cambiar de opinión cuando quieras.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
              <ChoiceCard
                title="Importar desde Notion"
                subtitle="¿Ya llevas tus finanzas en Notion? Conecta tu workspace y trae todo automáticamente."
                bullets={[
                  'Sincroniza ingresos, gastos, deudas y cuentas',
                  'Tus datos siguen viviendo en Notion',
                  'Actualiza con un clic cuando quieras',
                ]}
                ctaLabel="Conectar Notion"
                onSelect={() => setStep('notion')}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SAGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                }
              />
              <ChoiceCard
                title="Empezar desde cero"
                subtitle="Registra tus cuentas y tarjetas a mano. Toma menos de 2 minutos."
                bullets={[
                  'Dinos cuántas cuentas y tarjetas tienes',
                  'Ingresa el saldo actual de cada una',
                  'Empieza a registrar movimientos al instante',
                ]}
                ctaLabel="Crear mis cuentas"
                onSelect={() => setStep('manual')}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SAGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                }
              />
            </div>
          </>
        )}

        {/* ── Paso 2A: Notion ── */}
        {step === 'notion' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: INK, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Conecta tu Notion
              </h2>
              <p style={{ fontSize: 14.5, color: SUB, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
                IntiDash lee estas <strong>9 tablas</strong> de tu workspace de Notion.
                No te preocupes si no las tienes todas: sincroniza solo las que existan.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 10, marginBottom: 26,
            }}>
              {NOTION_TABLES.map(t => (
                <div key={t.name} style={{
                  background: '#fff', borderRadius: 12, padding: '12px 14px',
                  border: '1px solid rgba(10,46,34,0.08)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SAGE, flexShrink: 0 }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: INK }}>{t.name}</span>
                    <span style={{ display: 'block', fontSize: 11, color: MUTE, marginTop: 1 }}>{t.desc}</span>
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(143,168,143,0.10)', border: '1px solid rgba(143,168,143,0.30)',
              borderRadius: 14, padding: '16px 18px', marginBottom: 28,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: SAGE_DEEP, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
                Cómo funciona
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>Crea una integración en <strong>notion.so/my-integrations</strong> y copia el token.</li>
                <li style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>Comparte tus tablas con esa integración desde Notion.</li>
                <li style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>Pega el token en los ajustes de IntiDash y sincroniza.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStep('choose')}
                style={{
                  padding: '11px 20px', borderRadius: 12, cursor: 'pointer',
                  background: '#fff', border: '1px solid rgba(10,46,34,0.15)',
                  fontSize: 14, fontWeight: 600, color: SUB, fontFamily: FONT,
                }}
              >
                ← Volver
              </button>
              <button
                onClick={onGoToNotion}
                style={{
                  padding: '11px 24px', borderRadius: 12, cursor: 'pointer',
                  background: INK, border: 'none',
                  fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: FONT,
                  boxShadow: '0 8px 24px rgba(23,28,26,0.25)',
                }}
              >
                Ir a conectar Notion →
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 2B: manual ── */}
        {step === 'manual' && (
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: INK, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Cuéntanos de tus cuentas y tarjetas
              </h2>
              <p style={{ fontSize: 14.5, color: SUB, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
                Agrega tus cuentas bancarias, billeteras y tarjetas con su saldo actual.
                Con esto IntiDash calcula tu balance total desde el día uno.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              {accounts.map((a, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 16, padding: '18px 20px',
                  border: '1px solid rgba(10,46,34,0.10)',
                  boxShadow: '0 2px 8px rgba(10,46,34,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SAGE_DEEP, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Cuenta {i + 1}
                    </span>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => setAccounts(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#B43232', fontWeight: 600, fontFamily: FONT }}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px 14px' }}>
                    <div>
                      <label style={labelStyle}>Nombre *</label>
                      <input
                        style={inputStyle}
                        placeholder="Ej. Ahorro Soles"
                        value={a.nombre}
                        onChange={e => setAccount(i, { nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Banco / billetera</label>
                      <input
                        style={inputStyle}
                        placeholder="Ej. Interbank, Yape"
                        value={a.banco}
                        onChange={e => setAccount(i, { banco: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo</label>
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={a.tipo}
                        onChange={e => setAccount(i, { tipo: e.target.value })}
                      >
                        <option value="Corriente">Corriente</option>
                        <option value="Ahorro">Ahorro</option>
                        <option value="Crédito">Tarjeta de crédito</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Saldo actual (S/)</label>
                      <input
                        style={inputStyle}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={a.balance}
                        onChange={e => setAccount(i, { balance: e.target.value })}
                      />
                    </div>
                    {a.tipo === 'Crédito' && (
                      <div>
                        <label style={labelStyle}>Línea de crédito (S/)</label>
                        <input
                          style={inputStyle}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={a.credito}
                          onChange={e => setAccount(i, { credito: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAccounts(prev => [...prev, emptyAccount()])}
              style={{
                width: '100%', padding: '12px', borderRadius: 14, cursor: 'pointer',
                background: 'transparent', border: '1.5px dashed rgba(107,140,107,0.45)',
                fontSize: 13.5, fontWeight: 600, color: SAGE_DEEP, fontFamily: FONT,
                marginBottom: 22,
              }}
            >
              + Agregar otra cuenta o tarjeta
            </button>

            {error && (
              <div style={{
                background: 'rgba(207,156,156,0.10)', border: '1px solid rgba(207,156,156,0.35)',
                borderRadius: 12, padding: '11px 14px', marginBottom: 18,
                fontSize: 13, color: '#B07070', textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setError(null); setStep('choose'); }}
                style={{
                  padding: '11px 20px', borderRadius: 12, cursor: 'pointer',
                  background: '#fff', border: '1px solid rgba(10,46,34,0.15)',
                  fontSize: 14, fontWeight: 600, color: SUB, fontFamily: FONT,
                }}
              >
                ← Volver
              </button>
              <button
                onClick={handleCreateAccounts}
                disabled={saving}
                style={{
                  padding: '11px 24px', borderRadius: 12,
                  cursor: saving ? 'default' : 'pointer',
                  background: saving ? MUTE : INK, border: 'none',
                  fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: FONT,
                  boxShadow: '0 8px 24px rgba(23,28,26,0.25)',
                }}
              >
                {saving ? 'Creando cuentas…' : 'Crear mis cuentas →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 3: listo ── */}
        {step === 'done' && (
          <div style={{ maxWidth: 520, margin: '40px auto 0', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 22px',
              background: 'rgba(143,168,143,0.16)', border: `2px solid ${SAGE}`,
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={SAGE_DEEP} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: INK, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              ¡Todo listo{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, marginBottom: 30 }}>
              {createdCount > 0
                ? `Creamos ${createdCount} ${createdCount === 1 ? 'cuenta' : 'cuentas'} en tu espacio. Ya puedes registrar ingresos, gastos y metas de ahorro.`
                : 'Tu espacio está preparado. Ya puedes registrar ingresos, gastos y metas de ahorro.'}
            </p>
            <button
              onClick={onFinish}
              style={{
                padding: '13px 30px', borderRadius: 12, cursor: 'pointer',
                background: INK, border: 'none',
                fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: FONT,
                boxShadow: '0 8px 24px rgba(23,28,26,0.25)',
              }}
            >
              Ir a mi dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
