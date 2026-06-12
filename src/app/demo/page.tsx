'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/shared/services/auth.service';
import { LogoMark } from '@/components/landing/LogoMark';

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .startDemo()
      .then(() => router.replace('/app'))
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'La demo no está disponible. Intenta más tarde.'
        );
      });
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: '#FAF8F4',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <LogoMark variant="dark" size="lg" />

      {error ? (
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: '#CF9C9C', fontSize: 15, marginBottom: 16 }}>{error}</p>
          <Link
            href="/"
            style={{ color: '#059669', fontSize: 14, textDecoration: 'none' }}
          >
            ← Volver al inicio
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 18,
              border: '2.5px solid #059669',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <p style={{ color: '#5A6661', fontSize: 15 }}>Abriendo la demo…</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
