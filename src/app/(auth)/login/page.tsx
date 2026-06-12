'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/LogoMark';
import { CtaButton } from '@/components/landing/CtaButton';
import { useAuth } from '@/shared/hooks/use-auth';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, errorMessage: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextUrl = searchParams.get('next') || '/app';

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(nextUrl);
    }
  }, [status, router, nextUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Completa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const ok = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (ok) {
      router.replace(nextUrl);
    } else {
      setError(authError || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: '#FAF8F4' }}
    >
      <div className="w-full max-w-[400px]">
        <Link href="/" className="inline-block mb-10">
          <LogoMark variant="dark" size="md" />
        </Link>

        <h1
          className="text-[#171C1A] font-semibold mb-2 leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)' }}
        >
          Bienvenido de vuelta
        </h1>
        <p className="text-[15px] text-[#5A6661] mb-8">
          ¿Primera vez?{' '}
          <Link href="/registro" className="text-[#059669] font-medium no-underline hover:underline">
            Crea tu cuenta gratis
          </Link>
        </p>

        {error && (
          <div
            className="rounded-[10px] px-4 py-3 text-[14px] text-[#CF9C9C] mb-6"
            style={{ background: 'rgba(207,156,156,0.1)', border: '1px solid rgba(207,156,156,0.3)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#5A6661] mb-1.5">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] outline-none transition-all duration-150"
              style={{ border: '1px solid rgba(10,46,34,0.15)', background: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(10,46,34,0.15)')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-[13px] font-medium text-[#5A6661]">
                Contraseña
              </label>
              <span className="text-[12px] text-[#9AA5A0]">¿Olvidaste tu contraseña?</span>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] outline-none transition-all duration-150"
              style={{ border: '1px solid rgba(10,46,34,0.15)', background: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(10,46,34,0.15)')}
            />
          </div>

          <CtaButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </CtaButton>
        </form>

        <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid rgba(10,46,34,0.06)' }}>
          <Link
            href="/demo"
            className="text-[14px] text-[#5A6661] hover:text-[#059669] transition-colors no-underline"
          >
            ▷ Ver demo sin registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
