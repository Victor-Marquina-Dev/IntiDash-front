'use client';

import React from 'react';
import { C } from '@/lib/colors';
import type { AuthUser } from '@/shared/services/auth.service';

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: Readonly<AdminDashboardProps>) {
  return (
    <main style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: 'var(--font-ui), system-ui, sans-serif',
      padding: 32,
      boxSizing: 'border-box',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, color: C.olive, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Admin
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, letterSpacing: -1 }}>
            Monitoreo de usuarios
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, color: C.textMute }}>
            {user.email}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.card,
            color: C.textDim,
            cursor: 'pointer',
            fontFamily: 'var(--font-ui), system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Cerrar sesion
        </button>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 16,
        maxWidth: 980,
      }}>
        {[
          ['Usuarios registrados', 'Pendiente'],
          ['Usuarios activos', 'Pendiente'],
          ['Actividad reciente', 'Pendiente'],
        ].map(([label, value]) => (
          <div key={label} style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ fontSize: 11, color: C.textMute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {label}
            </div>
            <div style={{ marginTop: 12, fontSize: 22, color: C.text, fontWeight: 800 }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <div style={{
        marginTop: 20,
        maxWidth: 980,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 20,
        color: C.textMute,
        fontSize: 13,
        lineHeight: 1.6,
      }}>
        Este panel queda listo para conectar metricas reales: lista de usuarios, ultimo acceso, estado de sincronizacion y resumen financiero por usuario.
      </div>
    </main>
  );
}
