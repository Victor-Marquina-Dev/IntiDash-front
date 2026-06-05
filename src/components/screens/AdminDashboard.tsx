'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { useAdminDashboard } from '@/shared/hooks/use-admin-dashboard';
import type { AuthUser } from '@/shared/services/auth.service';

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: Readonly<AdminDashboardProps>) {
  const { summary, users, status, errorMessage, refresh } = useAdminDashboard();
  const isLoading = status === 'loading';
  const cards = [
    ['Usuarios registrados', summary?.usersTotal ?? 0],
    ['Administradores', summary?.adminsTotal ?? 0],
    ['Usuarios normales', summary?.regularUsersTotal ?? 0],
  ] as const;

  return (
    <main style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: 'var(--font-ui), system-ui, sans-serif',
      padding: 32,
      boxSizing: 'border-box',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28,
        flexWrap: 'wrap',
      }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.card,
              color: isLoading ? C.textMute : C.textDim,
              cursor: isLoading ? 'default' : 'pointer',
              fontFamily: 'var(--font-ui), system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {isLoading ? 'Cargando' : 'Refrescar'}
          </button>
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
        </div>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
        maxWidth: 980,
      }}>
        {cards.map(([label, value]) => (
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
              {isLoading ? '-' : value}
            </div>
          </div>
        ))}
      </section>

      <section style={{
        marginTop: 20,
        maxWidth: 980,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          padding: '16px 18px',
          borderBottom: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, color: C.text }}>
              Usuarios registrados
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMute }}>
              Monitoreo basico de cuentas y roles de acceso.
            </p>
          </div>
          <span style={{ fontSize: 12, color: C.textMute, fontWeight: 700 }}>
            {users.length} cuentas
          </span>
        </div>

        {status === 'error' ? (
          <div style={{ padding: 18, color: C.danger, fontSize: 13, fontWeight: 700 }}>
            {errorMessage}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr style={{ background: C.cardHi }}>
                  {['Nombre', 'Email', 'Rol', 'Creado'].map(label => (
                    <th key={label} style={{
                      padding: '11px 14px',
                      textAlign: 'left',
                      color: C.textMute,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(account => (
                  <tr key={account.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: '13px 14px', color: C.text, fontSize: 13, fontWeight: 800 }}>
                      {account.name}
                    </td>
                    <td style={{ padding: '13px 14px', color: C.textDim, fontSize: 13 }}>
                      {account.email}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        padding: '4px 9px',
                        background: account.role === 'admin' ? C.infoSoft : C.successSoft,
                        color: account.role === 'admin' ? C.info : C.success,
                        fontSize: 12,
                        fontWeight: 800,
                      }}>
                        {account.role}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', color: C.textMute, fontSize: 13 }}>
                      {formatDate(account.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && users.length === 0 ? (
              <div style={{ padding: 18, color: C.textMute, fontSize: 13 }}>
                Todavia no hay usuarios registrados.
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  if (date.getFullYear() < 2000) return '-';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
