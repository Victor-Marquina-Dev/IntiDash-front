'use client';

import React from 'react';
import { C } from '@/lib/colors';

interface LoginScreenProps {
  loading: boolean;
  errorMessage: string;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string) => Promise<boolean>;
}

export function LoginScreen({ loading, errorMessage, onLogin, onRegister }: Readonly<LoginScreenProps>) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const ok = mode === 'login'
      ? await onLogin(email, password)
      : await onRegister(name, email, password);
    if (!ok) setSubmitting(false);
  }

  const disabled = loading || submitting;
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    fontFamily: 'var(--font-ui), system-ui, sans-serif',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: C.bg,
      color: C.text,
      fontFamily: 'var(--font-ui), system-ui, sans-serif',
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: 380,
        padding: 28,
        borderRadius: 18,
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: '0 24px 70px rgba(20,24,18,0.12)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.olive, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Florin
        </div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 26, lineHeight: 1.1, letterSpacing: -0.8 }}>
          {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
        </h1>
        <p style={{ margin: '0 0 22px', fontSize: 13, color: C.textMute, lineHeight: 1.5 }}>
          {mode === 'login' ? 'Entra con tu usuario registrado.' : 'Registrate para usar tu dashboard financiero.'}
        </p>

        {mode === 'register' && (
          <>
            <label style={{ display: 'block', fontSize: 11, color: C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>
              Nombre
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={event => setName(event.target.value)}
              required
              disabled={disabled}
              style={{ ...inputStyle, marginBottom: 14 }}
            />
          </>
        )}

        <label style={{ display: 'block', fontSize: 11, color: C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          disabled={disabled}
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 11, color: C.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, margin: '14px 0 6px' }}>
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          disabled={disabled}
          style={inputStyle}
        />

        {errorMessage && (
          <div style={{
            marginTop: 14,
            padding: '9px 11px',
            borderRadius: 9,
            background: 'rgba(200,60,60,0.08)',
            border: '1px solid rgba(200,60,60,0.22)',
            color: C.neg,
            fontSize: 12,
          }}>
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          style={{
            width: '100%',
            marginTop: 18,
            padding: '11px 16px',
            borderRadius: 11,
            border: 'none',
            background: disabled ? C.border : C.olive,
            color: disabled ? C.textMute : '#fff',
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--font-ui), system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {disabled ? (mode === 'login' ? 'Entrando...' : 'Creando...') : (mode === 'login' ? 'Entrar' : 'Registrarme')}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setMode(current => current === 'login' ? 'register' : 'login');
            setSubmitting(false);
          }}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '9px 12px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: 'transparent',
            color: C.textDim,
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--font-ui), system-ui, sans-serif',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}
        </button>
      </form>
    </main>
  );
}
