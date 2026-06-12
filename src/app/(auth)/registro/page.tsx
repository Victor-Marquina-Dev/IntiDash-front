'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/LogoMark';
import { CtaButton } from '@/components/landing/CtaButton';
import { useAuth } from '@/shared/hooks/use-auth';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['', '#CF9C9C', '#FCD34D', '#059669', '#059669'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(10,46,34,0.1)' }}
          />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[score] || '#9AA5A0' }}>
        Contraseña {labels[score]}
      </p>
    </div>
  );
}

export default function RegistroPage() {
  const router = useRouter();
  const { register, errorMessage: authError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Tu nombre es requerido';
    if (!email.includes('@')) errs.email = 'Ingresa un email válido';
    if (password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden';
    if (!terms) errs.terms = 'Debes aceptar los términos';
    return errs;
  }, [name, email, password, confirm, terms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setError('');
    const ok = await register(name.trim(), email.trim().toLowerCase(), password);
    setLoading(false);
    if (ok) {
      router.replace('/app?onboarding=1');
    } else {
      setError(authError || 'Error al crear la cuenta. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#FAF8F4' }}>
      {/* Panel izquierdo: formulario */}
      <div className="flex flex-col justify-center px-6 py-16 lg:px-16">
        <div className="max-w-[420px] w-full mx-auto">
          <Link href="/" className="inline-block mb-10">
            <LogoMark variant="dark" size="md" />
          </Link>

          <h1
            className="text-[#171C1A] font-semibold mb-2 leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 36px)' }}
          >
            Crea tu cuenta gratis
          </h1>
          <p className="text-[15px] text-[#5A6661] mb-8">
            Sin tarjeta. Lista en 2 minutos.{' '}
            <Link href="/login" className="text-[#059669] font-medium no-underline hover:underline">
              ¿Ya tienes cuenta?
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
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-[#5A6661] mb-1.5">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] transition-all duration-150 outline-none"
                style={{
                  border: `1px solid ${fieldErrors.name ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)'}`,
                  background: '#fff',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.name ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)')}
              />
              {fieldErrors.name && <p className="mt-1 text-[12px] text-[#CF9C9C]">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
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
                className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] transition-all duration-150 outline-none"
                style={{
                  border: `1px solid ${fieldErrors.email ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)'}`,
                  background: '#fff',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.email ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)')}
              />
              {fieldErrors.email && <p className="mt-1 text-[12px] text-[#CF9C9C]">{fieldErrors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-[#5A6661] mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] transition-all duration-150 outline-none"
                style={{
                  border: `1px solid ${fieldErrors.password ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)'}`,
                  background: '#fff',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.password ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)')}
              />
              <PasswordStrength password={password} />
              {fieldErrors.password && <p className="mt-1 text-[12px] text-[#CF9C9C]">{fieldErrors.password}</p>}
            </div>

            {/* Confirmación */}
            <div>
              <label htmlFor="confirm" className="block text-[13px] font-medium text-[#5A6661] mb-1.5">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                className="w-full h-11 px-4 rounded-[10px] text-[15px] text-[#171C1A] transition-all duration-150 outline-none"
                style={{
                  border: `1px solid ${fieldErrors.confirm ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)'}`,
                  background: '#fff',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.confirm ? 'rgba(207,156,156,0.8)' : 'rgba(10,46,34,0.15)')}
              />
              {fieldErrors.confirm && <p className="mt-1 text-[12px] text-[#CF9C9C]">{fieldErrors.confirm}</p>}
            </div>

            {/* Términos */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#059669] flex-shrink-0"
              />
              <label htmlFor="terms" className="text-[13px] text-[#5A6661] leading-[1.5]">
                Acepto los{' '}
                <Link href="/terminos" className="text-[#059669] hover:underline">Términos de servicio</Link>
                {' '}y la{' '}
                <Link href="/privacidad" className="text-[#059669] hover:underline">Política de privacidad</Link>
              </label>
            </div>
            {fieldErrors.terms && <p className="text-[12px] text-[#CF9C9C] -mt-3">{fieldErrors.terms}</p>}

            <CtaButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
            </CtaButton>
          </form>
        </div>
      </div>

      {/* Panel derecho: beneficios (solo desktop) */}
      <div
        className="hidden lg:flex flex-col justify-center px-16"
        style={{ background: '#0A2E22' }}
      >
        <h2
          className="text-white font-semibold mb-8 leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 36 }}
        >
          Tu mejor decisión financiera comienza aquí.
        </h2>
        <ul className="list-none m-0 p-0 flex flex-col gap-6">
          {[
            ['🎯', 'Metas con progreso visual', 'Define cuánto quieres ahorrar y mira cómo avanzas.'],
            ['📊', 'Dashboard en 5 segundos', 'Balance, ingresos, gastos y categorías de un vistazo.'],
            ['💡', 'Insights automáticos', 'Detecta fugas de dinero sin revisar cada transacción.'],
            ['🔒', 'Tus datos, solo tuyos', 'Cifrado AES-256. Nunca compartimos ni vendemos tus datos.'],
          ].map(([emoji, title, desc]) => (
            <li key={title} className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
              <div>
                <p className="text-[15px] font-semibold text-white mb-1">{title}</p>
                <p className="text-[14px] text-[#A7C4B5] leading-[1.5]">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
